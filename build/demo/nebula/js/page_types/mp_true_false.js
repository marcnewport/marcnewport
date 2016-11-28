/**
 * The functionality for a true false page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_true_false
 * @extends PageType
 */
var mp_true_false = PageType.extend({


  setup : function() {

    this.$rightColumn = $$('div', '', 'right-column');
    this.$leftColumn = $$('div', '', 'left-column');
    this.hasMedia = (this.data.media) ? true : false;

    var l_responses = $.makeArray(this.data.responses.item),
        l_count = l_responses.length,
        $responses = $$('fieldset', 'activity'),
        $response = [];

    //Legend needs to be present for WCAG testers, although it doesnt need to show
    $responses.append($$('legend', '', 'hidden').html('Activity'));

    // create html for responses
    for (var i = 0; i < l_count; i++) {
      $response = $$('div', 'r-'+ i, 'response');
      //Do we need a why button?
      if (l_responses[i].why) {
        $response.append($$('a', '', 'btn-why w-'+ i, { href:'#', title:'Find out why' }).html('?'));
        this.whyFeedback = true;
      }
      //The label and input
      $response
        .append($$('div', '', 'statement').html(l_responses[i].statement))
        .append($$('label', '', 'label-true', { 'for':'it-'+ i })
          .append($$('radio', 'it-'+ i).attr({ name:'i-'+ i, value:'true', title:'true' }))
          .append($$('span', '', 'custom-input')))
        .append($$('label', '', 'label-false', { 'for':'if-'+ i })
          .append($$('radio', 'if-'+ i).attr({ name:'i-'+ i, value:'false', title:'false' }))
          .append($$('span', '', 'custom-input')));

      $responses.append($response);
    }

    //check for scenario text
    if (empty(this.data.scenario) && !this.hasMedia) {
      this.html
        .append(this.$rightColumn
          .append($$('div', 'question').html(this.data.question))
          .append($$('div', 'activity-wrap')
            .append($$('div', 'true-false-header').attr({ 'aria-hidden':'true' }).html('True <span>|</span> False'))
            .append($responses))
          .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit')));
    }
    else {
      // insert scenario first
      this.$leftColumn
        .append($$('div', 'scenario').html(this.data.scenario));

      // check for media
      if (this.hasMedia){
        // insert a media player holder elem
        this.$leftColumn.append($$('div','media-holder-'+this.id, 'media-holder'));
        //we need diff styles if transcript present
        if (this.data.media.item.description) _app.$page.addClass('transcript');
      }

      this.html
        .append(this.$leftColumn)
        .append(this.$rightColumn
          .append($$('div', 'question').html(this.data.question))
          .append($$('div', 'activity-wrap')
            .append($$('div', 'true-false-header').attr({ 'aria-hidden':'true' }).html('True <span>|</span> False'))
            .append($responses))
          .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit')));
    }



    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    var l_scenarioLess = this.data.scenario ? false : true,
        $activity = $('#activity'),
        $response = $activity.find('.response'),
        l_userData = _app.session.getUserData(this.id),
        l_dimensions = {},
        l_description = '',
        l_maxMediaWidth = 385;

    //layout opions for knowlwedge check
    if(l_scenarioLess){
      this.$leftColumn.hide();
      this.$rightColumn.addClass('no-scenario');
    }

    // check for media
    if (this.hasMedia){
      this.media = this.data.media.item;

      switch  (this.media.type){
        case 'mp_resource_video':
          // calculate the width of media based on available space
          this.media.width = l_maxMediaWidth;
          this.media.height = Math.floor(this.media.width * (9/16));
          _app.setupVideoPlayer('media-holder-'+ this.id, this.media);
        break;
        case 'mp_resource_audio' :
          // calculate the width of media based on available space
          this.media.width = l_maxMediaWidth;
          if (this.media.image){
            this.media.height = Math.floor(this.media.width * (9/16));
          }
          else{
            this.media.height = 24;
          }
          _app.setupAudioPlayer('media-holder-'+ this.id, this.media, this.media.image);
        break;
        case 'mp_resource_image' :
          $('#media-holder-'+ this.id).html($$('img', '','', {src: 'files/'+ this.media.content}));
        break;
      }
      //insert the transcript
      l_dimensions = { width : this.media.width , height : 120 };
      l_description = this.media.description || '';

      if (! empty(l_description)) {
        this.$leftColumn.append($$('div').html(l_description).transcript('down', l_dimensions, this.media.id));
      }

      // set some 'has media' specific styles here cause it only needs to be done once
      this.$leftColumn.css({
        width: l_maxMediaWidth + 'px',
        marginRight: '15px',
        height: '95%'
      });
      this.$rightColumn.css({
        width: 'auto',
        float: 'none'
      });
    }

    //check userData
    if (l_userData[2]) {
      $response.each(function(i) {
        if (Boolean(l_userData[2][i])) {
          $(this).find('input[value="true"]').prop('checked', true);
        }
        else{
          $(this).find('input[value="false"]').prop('checked', true);
        }
      });
    }

    this._super();
    this.setupActivity();

  },



  /*
   * Sets up activity interaction
   */
  setupActivity : function() {

    var $activity = $('#activity'),
        $submit = $('#btn-submit');

		$submit.disable();

    //Simulate the statement being a label for the true input
    $activity.bind('click', function(e) {
      var $target = $(e.target);
      if ($target.hasClass('statement')) {
        $target.siblings('.label-true').find('input').prop('checked', true).trigger('change').focus();
      }
    });

    //Change event only fires on inputs so we dont need to look for event target
    $activity.bind('change', function(e) {
      var l_submittable = true;

      //If each response has an input checked we can submit
      $activity.find('.response').each(function() {
        if (! $(this).find('input:checked').length) {
          l_submittable = false;
          return;
        }
      });

      if (l_submittable) {
        $submit.enable();
      }
      else {
        $submit.disable();
      }
    });
  },



  /*
   * Assesses the activity & logs user data
   */
  submitAnswers : function() {

    this.attempts++;
    _app.pausePlayers();

    var $activity = $('#activity'),
        $responses = $activity.find('.response'),
        l_answers = $.makeArray(this.data.responses.item),
        l_userData = [],
        l_correct = true,
        l_finalRound = this.attempts >= this.data.max_attempts;

    //diable sumbit button
    $('#btn-submit').disable();

    //disable activity, loop through inputs
    $responses.each(function(i) {

      var $this = $(this),
          l_classes = '';

      //Disable the inputs and get user response
      $this.find('input').attr('disabled', 'true').each(function() {
        if (this.checked) {
          if (this.value === 'true') {
            l_userData[i] = 1;
          }
          else {
            l_userData[i] = 0;
          }
        }
      });

      l_classes += Number(l_answers[i].correct) ? 'true' : 'false';

      if (Number(l_answers[i].correct) === l_userData[i]) {
        l_classes += ' correct';
      }
      else {
        l_correct = false;
      }

      $this.addClass(l_classes);
    });

    if (l_finalRound || l_correct) {
      //show correct answers
      $activity.addClass('completed');
    }
    else {
      //Remove the correct class
      $responses.removeClass('true false correct');
      $activity.addClass('disabled');
    }

    //add user data to session and show feedback
    this.updatePageData([Number(l_correct), l_userData, this.attempts]);
  },



  /**
   * Resets the activity to its original state
   */
  resetActivity : function() {

    this._super();

    _app.$content.find('#activity').removeClass('disabled completed')
      .find('.response').removeClass('checked correct')
        .find('input').removeAttr('disabled').prop('checked', false).unbind('change');

    this.setupActivity();
  },




  /**
   * The elements to give max-height
   * Called on load of page and on resize of window
   */
  resizePage : function() {

    var $pageTitle = _app.$content.find('.page-title'),
        $inner = _app.$content.find('.inner').eq(0),
        l_outer = $pageTitle.outerHeight(true),
        $leftColumn = _app.$content.find('.left-column'),
        lc_margin = parseInt($leftColumn.css('margin-bottom'), 10),
        $question = _app.$content.find('#question'),
        $scenario = _app.$content.find('#scenario'),
        q_margin = parseInt($question.css('margin-bottom'), 10),
        $activity = _app.$content.find('#activity'),
        a_margin = parseInt($activity.css('margin-bottom'), 10),
        rc_margin = parseInt($inner.find('.right-column').css('margin-bottom'), 10),
        l_height = $inner.height(),
        l_mediaHeight = 0,
        l_submit = _app.$content.find('#btn-submit').outerHeight(),
        tf_header = _app.$content.find('#true-false-header').outerHeight(true),
        l_availableHeight = l_height - l_outer - l_submit - q_margin - tf_header - a_margin - rc_margin,
        l_questionHeight = Math.floor(0.5 * l_availableHeight),
        l_activityHeight = Math.floor(0.5 * l_availableHeight);

    //check if its a single column
    if (empty(this.data.scenario)) {
      l_outer += $question.outerHeight(true);
    }

    if (this.hasMedia) {
      l_mediaHeight = this.data.media.item.height;
      if (this.data.media.item.description) l_mediaHeight += 78;

      // only scroll scenario so you can always see media
      $scenario.css({
        maxHeight: l_height - l_outer - lc_margin - l_mediaHeight - 15,
        paddingRight: '15px',
        overflow: 'auto'
      });
    }
    else{
      //the whole left column scrolls
      this.$leftColumn.css({
        maxHeight: l_height - l_outer - lc_margin,
        paddingRight: '15px',
        overflow: 'auto'
      });
    }

    //scroll the the question and response blocks depending on the content in each. the responses
    //should get precedence but we dont want white space if there are scroll bars.
    if ($question.get(0).scrollHeight < Math.floor(0.333 * l_availableHeight)) {
      l_questionHeight = $question.get(0).scrollHeight;
      l_activityHeight = l_availableHeight - l_questionHeight;
    }
    else if ($activity.get(0).scrollHeight > Math.floor(0.666 * l_availableHeight)) {
      l_questionHeight = Math.floor(0.333 * l_availableHeight);
      l_activityHeight = Math.floor(0.666 * l_availableHeight);
    }
    else {
      l_activityHeight = $activity.get(0).scrollHeight;
      l_questionHeight = l_availableHeight - l_activityHeight;
    }

    $question.css({
      maxHeight: l_questionHeight,
      overflow: 'auto'
    });

    $activity.css({
      maxHeight: l_activityHeight,
      overflow: 'auto'
    });

    //activity wants padding if it don't scroll, so inputs line up with the submit button
    if (! $activity.hasVerticalScroll()) {
      $activity.css('padding-right', '17px');
    }

  }

});
