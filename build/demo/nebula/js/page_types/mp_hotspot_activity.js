/**
 * The base class for a hot spot activity
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class HotspotActivity
 */
var HotspotActivity = Class.extend({


  /**
   * Constructor method
   *
   * @param p_data
   *    The jsond xml data of the page
   */
  init : function(p_data) {

    this.data = p_data;
    this.id = this.data.id;
    this.time = {};
    this.html = $$('div', '', 'content');
    this.$popup = [];
    this.submittable = false;
    this.attempts = 0;
    this.maxAttempts = this.data.max_attempts || 9999;
    this.userData = [];
    this.setup();

  },



  /**
   * Build some html for this popup
   */
  setup : function() {

    var l_title = empty(this.data.title) ? '' : $$('h3').html(this.data.title),
        l_content = this.html || '';

    this.$submit = $$('a', 'btn-submit-popup').attr({ href:'#', role:'button' }).html('Submit');

    //create a hidden popup to use for the questions
    this.$popup = $$('div', 'hs-popup', 'hidden popup '+ this.data.type.replace(/_/g, '-'), { role:'dialog' })
      .html($$('div', '', 'title')
        .append($$('div', '', 'inner').html(l_title)))
      .append(l_content)
      .append($$('div', 'popup-footer').html(this.$submit));

    _app.$page.append(this.$popup);

    $('#btn-submit-popup').disable();

    this.ready();
  },



  /**
   * The activities html has been formed
   */
  ready : function() {

    var scope = this,
        $hotspot = $('#'+ _app.currentPage.hotspot.id),
        l_offset = $hotspot.offset(),
        l_width = this.$popup.width(),
        l_height = this.$popup.height(),
        l_buttonOffset = (l_height - $hotspot.outerHeight()) / 2,
        l_top = l_offset.top - _app.dimensions.top - l_buttonOffset,
        l_left = l_offset.left - _app.dimensions.left - l_width,
        l_buttonWidth = $('#panel-buttons').width(),
        l_topBounds = _app.$header.height() + 5;

    this.time.start = Date.now();

    //make sure the popup doesn't spill over the bottom
    if (l_top + l_height > _app.dimensions.height - 60) {
      l_top = _app.dimensions.height - l_height - 60;
    }
    //or the top
    if (l_top < l_topBounds) {
      l_top = l_topBounds;
    }
    //or the right hand side
    if (l_left + l_width > _app.dimensions.width - 10) {
      l_left = _app.dimensions.width - l_width - 10;
    }
    //or the left
    l_buttonWidth = _app.navigation !== 'left' ? 0 : $('#panel-buttons').width();
    if (l_left < l_buttonWidth + 20) {
      l_left = l_offset.left - _app.dimensions.left + $hotspot.outerWidth() - 2;
    }

    this.$popup.css({
      top: Math.round(l_top) +'px',
      left: Math.round(l_left) +'px'
    });

    //show it
    this.$popup.fadeIn(400, function() {
      scope.$popup.findFirstText().attr('tabindex', '-1').focus();
    });

    //listen for submit
    this.$submit.on('click', function(e) {
      e.preventDefault();
      scope.submit();
    });

    //close the popup when user clicks away from it
    $('#content, #scene').bind('click.closePopup', function(p_event) {
      //ignore a hotspot clicked
      if (! $(p_event.target).hasClass('hotspot')) {
        scope.$popup.remove();
        //return focus to hotspot
        $('#'+ _app.currentPage.hotspot.id).focus();
        //remove close listener
        $('#content, #scene').unbind('click.closePopup');
      }
    });
  },



  /**
   * The submit button has been clicked
   */
  submit : function() {
    //override
  },



  /**
   * Re-enable the activity
   */
  enable : function() {

    this.time.start = Date.now();
  },



  /**
   * Gathers some userdata for this activity
   *
   * @param p_array
   *    The activity data array
   */
  updateActivityData : function(p_array) {

    var l_array = (p_array != undefined) ? p_array : [-1],
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

    this.feedback(l_array[1]);
  },



  /**
   * Decide what feedback to use
   *
   * @param p_result
   *    The user's result (0 = incorrect, 1 = correct)
   */
  feedback : function(p_result) {

    var scope = this,
        l_activityCount = $.makeArray(_app.currentPage.hotspot.activities.item).length,
        $content = _app.$feedback.find('#feedback-txt'),
        $footer = _app.$feedback.find('.feedback-footer'),
        $scene = $('#scene'),
        $hotspots = $scene.find('.hotspot'),
        $closePopup = scope.$popup.find('#btn-close-popup'),
        l_feedback = $.makeArray(this.data.feedback.item),
        l_feedbackCount = l_feedback.length;

    //disable scene
    $hotspots.disable({ opacity:1 });
    $closePopup.disable();

    if (p_result >= 1) {
      //correct
      $content.html(l_feedback[0].text[0]);

      //add classes to dispaly results
      $('#response-'+ (_app.currentPage.HotspotActivity.data.correct - 1)).parents('.response').addClass('true');
      scope.$popup.find('.inner').addClass('final');

      //are there any more activities for this hotspot?
      if (_app.currentPage.activityIndex < l_activityCount - 1) {
        $footer.find('.btn-feedback-hs-next').show();
      }
      else {
        $footer.find('.btn-feedback-hs-done').show();
      }
    }
    else {
      //incorrect
      if (this.attempts < this.maxAttempts) {
        $content.html(l_feedback[1].text[0]);
        $footer.find('.btn-feedback-hs-tryagain').show();
      }
      else {
        //max attempts reached
        $content.html(l_feedback[l_feedbackCount - 1].text[0]);

        //add classes to dispaly results
        $('#response-'+(_app.currentPage.HotspotActivity.data.correct - 1)).parents('.response').addClass('true');
        scope.$popup.find('.inner').addClass('final');

        //are there any more activities for this hotspot?
        if (_app.currentPage.activityIndex < l_activityCount - 1) {
          $footer.find('.btn-feedback-hs-next').show();
        }
        else {
          $footer.find('.btn-feedback-hs-done').show();
        }
      }
    }

    _app.$feedback.trigger('show');

    //find a button to focus on (IE8 spews if it is hidden)
    _app.$feedback.findFirstFocusable().focus();

    $footer.bind('click.hotspot-feedback', function(p_event) {

      var $target = $(p_event.target),
          $button = $('#'+ _app.currentPage.hotspot.id);

      //next button clicked
      if ($target.hasClass('btn-feedback-hs-next')) {

        _app.$feedback.trigger('hide', $button);
        $hotspots.enable().css({ transition:'none' });
        scope.$popup.remove();

        _app.currentPage.activityIndex += 1;
        _app.currentPage.showHotspotActivity();
        //rehide the buttons
        $footer.find('.feedback-button').removeAttr('style');
        //unbind listeners
        $footer.unbind('click.hotspot-feedback');
        p_event.preventDefault();
      }
      //try again button clicked
      else if ($target.hasClass('btn-feedback-hs-tryagain')) {
        _app.$feedback.trigger('hide', $('#hs-popup').findFirstFocusable());
        $hotspots.enable().css({ transition:'none' });
        $closePopup.enable();

        scope.$popup.find('.content').removeClass('disable');
        scope.enable();
        //rehide the buttons
        $footer.find('.feedback-button').removeAttr('style');
        //unbind listeners
        $footer.unbind('click.hotspot-feedback');
        p_event.preventDefault();
      }
      //done button clicked
      else if ($target.hasClass('btn-feedback-hs-done')) {
        _app.$feedback.trigger('hide', $button);
        $hotspots.enable().css({ transition:'none' });
        scope.$popup.remove();

        _app.currentPage.hotspotCompleted();
        //rehide the buttons
        $footer.find('.feedback-button').removeAttr('style');
        //unbind listeners
        $footer.unbind('click.hotspot-feedback');
        p_event.preventDefault();
      }
    });

  }

});
