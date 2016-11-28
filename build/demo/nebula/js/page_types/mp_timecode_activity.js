/**
 * The base class for a hot spot activity
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class HotspotActivity
 */
var TimecodeActivity = Class.extend({


  /**
   * Constructor method
   *
   * @param p_data
   *    The jsond xml data of the page
   */
  init : function(p_data) {

    this.data = p_data;
    this.id = this.data.id;
    this.html = $$('div', '', 'content');
    this.time = {};
    this.$popup = [];
    this.submittable = false;
    this.buttonLabel = 'Submit';
    this.attempts = 0;
    this.maxAttempts = this.data.max_attempts || 9999;
    this.userData = [];
    this.setup();
  },



  /**
   * Build some html for this popup
   */
  setup : function() {

    var l_content = this.html || '&nbsp;';

    this.$submit = $$('a', 'btn-submit-popup').attr({ href:'#', role:'button' }).html(this.buttonLabel);

    //create a hidden popup to use for the questions
    this.$popup = $$('div', 'hs-popup', 'hidden popup '+ this.data.type.replace(/_/g, '-'), { role:'dialog' })
      .html($$('div', '','box')
        .append($$('div', '','top'))
        .append($$('div', '','mid')
          .append($$('div', '','grad')
          .append(l_content)
          .append($$('div', 'hs-footer')
            .append(this.$submit))))
        .append($$('div', '','bottom')));

   _app.$page.append(this.$popup);

    $('#btn-submit-popup').disable();

    this.ready();
  },



  /**
   * The activities html has been formed
   */
  ready : function() {

    var scope = this;

    this.time.start = Date.now();

    //show it
    this.$popup.fadeIn(400, function() {
      scope.$popup.findFirstText().attr({ tabindex:'-1' }).focus();
    });

   _app.$content.disableFocus().find('#video-blocker').show();

    //listen for submit
    this.$submit.click(function(p_event) {
      scope.submit();
      p_event.preventDefault();
    });
  },



  /**
   * The submit button has been clicked
   */
  submit : function() {
    //override
  },



  /**
   * Gathers some userdata for this activity
   *
   * @param p_array
   *    The activity data array
   */
  updateActivityData : function(p_array) {

    var l_array = (p_array) ? p_array : [-1],
        l_index = Number(_app.session.get('cmi.interactions._count')) || 0,
        l_result = p_array[0] ? 'correct' : 'wrong',
        l_timeTaken = 0;

    //add page id to start of array
    l_array.unshift(this.id);
    l_array.push(this.attempts);

    this.time.stop = Date.now();
    l_timeTaken = Number(this.time.stop - this.time.start).toScormTimeString();

    //add interaction to LMS
    _app.session.set('cmi.interactions.'+ l_index +'.id', this.id +'@'+ this.attempts);
    _app.session.set('cmi.interactions.'+ l_index +'.result', l_result);
    _app.session.set('cmi.interactions.'+ l_index +'.latency', l_timeTaken);

    //update interactions index
    _app.session.set('cmi.interactions._count', l_index + 1);

    this.showFeedback(l_array[1]);
  },



  /**
   * Decide what feedback to use
   *
   * @param p_result
   *    The user's result (0 = incorrect, 1 = correct)
   *
   */
  showFeedback : function(p_result) {

    var scope = this,
        l_activityCount = $.makeArray(_app.currentPage.timecode.activities.item).length,
        $content =_app.$feedback.find('#feedback-txt'),
        $footer = _app.$feedback.find('.feedback-footer'),
        l_feedback = $.makeArray(this.data.feedback.item),
        l_feedbackCount = l_feedback.length;

    if (p_result >= 1) {
      //correct
      $content.html(l_feedback[0].text[0]);

      //are there any more activities for this hotspot?
      if (_app.currentPage.activityIndex < l_activityCount - 1) {
        $footer.find('.btn-feedback-hs-next').show();
      }
      else {
        $footer.find('.btn-feedback-hs-resume').show();
      }
    }
    else {
      //incorrect
      if (this.attempts < this.maxAttempts) {
        $content.html(l_feedback[1].text[0]);
        $footer.find('.btn-feedback-hs-tryagain').show();
        $footer.find('.btn-feedback-hs-rewatch').show();
      }
      else {
        //max attempts reached
        $content.html(l_feedback[l_feedbackCount - 1].text[0]);

        //are there any more activities for this hotspot?
        if (_app.currentPage.activityIndex < l_activityCount - 1) {
          $footer.find('.btn-feedback-hs-next').show();
        }
        else {
          $footer.find('.btn-feedback-hs-resume').show();
        }
      }
    }

    _app.$feedback.trigger('show');

    //find a button to focus on (IE8 spews if it is hidden)
    _app.$feedback.findFirstFocusable().focus();


    /**
     * click handler for popup buttons
     */
    $footer.bind('click.hotspot-feedback', function(p_event) {

      var $target = $(p_event.target),
          $activity = scope.$popup.find('#activity');

      //next button clicked
      if ($target.hasClass('btn-feedback-hs-next')) {
        scope.$popup.remove();
        _app.currentPage.activityIndex += 1;
        _app.currentPage.showTimecodeActivity();
        //hide feedback and unbind click
        _app.$feedback.trigger('hide', $('#video-activity-'+ _app.currentPage.id));
        $footer.unbind('click.hotspot-feedback');
      }
      //try again button clicked
      else if ($target.hasClass('btn-feedback-hs-tryagain')) {
        $activity.removeClass('disabled completed')
          .find('.response').removeClass('checked correct')
            .find('input').removeAttr('disabled').prop('checked', false);

        scope.submittable = false;
        //hide feedback and unbind click
        _app.$feedback.trigger('hide', scope.$popup.findFirstFocusable());
        $footer.unbind('click.hotspot-feedback');

        scope.time.start = Date.now();
      }
      else if ($target.hasClass('btn-feedback-hs-rewatch')) {
        scope.$popup.remove();
        _app.$content.find('#video-blocker').hide();
        _app.currentPage.player.rewatchLast();
        //hide feedback and unbind click
        _app.$feedback.trigger('hide', scope.$popup.findFirstText());
        $footer.unbind('click.hotspot-feedback');
      }
      //done button clicked
      else if ($target.hasClass('btn-feedback-hs-resume')) {
        scope.$popup.remove();
        _app.$content.find('#video-blocker').hide();
        //hide feedback and unbind click
        _app.$feedback.trigger('hide', $('#video-activity-'+ _app.currentPage.id));
        $footer.unbind('click.hotspot-feedback');

        _app.currentPage.timecodeCompleted();
        _app.currentPage.position++;
        _app.currentPage.player.play();
      }

      p_event.preventDefault();
    });
  }

});
