/**
 * The functionality for a true false popup from a mid video activity
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_timecode_true_false
 * @extends TimecodeActivity
 */
var mp_timecode_true_false = TimecodeActivity.extend({



  /**
   * Build some html for this popup
   */
  setup : function() {

    var l_responses = $.makeArray(this.data.statements.item),
        l_count = l_responses.length,
        $responses = $$('fieldset', 'activity'),
        $response = [];

    //Legend needs to be present for WCAG testers, although it doesnt need to show
    $responses
      .append($$('legend', '', 'hidden').html('Activity'))
      .append($$('div', 'true-false-header', '', { 'aria-hidden':true }).html('True <span>|</span> False'));

    // create html for responses
    for (var i = 0; i < l_count; i++) {
      //The label and input
      $response = $$('div', 'r-'+ i, 'response')
        .append($$('div', '', 'statement').html(l_responses[i].statement))
        .append($$('label', '', 'label-true', { 'for':'it-'+ i })
          .append($$('radio', 'it-'+ i).attr({ name:'i-'+ i, value:'true', title:'true' }))
          .append($$('span', '', 'custom-input')))
        .append($$('label', '', 'label-false', { 'for':'if-'+ i })
          .append($$('radio', 'if-'+ i).attr({ name:'i-'+ i, value:'false', title:'false' }))
          .append($$('span', '', 'custom-input')));

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



  /**
   * The submit button was clicked
   */
  submit : function() {

    this.attempts++;

    var $activity = this.$popup.find('#activity'),
        $submit = this.$popup.find('#btn-submit-popup'),
        $responses = $activity.find('.response'),
        l_answers = $.makeArray(this.data.statements.item),
        l_userData = [],
        l_correct = true,
        l_finalRound = this.attempts >= this.data.max_attempts;

    //diable sumbit button
    $submit.disable();

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

      l_classes += Number(l_answers[i].answer) ? 'true' : 'false';

      if (Number(l_answers[i].answer) === l_userData[i]) {
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
    this.updateActivityData([Number(l_correct), l_userData]);
















    // this.attempts++;
    //
    // var l_responses = $.makeArray(this.data.statements.item),
    //     l_count = l_responses.length,
    //     l_correct = true,
    //     l_maxAttempts = Number(this.data.max_attempts),
    //     l_final = this.attempts >= l_maxAttempts,
    //     l_userData = [],
    //     $activity = this.$popup.find('#activity'),
    //     $trueResponse = [],
    //     $response = [],
    //     l_answer = false;
    //
    // for (var i = 0; i < l_count; i++) {
    //   $activity.find('input').attr('disabled', 'disabled');
    //   $trueResponse = $activity.find('#true-response-'+ i);
    //   $response = $trueResponse.parents('.response');
    //   l_answer = Boolean(Number(l_responses[i].answer));
    //
    //   //check if true was selected
    //   if ($trueResponse.prop('checked')) {
    //     l_userData[i] = 1;
    //     if (l_answer) {
    //       //got it right
    //       $response.addClass('correct correct-true');
    //     }
    //     else {
    //       //got it wrong
    //       $response.addClass('incorrect-false');
    //       l_correct = false;
    //     }
    //   }
    //   else {
    //     l_userData[i] = 0;
    //     if (l_answer) {
    //       //got it wrong
    //       $response.addClass('incorrect-true');
    //       l_correct = false;
    //     }
    //     else {
    //       //got it right
    //       $response.addClass('correct correct-false');
    //     }
    //   }
    // }
    //
    // if (l_correct || l_final) {
    //   $activity.addClass('completed').find('.response').each(function(i) {
    //     var $this = $(this);
    //
    //     if ($this.hasClass('correct') && $this.find('.selected').length) {
    //       $this.prepend($$('span', '', 'icon icon-tick'));
    //     }
    //   });
    // }
    // else {
    //   $activity.addClass('disable');
    // }
    //
    // $('#btn-submit-popup').disable();
    //
    // this.updateActivityData([Number(l_correct), l_userData]);
  }

});
