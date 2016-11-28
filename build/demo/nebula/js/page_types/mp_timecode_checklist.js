/**
 * The functionality for a checklist popup from a mid video activity
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_timecode_checklist
 * @extends TimecodeActivity
 */
var mp_timecode_checklist = TimecodeActivity.extend({



  /**
   * Build some html for this popup
   */
  setup : function() {

    var l_responses = $.makeArray(this.data.responses.item),
        l_count = l_responses.length,
        $responses = $$('fieldset', 'activity'),
        $response = [];

    //Legend needs to be present for WCAG testers, although it doesnt need to show
    $responses.append($$('legend', '', 'hidden').html('Activity'));

    // create html for responses
    for (var i = 0; i < l_count; i++) {
      $response = $$('div', 'r-'+ i, 'response')
        .html($$('label').attr('for', 'i-'+ i)
          .append(l_responses[i].option))
        .append($$('checkbox', 'i-'+ i).attr({ name:'i-'+ i }))
        .append($$('span', '', 'custom-input'));

      $responses.append($response);
    }

    this.html
      .append($$('div', 'question').html(this.data.question))
      .append($responses);

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  ready : function() {

    this._super();

    var $activity = this.$popup.find('#activity'),
        $submit = this.$popup.find('#btn-submit-popup');

    $submit.disable();

    //Change event only fires on inputs so we dont need to look for event target
    $activity.bind('change', function(e) {
      if ($activity.find('input:checked').length) {
        $submit.enable();
      }
      else {
        $submit.disable();
      }
    });
  },



  /**
   * The submit button was clicked
   */
  submit : function() {

    this.attempts++;
    _app.pausePlayers();

    var $activity = this.$popup.find('#activity'),
        $responses = $activity.find('.response'),
        l_answers = $.makeArray(this.data.responses.item),
        l_userData = [],
        l_correct = true,
        l_classes = '',
        l_finalRound = this.attempts >= this.data.max_attempts;

    //diable sumbit button
    $('#btn-submit-popup').disable();

    //disable activity
    $responses.find('input').attr('disabled', 'true').each(function(i) {
      //Did the user check the box?
      if (this.checked) {
        l_userData[i] = 1;
        //Yes
        if (! Number(l_answers[i].correct)) {
          //They shouldnt have
          l_correct = false;
        }
      }
      else {
        l_userData[i] = 0;
        //No
        if (Number(l_answers[i].correct)) {
          //They should have
          l_correct = false;
        }
      }

      //Mark checked and correct items
      l_classes = l_userData[i] ? 'checked' : '';
      l_classes += Number(l_answers[i].correct) ? ' correct' : '';
      $responses.eq(i).addClass(l_classes);
    });

    if (l_finalRound || l_correct) {
      //show correct answers
      $activity.addClass('completed');
    }
    else {
      //Remove the correct class
      $responses.removeClass('checked correct');
      $activity.addClass('disabled');
    }

    //add user data to session and show feedback
    this.updateActivityData([Number(l_correct), l_userData, this.attempts]);
  }

});
