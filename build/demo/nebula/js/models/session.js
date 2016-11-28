/**
 * Used to hold and manipulate session variables
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class Session
 */
var Session = Class.extend({



  /**
   * The constructor method
   */
  init : function() {

    //resume value is true by default, value updated in this.start
    this.resume = 1;
    this.time = {
      start: 0,
      stop: 0
    };

    //make _app.session.data to be a private member
    var l_data = {};



    /**
     * Retreive all data stored in session
     */
    this.data = function() {
      return l_data;
    };



    /**
     * Stores key/value in session memory for later retrieval
     * overwrites existing data
     */
    this.set = function(p_key, p_value) {
      l_data[p_key] = p_value;
      return true;
    };



    /**
     * Stores key/value in session memory for later retrieval
     * add to existing data as an array
     */
    this.add = function(p_key, p_value) {

      var l_storedValue = this.get(p_key);

      if (l_storedValue == undefined) {
        this.set(p_key, [p_value]);
        return true;
      }
      else {
        //make sure stored data is an array
        if (! (l_storedValue instanceof Array)) {
          l_storedValue = [l_storedValue];
        }

        //overwrite if exists
        if (p_key == 'cmi.suspend_data') {

          var l_count = l_storedValue.length;

          for (var i = 0; i < l_count; i++) {
            //match the id's
            if (p_value[0] == l_storedValue[i][0]) {
              l_storedValue[i] = p_value;
              this.set(p_key, l_storedValue);
              return true;
            }
          }
        }

        l_storedValue.push(p_value);
        this.set(p_key, l_storedValue);
        return true;
      }
    };



    /**
     * Get an item stored in the session memory
     */
    this.get = function(p_key) {
      return l_data[p_key];
    };


    /**
     * Delete an item stored in session
     */
    this.remove = function(p_key) {
      delete l_data[p_key];
    };

  },




  /*
   * Retrieves the data from the LMS and stores it into session memory
   * @todo should probably connect to scorm api in here
   */
  start : function(p_callback) {

    //capture start time
    var l_status = '';

    this.time.start = Date.now();
    //update session resume value (is true by default)
    this.resume = Number(_app.structure.course.settings.resume_session);

    //check for LMS connection
    if (_app.scorm.connected) {
      l_status = _app.scorm.retrieve('cmi.core.lesson_status');
      //if the course is completed disconnect the scorm api
      //so it doesnt add anymore data to the LMS
      switch (l_status) {
        case 'passed':
        case 'completed':
        case 'failed':
          _app.scorm.disconnect();
          break;
        case 'not attempted':
          this.set('cmi.core.lesson_status', 'incomplete');
          _app.scorm.save();
          break;
      }

      if (this.resume) {
        _app.scorm.retrieveAll(p_callback);
      }
      else {
        //zero the score
        this.set('cmi.core.score.raw', '0');
        this.set('cmi.core.score.max', '100');
        this.set('cmi.core.score.min', '0');
        _app.scorm.save(p_callback);
      }
    }
    else {
      if (p_callback != undefined) p_callback();
    }
  },



  /**
   * End the session by dumping lms data, then close the connection
   */
  end : function(p_callback) {

    //check for LMS connection
    if (_app.scorm.connected) {

      //capture stop time
      var l_timeTaken = 0;

      //check if time is already recorded
      if (this.time.stop < 1) {
        this.time.stop = Date.now();
        l_timeTaken = this.time.stop - this.time.start;
        this.set('cmi.core.session_time', l_timeTaken.toScormTimeString());
      }

      //check course status
      this.checkCompletion(function() {
        //call callback
        if (p_callback) p_callback();
        //close the scorm connection
        _app.scorm.close();
      });

      return true;
    }

    return false;
  },



  /**
   * Gets the user data for a page
   * (needs an underscore in th
   */
  getUserData : function(p_id) {

    var l_id = p_id || _app.currentPage.id,
        l_userData = this.get('cmi.suspend_data') || [],
        l_count = l_userData.length;

    for (var i = 0; i < l_count; i++) {
      if (l_userData[i][0] == l_id) {
        return l_userData[i];
      }
    }

    return false;
  },


  /**
   * Overwrites a userdata entry based on page id in p_data
   * eg. p_data = ['id', 0, undefined] etc.
   * else it adds it to the suspend_data
   */
  setUserData : function(p_data) {

    var l_id = p_data[0],
        l_userData = this.get('cmi.suspend_data') || [],
        l_count = l_userData.length;

    for (var i = 0; i < l_count; i++) {
      if (l_userData[i][0] == l_id) {
        l_userData[i] = p_data;
        return;
      }
    }

    //if we get here, there was no entry. add it
    this.add('cmi.suspend_data', p_data);
  },


  /**
   * Removes a userdata entry based on page id in p_data
   * eg. p_data = ['id', 0, undefined] etc.
   * else it adds it to the suspend_data
   */
  unsetUserData : function(p_id) {

    var l_id = p_id || _app.currentPage.id,
        l_userData = this.get('cmi.suspend_data') || [],
        l_count = l_userData.length;

    for (var i = 0; i < l_count; i++) {
      if (l_userData[i][0] == l_id) {
        l_userData.splice(i, 1);
        return;
      }
    }
  },



  /**
   * Checks if the given topic is completed by checking the user data of each child page
   */
  getTopicCompletion : function(p_id) {

    var l_topics = _app.structure.getTopics(),
        l_topicCount = l_topics.length,
        l_pages = [],
        l_pageCount = 0,
        l_pageData = [],
        l_complete = true;

    for (var i = 0; i < l_topicCount; i++) {

      if (l_topics[i].id === p_id) {
        l_pages = $.makeArray(l_topics[i].children.item);
        l_pageCount = l_pages.length;

        for (var j = 0; j < l_pageCount; j++) {
          l_pageData = this.getUserData(l_pages[j].id);

          //is there data for this page?
          if (l_pageData) {
            //if the result is -2, the page was only viewed
            if (l_pageData[1] === -2) {
              return false;
            }
          }
          else {
            return false;
          }
        }
        //topic was found, we can exit the loop
        break;
      }
    }

    return l_complete;
  },



  getTopicCompletionPercent : function(p_id) {

    var l_topics = _app.structure.getTopics(),
        l_topicCount = l_topics.length,
        l_pages = [],
        l_pageCount = 0,
        l_pageData = [],
        l_complete = 0;

    for (var i = 0; i < l_topicCount; i++) {

      if (l_topics[i].id === p_id) {
        l_pages = $.makeArray(l_topics[i].children.item);
        l_pageCount = l_pages.length;

        for (var j = 0; j < l_pageCount; j++) {
          l_pageData = this.getUserData(l_pages[j].id);

          //is there data for this page?
          if (l_pageData && l_pageData[1] !== -2) {
            //if the result is -2, the page was only viewed
            l_complete++;
          }
        }
        //topic was found, we can exit the loop
        break;
      }
    }

    return Math.round((l_complete / l_pageCount) * 100);
  },



  /**
   * Look through stored data and determine if course is complete.
   * Save some of that data to the session to be sent to LMS at later time.
   */
  checkCompletion : function(p_callback) {

    var l_topics = _app.structure.getTopics(),
        l_topicCount = l_topics.length,
        l_topic = {},
        l_topicId = '',
        l_topicStatus = '',
        l_topicCompleted = true,
        l_allTopicsCompleted = true,
        l_topicRawScore = 0,
        l_topicMaxScore = 0,
        l_topicPercent = 0,
        l_pages = {},
        l_pageCount = 0,
        l_page = {},
        l_pageData = [],
        l_summaryReached = false,
        l_lessonStatus = 'incomplete',
        l_moduleAssessed = false,
        l_moduleCompleted = true,
        l_moduleRawScore = 0,
        l_moduleMaxScore = 0,
        l_modulePercent = 0,
        l_timeTaken = 0,
        l_forceComplete = Number(_app.structure.course.settings.force_complete);

    //loop through all topics in the structure
    for (var i = 0; i < l_topicCount; i++) {
      l_topic = l_topics[i];
      l_topicId = l_topic.title.truncate(250, l_topic.id);
      l_topicStatus = 'not attempted';
      l_topicCompleted = true;
      l_topicRawScore = 0;
      l_topicMaxScore = 0;

      //add topic identifier to session
      this.set('cmi.objectives.'+ i +'.id', l_topicId);

      l_pages = $.makeArray(l_topic.children.item);
      l_pageCount = l_pages.length;

      //loop through all pages in this topic structure
      for (var j = 0; j < l_pageCount; j++) {
        l_page = l_pages[j];
        l_pageData = this.getUserData(l_page.id);

        //is there session data for this page?
        if (l_pageData.length) {
          //what did it score?
          switch (l_pageData[1]) {
            case 0:
              l_topicMaxScore++;
              break;
            case 1:
              l_topicMaxScore++;
              l_topicRawScore++;
              break;
          }
          //at least one item was looked at
          l_topicStatus = 'incomplete';

          //check if any of these are summary pages
          if (l_page.type === 'mp_summary') {
            //we know the user at least saw the summary page
            l_summaryReached = true;
          }
        }
        else {
          //if there was no page data on at least one page, the topic wasnt completed
          l_topicCompleted = false;
          l_allTopicsCompleted = false;
        }
      }

      //is the topic assessed
      if (l_topic.assessable === 'true') {
        //module is assessed
        l_moduleAssessed = true;

        //is the topic completed
        if (l_topicCompleted) {
          l_topicStatus = 'completed';

          //append topic scores to overall module score
          l_moduleRawScore += l_topicRawScore;
          l_moduleMaxScore += l_topicMaxScore;

          //calculate topic percent
          l_topicPercent = (l_topicRawScore / l_topicMaxScore) * 100;
          l_topicPercent = Math.round(l_topicPercent * 100) / 100;
          l_topicPercent = isNaN(l_topicPercent) ? 0 : l_topicPercent;

          //add topic scores to session
          this.set('cmi.objectives.'+ i +'.score.raw', l_topicPercent);
          this.set('cmi.objectives.'+ i +'.score.max', '100');
          this.set('cmi.objectives.'+ i +'.score.min', '0');
        }
        else {
          l_moduleCompleted = false;
        }
      }

      //add topic status to session
      this.set('cmi.objectives.'+ i +'.status', l_topicStatus);
    }

    //did the user complete the module?
    if (l_moduleCompleted) {
      l_lessonStatus = 'completed';

      //was there at least one assessment topic
      if (l_moduleAssessed) {
        //calculate module percent
        l_modulePercent = (l_moduleRawScore / l_moduleMaxScore) * 100;
        l_modulePercent = Math.round(l_modulePercent * 100) / 100;
        l_modulePercent = isNaN(l_modulePercent) ? 0 : l_modulePercent;

        //add score to session
        this.set('cmi.core.score.raw', l_modulePercent);
        this.set('cmi.core.score.max', '100');
        this.set('cmi.core.score.min', '0');

        //we need to save score points and percent for use on summary page
        this.setUserData(['score', l_moduleRawScore, l_moduleMaxScore, l_modulePercent]);

        //check if passed
        if (l_modulePercent >= Number(_app.structure.course.settings.pass_mark)) {
          l_lessonStatus = 'passed';
        }
        else {
          l_lessonStatus = 'failed';
        }

        //record time
        if (this.time.stop < 1) {
          this.time.stop = Date.now();
          l_timeTaken = this.time.stop - this.time.start;
          this.set('cmi.core.session_time', l_timeTaken.toScormTimeString());
        }
      }
      else {
        //In a non-assessed topic the user has to complete all the topics
        if (! l_allTopicsCompleted) {
          l_lessonStatus = 'incomplete';
        }
      }
    }

    //can the user skip all the pages?
    if (! l_moduleAssessed && l_forceComplete && l_summaryReached) {
      l_lessonStatus = 'completed';
    }

    //non resuming courses have different rules (qbe quirk)
    if (! this.resume) {
      switch (l_lessonStatus) {
        case 'passed':
          l_lessonStatus = 'completed';
          break;
        case 'failed':
          l_lessonStatus = 'incomplete';
          break;
      }
    }

    //update the lesson status
    this.set('cmi.core.lesson_status', l_lessonStatus);

    if (p_callback) p_callback();
  },



  /**
   * Retreives comments stored for a page
   */
  getComments : function(p_id) {

    var l_comments = this.get('comments') || [],
        l_count = l_comments.length,
        l_pageComments = [];

    //loop through and find the item with this id, last entry will be returned
    for (var i = 0; i < l_count; i++) {
      if (l_comments[i][0] === p_id) {
        l_pageComments = l_comments[i][1];
      }
    }

    return l_pageComments;
  },



  /**
   * Stores comments for a page
   */
  setComments : function(p_id, p_comments) {

    var l_comments = $.makeArray(p_comments),
        l_stored = this.getComments(p_id);

    //only add new comment data
    if (JSON.stringify(l_comments) !== JSON.stringify(l_stored)) {
      //add to session comments
      this.add('comments', [p_id, l_comments]);

      //immediately save to lms
      _app.scorm.send('cmi.comments', [p_id, l_comments]);
      _app.scorm.commit();
    }
  }

});
