/**
 * The functionality for a video activity page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_video_activity
 * @extends PageType
 */
var mp_mid_video_activity = PageType.extend({


  /**
   * Builds the page types html markup
   */
  setup : function() {

    //load child activity class scripts for use later
    $.loadScript('js/page_types/mp_timecode_activity.js', function() {
        $.loadScript('js/page_types/mp_timecode_checklist.js');
        $.loadScript('js/page_types/mp_timecode_multiple_choice.js');
        $.loadScript('js/page_types/mp_timecode_text_dialogue.js');
        $.loadScript('js/page_types/mp_timecode_true_false.js');
    });

    this.position = 0;
    this.timecodes = $.makeArray(this.data.timecodes.item);
    this.timecode = {};
    this.TimecodeActivity = {};
    this.activityIndex = 0;
    this.userData = _app.session.getUserData(this.id)[2] || {};
    this.video = { width:628, height:353 };

    var $main = $$('div', 'main-text'),
        l_title = this.data.heading ? '<h3>'+ this.data.heading +'</h3>' : '',
        $video = $$('div', 'video-activity-'+ this.id),
        l_count = this.timecodes.length;

    this.html
      .append($main
        .append(l_title)
        .append(this.data.main))
      .append($$('div', 'video-blocker', 'hidden'))
      .append($video);

    //add timecodes to userdata
    for (var i = 0; i < l_count; i++) {
      if (empty(this.userData[this.timecodes[i].id])) {
        this.userData[this.timecodes[i].id] = [0, 0];
      }
    }

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var scope = this,
        l_video = $.makeArray(this.data.video.item)[0],
        l_player = {},
        l_description = this.data.media_description || l_video.description || '',
        l_timecodes = $.makeArray(this.data.timecodes.item),
        l_rewatching = false,
        l_userData = _app.session.getUserData(),
        l_seekto = 0,
        l_readyCalled = false,
        l_fetchingActivity = false,
        l_attempts = 0,
        l_completed = true;

    //initiate the player
    l_video.width = this.video.width;
    l_video.height = this.video.height;
    l_player = _app.setupVideoPlayer('video-activity-'+ this.id, l_video);
    l_player.listening = false;

    //insert the transcript into the main text since we got nowhere else to put it
    if (l_description.length) {
      _app.$content.find('#main-text')
        .append($$('div', '', 'media-description')
          .append('<p> </p><h5>Media Description</h5>')
          .append(l_description));
    }

    //wait for player to be ready...
    l_player.onReady(function() {
      //check if we're resuming the activity
      //for some reason when we return to this page vimeo onReady gets called twice
      if (! empty(l_userData[2]) && ! l_readyCalled) {
        //loop through timcode positions
        for (var a in l_userData[2]) {
          //check if it was completed
          if (l_userData[2][a][0] > 0) {
            //update position
            l_seekto = l_timecodes[scope.position].time;
            scope.position++;
          }
          else {
            l_completed = false;
          }
        }

        if (l_completed) {
          $('#btn-page-navigation-next').enable();
        }

        //scrub the video to the last position
        setTimeout(function() {
          var l_muted = l_player.getMute();
          l_player.setMute(true);
          l_player.seek(l_seekto);
          if (l_player.vimeo) {
            l_player.play();
          }

          setTimeout(function() {
            l_player.pause();
            l_player.setMute(l_muted);
          }, 250);
        }, 1000);
      }

      l_readyCalled = true;

      //check if all the activities were done on this page
      if (scope.position >= (scope.timecodes.length)) {
        return;
      }

      //listen for our timecodes
      l_player.onTime(function(p_event) {
        //are we already fetching an activity? does the timecode position exist?
        if (! l_fetchingActivity && l_timecodes[scope.position]) {
          //compare the time of video against the timecode position given
          if (p_event.position >= Number(l_timecodes[scope.position].time)) {
            l_player.pause();
            l_player.setFullscreen(false);
            l_player.listening = true;
            l_fetchingActivity = true;

            //wait a half second for the mouse to be released (if user has skipped ahead with scrubber)
            setTimeout(function() {
              //has this section just been re-watched?
              if (l_rewatching) {
                //capture attempts
                l_attempts = scope.TimecodeActivity.attempts;
                scope.showTimecodeActivity();
                scope.TimecodeActivity.attempts = l_attempts;
                l_rewatching = false;
                l_fetchingActivity = false;
              }
              else {
                //launch activities associated with this timecode
                scope.activityIndex = 0;
                scope.timecode = scope.timecodes[scope.position];
                scope.showTimecodeActivity();
                l_fetchingActivity = false;
              }
            }, 500);
          }
        }
      });


      //listen for a play click after a timecode is reached
//      l_player.onPlay(function() {
//        if (l_player.listening && scope.position < l_timecodes.length) {
//          scope.position++;
//          l_player.listening = false;
//        }
//      });



      /**
       * Eventhandler for back button click
       * rewatch the last video snippet
       */
      l_player.rewatchLast = function() {

        var l_seek = 0;

        //check our current position
        if (scope.position < 1) {
          //on first item go back to start
          l_seek = 0;
        }
        else if (scope.position >= l_timecodes.length) {
          //on last item
          l_seek = l_timecodes[l_timecodes.length - 1].time;
        }
        else {
          l_seek = l_timecodes[scope.position - 1].time;
        }

        //unbind position incrimenter
        l_player.listening = false;
        //play video at last position
        l_player.seek(l_seek);

        l_rewatching = true;
      };

      //disable seeking past next question
      l_player.onSeek(function(p_event) {
        if (l_timecodes[scope.position]) {

          var l_offset = p_event.offset,
              l_maxPosition = l_timecodes[scope.position].time;

          if (l_offset > l_maxPosition) {
            l_player.seek(l_maxPosition);
          }
        }
      });

    });//end on Ready


    this.player = l_player;

    this.resizePage();
  },



  /**
   *
   */
  showTimecodeActivity : function() {

    var l_activities = $.makeArray(this.timecode.activities.item),
        l_activity = l_activities[this.activityIndex],
        l_data = _app.sequence.getData(l_activity.id);

    _app.$page.find('#hs-popup').remove();
    this.TimecodeActivity = new window[l_data.type](l_data);
  },



  /**
   * Called from the hotspot activity
   */
  timecodeCompleted : function() {

    var l_completed = 1;

    this.userData[this.timecode.id][0] = 1;

    //check completion
    for (var a in this.userData) {
      if (this.userData[a][0] < 1) {
        l_completed = 0;
        break;
      }
    }

    if (l_completed) {
      _app.panels.menu.pageComplete(this.id);
      $('#btn-page-navigation-next').enable();
    }

    //add userdata to session
    _app.session.setUserData([this.id, l_completed, this.userData]);

    this.timecode = {};
    this.activityIndex = 0;
  },



  /**
   * The elements that need their dimensions updated, called on page load and on resize of window
   */
  resizePage : function() {

    var $pageTitle = _app.$content.find('.page-title'),
        $inner = _app.$content.find('.inner'),
        $text = _app.$content.find('#main-text'),
        t_margin = parseInt($text.css('margin-bottom'), 10),
        $jwWrap = _app.$content.find('.jwplayer-wrap'),
        jw_margin = parseInt($jwWrap.css('margin-right'), 10);

    $text.css({
      maxHeight: $inner.height() - $pageTitle.outerHeight(true) - t_margin,
      width: $inner.width() - 30 - this.video.width - jw_margin,
      paddingRight: '15px',
      overflow: 'auto'
    });

    $('#video-blocker').css({
      width: $inner.width(),
      height: $inner.height() - $pageTitle.outerHeight(true)
    });
  }
});
