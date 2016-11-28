/**
 * Navigates through course pages
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class Sequence
 */
var Sequence = Class.extend({



  /**
   * Loads the xml of the page's id you pass it
   */
  getData : function(p_pageId) {

    var l_cacheBuster = '?cacheBuster='+ _app.structure.course.settings.cache_buster,
        l_xmlPath = './data/'+ p_pageId +'.xml'+ l_cacheBuster,
        l_data = {};

    //check we're not trying to retrieve the course_id.xml
    //because that is called structue.xml and is already loaded
    if (p_pageId != _app.structure.course.id) {

      //do the ajax request
      $.ajax({
        type: 'GET',
        url: l_xmlPath,
        dataType: 'xml',
        async: false,
        success: function(p_data) {
          //convert the xml structure to json
          l_data = $.xml2json(p_data);

          //check for parsing error
          if (l_data.text != undefined) {
            var l_dataString = String(l_data);

            //show the error message in the console
            if (l_dataString.indexOf('XML Parsing Error') > -1) {
              trace(l_dataString);
            }
          }
        },
        error: function(p_response, p_status, p_error) {
          //show the error message in the console
          trace('Could not load "'+ l_xmlPath +"\"\r\n"+ p_status +': '+ p_error.name);
        }
      });
    }

    return l_data;
  },



  /**
   * Goes to the page with the specified id
   * Removes any unneeded data references and dom elements
   */
  goTo : function(p_pageId, p_direction) {

    var l_data = this.getData(p_pageId);

    //pause any audio on the page
    if (_app.currentPage.audio) _app.currentPage.audio.pause();
    //call the destroy method of the page type
    if (_app.currentPage.destroy) _app.currentPage.destroy();

    //empty the current page object
    _app.currentPage = {};
    //remove content click event if exists
    _app.$content.unbind('click');

    _app.$loader.fadeIn(500, function() {
      //focus on loader so the screen reader says "Loading new page."
      //this will get shifted once loading is completed
      _app.$loader.focus();
      //remove that pesky case study vid
      _app.removePlayers('case-study');
      //remove the previous page's html
      _app.$content.empty();

      //load in the page type script and instantiate it
      $.loadScript('js/page_types/'+ l_data.type +'.js', function() {
        _app.currentPage = new window[l_data.type](l_data);

        if (_app.debug && console) {
          console.log('Location updated:', _app.structure.course.id[0], '>', _app.currentPage.id);
        }
      });
    });
  },



  /**
   * Go to the next page or next topic
   */
  next : function(p_id) {

    var scope = this,
        l_id = p_id || _app.currentPage.id,
        l_next = _app.structure.next(l_id),
        l_topic = {},
        l_nextTopic = {},
        l_notice = '',
        $overlay = [];

    //if its the last in the pool, go to the closest cousin forwards
    if (l_next == 'last') {
      //find the next topic
      l_topic = _app.structure.parent(l_id).id;
      l_nextTopic = _app.structure.getNextTopic();

      if (l_nextTopic) {
        //do we need to show an end of topic popup?
        l_notice = this.getData(l_topic).topic_notice;

        if (l_notice) {
          $overlay = _app.modalOverlay('End of topic', l_notice, 'small', 'OK');

          $overlay.bind('close.nextTopic', function() {
            l_next = _app.structure.firstViewableChild(l_nextTopic.id);
            scope.goTo(l_next.id, 'next');
            $overlay.unbind('close.nextTopic');
          });
        }
        else {
          l_next = _app.structure.firstViewableChild(l_nextTopic.id);
          scope.goTo(l_next.id, 'next');
        }
        return true;
      }
    }
    else if (typeof l_next === 'object') {
      // found page
      this.goTo(l_next.id, 'next');
      return true;
    }
    return false;
  },



  /**
   * Go to the previous page
   */
  back : function(p_id) {

    var l_id = p_id || _app.currentPage.id,
        l_back = _app.structure.previous(l_id),
        l_parent = {},
        l_backTopic = {},
        l_backFromParent = {};

    //are we at the first item in the pool
    if (l_back === 'first') {
      l_parent = _app.structure.parent(l_id);

      //does it have a parent item
      if (l_parent) {
        l_backTopic = _app.structure.getPreviousTopic();
        l_backFromParent = _app.structure.previous(l_parent.id);

        if (l_backTopic) {
          //there is a topic before this one, go to its last item
          l_back = _app.structure.lastViewableChild(l_backTopic.id);
        }
        else if (l_backFromParent.type === 'mp_diagram') {
          //otherwise if we find a diagram page (at the topic level before this topic), go to that
          l_back = l_backFromParent;
        }
      }
    }

    if (typeof l_back === 'object') {
      this.goTo(l_back.id, 'back');
      return true;
    }

    return false;
  },



  /**
   * Exit the course
   */
  exit : function() {

    var l_top = 0,
        $message = [];

    _app.removePlayers();

    //check if we are connected to the LMS
    if (_app.scorm.connected) {
      //call the destroy method of the page type
      if (_app.currentPage.destroy) _app.currentPage.destroy();

      //show we're saving
      l_top = ($(window).height() / 2) + 50;
      $message = $$('p').html('Saving data...').css({ top:l_top +'px' });

      //remove stuff from the dom and just show loader
      _app.$body.html($$('div', 'loader').css('display', 'block')
        .append($$('div', '','inner'))
        .append($message));

      //remove reference to the current page
      _app.currentPage = {};

      //save all data in the session
      _app.session.end(function() {
        setTimeout(function() {

          var $exitBox = $$('div', 'exit-box');
          //let the user know we're done saving
          _app.$body
            .html($exitBox
              .append($$('div', '', 'title').html(_app.structure.course.course_save_title))
              .append($$('div', '', 'content').html(_app.structure.course.course_save_content))
              .css('margin-top', l_top - 125 +'px'));

          setTimeout(function() {
            //try to close the popup window
            if (window.opener) {
              window.close();
            }
            if (window.top.opener) {
              //try the moodle function
              if (window.close_window) {
                window.close_window({ preventDefault:false });
              }
              window.top.close();
            }
          }, 2000);

        }, 2000);
       });
    }
    else {
      //just close the window if not connected to LMS

      //remove stuff from the dom
      _app.$body.empty();

      //remove reference to the current page
      _app.currentPage = {};

      //try to close the popup window
      if (window.opener) {
        window.close();
      }
      if (window.top.opener) {
        //try the moodle function
        if (window.close_window) {
          window.close_window({ preventDefault:false });
        }
        window.top.close();
      }
    }
  }
});
