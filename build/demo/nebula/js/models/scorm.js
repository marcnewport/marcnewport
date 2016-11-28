/**
 * Used to save and retrieve SCORM data, using CTC's SCORM API (js/utilities/api.js)
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class Scorm
 *
 * @todo stop sending undefined for objective scores
 */
var Scorm = Class.extend({



  /**
   * The constructor method
   */
  init : function() {

    this.API = null;
    this.connected = false;
    this.connectAttempts = 0;
    this.maxAttempts = 5;
    this.writeAccess = false;
    this.debug = true;

    //create a private cache variable that can be read via a function
    var l_cache = {};
    this.cache = function(l_item, l_data) {
      if (l_data != undefined) {
        l_cache[l_item] = l_data;
      }
      else {
        return l_cache[l_item];
      }
    }
  },



  /**
   * Search for the API property in the window or parent (based upon rustici algorithm)
   */
  connect : function(p_callback) {

    var l_scope = this,
        l_api = null,
        l_maxCrawls = 7,
        l_windows = [window, window.opener],
        l_window = {};

    //search current window and then its opener
    for (var a in l_windows) {
      l_window = l_windows[a];
      if (l_window != null) {
        //crawl up the DOM via parent property
        for (var i = 0; i < l_maxCrawls; i++) {
          if (l_window.API != null) {
            l_api = l_window.API;
            break;
          }
          else if (l_window.parent != null && l_window.parent != l_window) {
            l_window = l_window.parent;
          }
        }
      }
    }

    //check if we found the API
    if (l_api != null) {
      //found it! now call initialise to start communication
      if (l_api.LMSInitialize('') == 'true') {
        this.API = l_api;
        this.connected = true;
        this.writeAccess = true;
        this.log("API.LMSInitialize('') = true");
      }
    }

    //if we're connected do callback, otherwise check attempts and try again
    if (this.connected) {
      if (p_callback) p_callback();
    }
    else {
      if (this.connectAttempts < this.maxAttempts) {
        setTimeout(function() {
          l_scope.connectAttempts++;
          l_scope.connect(p_callback);
        }, 500);
      }
      else {
        //attempts exhausted, show error but continue anyway
        this.log("API.LMSInitialize('') = false");
        this.error();
        if (p_callback) p_callback();
      }
    }
  },



  /**
   * Send data to the LMS to be committed at a later time
   */
  send : function(p_key, p_value) {

    var l_value,
        l_result = 'false';

    if (this.connected && this.writeAccess) {
      l_value = p_value;

      //make the value a string if it aint
      if (typeof l_value == 'object') {
        l_value = JSON.stringify(l_value);
        //swap out tilde character for entity so we can use it for quotes - some LMS's cannot handle double quotes
        l_value = l_value.split('~').join('&#126;');
        l_value = l_value.split('"').join('~');

        //null is stored often in the suspend_data string - use a single character to save space
        if (p_key === 'cmi.suspend_data') {
          //swap out exclamation for entity first
          l_value = l_value.split('!').join('&#33;');
          l_value = l_value.split('null').join('!');
        }
      }

      l_result = this.API.LMSSetValue(p_key, l_value);

      if (l_result !== 'true') {
        this.error();
      }
    }

    this.log('API.LMSSetValue(', p_key, ',', l_value, ') =', l_result);
  },



  /**
   * Commits data to the LMS
   */
  commit : function() {
    var l_result = 'false';

    if (this.connected && this.writeAccess) {
      l_result = this.API.LMSCommit('');

      if (l_result !== 'true') {
        this.error();
      }
    }

    this.log("API.LMSCommit('') =", l_result);
  },



  /**
   * Save any data that is in the session, this will compare it with the last saved
   * items and only send new data to the SCORM API.
   */
  save : function (p_callback) {

    var l_session = _app.session.data(),
        l_cache = '',
        l_data = '',
        l_dataSet = false;

    if (this.connected && this.writeAccess) {

      //look for cmi fields in the session data
      for (var item in l_session) {
        if (item.split('.')[0] === 'cmi') {
          //we can't set the interaction count
          if (item === 'cmi.interactions._count') continue;

          l_data = l_session[item];
          l_cache = this.cache(item);

          //make the value a string if it aint
          if (typeof l_data === 'object') {
            l_data = JSON.stringify(l_data);
            //swap out tilde character for entity so we can use it for quotes - some LMS's cannot handle double quotes
            l_data = l_data.split('~').join('&#126;');
            l_data = l_data.split('"').join('~');

            //null is stored often in the suspend_data string - use a single character to save space
            if (item === 'cmi.suspend_data') {
              //swap out exclamation for entity first
              l_data = l_data.split('!').join('&#33;');
              l_data = l_data.split('null').join('!');
            }
          }

          //check if there is cached data for this item
          if (l_cache === undefined) {
            //there wasn't, so check we actually have a non empty value
            if (l_data === '') continue;
          }
          else {
            //there was some cached data, is the value different?
            if (l_cache === l_data) continue;
          }

          //set the value
          this.send(item, l_data);
          //cache the new data
          this.cache(item, l_data);
          //data was set
          l_dataSet = true;
        }
      }

      //commit if data was set
      if (l_dataSet) {
        this.commit();
      }
    }

    //run the callback function if one was given
    if (p_callback) {
      setTimeout(function() {
        p_callback();
      }, 250);
    }

  },



  /**
   * Retrieve a single value from the LMS
   */
  retrieve : function(p_key) {

    var l_result;

    if (this.connected) {
      l_result = this.API.LMSGetValue(p_key);

      //check if the value is a string
      if (typeof l_result === 'string') {

        this.log("API.LMSGetValue(", p_key,") =", '"'+ l_result +'"');

        //comments are concatenated on each save - so there isn't a comma separating each save
        if (p_key === 'cmi.comments') {
          // Check if this is an old storage method for comments and emulate the new storage method
          if (l_result.indexOf('<!SPLIT!>') !== false) {
            l_result = l_result.split('<!SPLIT!>').pop();

            // Check if this is the first time we're loading from the old storage method
            if (l_result.indexOf(']]]') === l_result.length - 3) {
              l_result = l_result.substring(1, l_result.length - 1);
            }
          }

          //look for ][ and stick a comma inbetween - that way we can pop the last save off the comments array
          l_result = l_result.replace(/\]\[/g, '],[');
          l_result = '['+ l_result +']';
        }

        //convert any JSON strings back into objects
        if (l_result.indexOf('{') === 0 || l_result.indexOf('[') === 0) {
          //swap characters backout in the reverse order we stored them
          if (p_key === 'cmi.suspend_data') {
            //swap the exclamations
            l_result = l_result.split('!').join('null');
            l_result = l_result.split('&#33;').join('!');
          }
          //swap the tilde's
          l_result = l_result.split('~').join('"');
          l_result = l_result.split('&#126;').join('~');

          //un-stringify the value
          try {
            l_result = JSON.parse(l_result);
          }
          catch (e) {
            console.log(l_result);
            throw 'Could not parse JSON from SCORM field '+ p_key;
          }
        }
      }
      return l_result;
    }

    return false;
  },



  /**
   * On resuming the course this retrieves data from the LMS
   * and adds suspend data to session memory
   */
  retrieveAll : function(p_callback) {

    var l_data = '',
        l_fields = [],
        l_fieldCount = 0,
        l_objCount = 0,
        l_objFields = [],
        l_objFieldsCount = 0,
        l_success = false;

    if (this.connected) {
      //fields we care about
      l_fields = [
        'cmi.core.lesson_location',
        'cmi.core.lesson_status',
        'cmi.core.score.raw',
        'cmi.core.score.max',
        'cmi.suspend_data',
        'cmi.interactions._count'
      ];
      l_fieldCount = l_fields.length;

      //loop through each field
      for (var i = 0; i < l_fieldCount; i++) {
        //get the stored value
        l_data = this.retrieve(l_fields[i]);

        if (l_data !== '') {
          //add to the session and cache
          _app.session.set(l_fields[i], l_data);
          this.cache(l_fields[i], l_data);
        }
      }

      l_objCount = this.retrieve('cmi.objectives._count');

      //also lets get the objective data
      for (var j = 0; j < l_objCount; j++) {
        //fields we want
        l_objFields = [
          'cmi.objectives.'+ j +'.id',
          'cmi.objectives.'+ j +'.status',
          'cmi.objectives.'+ j +'.score.raw',
          'cmi.objectives.'+ j +'.score.min',
          'cmi.objectives.'+ j +'.score.max'
        ];
        l_objFieldsCount = l_objFields.length;

        //loop through them a nd look for data
        for (var k = 0; k < l_objFieldsCount; k++) {
          l_data = this.retrieve(l_objFields[k]);

          //check if we got a value back
          if (l_data && l_data !== '') {
            _app.session.set(l_objFields[k], l_data);
            this.cache(l_objFields[k], l_data);
          }
        }
      }

      //pickup the comment data
      l_data = this.retrieve('cmi.comments');

      if (l_data !== '') {
        _app.session.set('comments', l_data);
      }

      //success = probably
      l_success = true;
    }

    if (p_callback != undefined) {
      setTimeout(p_callback, 1000);
    }

    return l_success;
  },



  /**
   * Disconnect from the LMS
   */
  disconnect : function() {
    this.writeAccess = false;
    this.enableBrowserWarning(false);
  },



  /**
   * Tell the LMS we're done
   */
  close : function() {

    var scope = this,
        l_exit = 'suspend',
        l_result = 'false';

    if (this.connected) {
      //are we resuming
      if (! _app.session.resume) {
        //check a score was set
        if (empty(_app.session.get('cmi.core.score.raw'))) {
          //there wasnt, user probably left early - set it to zero then
          _app.session.set('cmi.core.score.raw', '0');
          _app.session.set('cmi.core.score.max', '100');
          _app.session.set('cmi.core.score.min', '0');
        }
        l_exit = '';
      }

      _app.session.set('cmi.core.exit', l_exit);

      //send all the session data
      this.save(function() {
        //remove the closing catcher
        scope.enableBrowserWarning(false);
        scope.connected = false;

        //we're done (this should trigger window close in SABA if setting is on in SABA)
        l_result = scope.API.LMSFinish('');
        if (l_result !== 'true') {
          scope.error();
        }
      });
    }

    scope.log("API.LMSFinish('') =", l_result);
  },



  /**
   *
   */
  error : function() {

    var l_code = '',
        l_description = '';

    if (this.connected) {
      l_code = this.API.LMSGetLastError();
      l_description = this.API.LMSGetDiagnostic(l_code);

      trace('LMS ERROR '+ l_code +': '+ l_description, 2);
    }
  },



  /**
   * retrieve objective data from the LMS
   *
   * @param p_topic
   *    The topic object to retrieve
   */
  retrieveObjectiveData : function(p_topic) {

    var l_identifier = '',
        l_objectiveCount = 0,
        l_found = false,
        l_data = false,
        l_raw = 0,
        l_max = 0,
        l_percent = 0;

    if (this.connected) {
      l_identifier = p_topic.title.truncate(250, p_topic.id);
      l_objectiveCount = this.retrieve('cmi.objectives._count');

      //search for an objective that has the same identifier
      for (var i = 0; i < l_objectiveCount; i++) {
        if (this.retrieve('cmi.objectives.'+ i +'.id') == l_identifier) {
          l_found = true;
          break;
        }
      }

      //pull its data if we found it
      if (l_found) {

        l_raw = Number(this.retrieve('cmi.objectives.'+ i +'.score.raw'));
        l_max = Number(this.retrieve('cmi.objectives.'+ i +'.score.max'));

        l_percent = (l_raw / l_max) * 100;
        l_percent = Math.round(l_percent * 100) / 100;
        l_percent = isNaN(l_percent) ? 0 : l_percent;

        l_data = {
          id: this.retrieve('cmi.objectives.'+ i +'.id'),
          status: this.retrieve('cmi.objectives.'+ i +'.status'),
          score : {
            raw: l_raw,
            max: l_max,
            percent: l_percent
          }
        };
      }
    }
    return l_data;
  },



  /**
   * Attempts to commit any unsaved data and close the connection.
   * User is alerted which adds time for the calls to be made.
   * The user should not be closing the browser, this is just a last resort save attempt.
   */
  enableBrowserWarning : function(p_enable) {

    var scope = this;

    if (p_enable) {
      window.onbeforeunload = function() {
        scope.API.LMSCommit('');
        scope.API.LMSFinish('');
        alert('You have ended your session.');
      };
    }
    else {
      window.onbeforeunload = null;
    }
  },



  /**
   * Log to the console if debugging is turned on
   */
  log : function() {
    if (_app.debug) {
      console.log.apply(console, arguments);
    }
  }

});
