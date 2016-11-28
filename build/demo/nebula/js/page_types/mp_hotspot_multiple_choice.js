/**
 * The functionality for a multiple choice hotspot activity
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_hotspot_multiple_choice
 * @extends HotspotActivity
 */
var mp_hotspot_multiple_choice = HotspotActivity.extend({



  /**
   * Build some html for this popup
   */
  setup : function() {

    var l_responses = $.makeArray(this.data.responses.item),
        l_resCount = l_responses.length,
        $activity = $$('fieldset', 'activity');

    //insert question
    this.html.append(this.data.question);

    //insert responses
    for (var i = 0; i < l_resCount; i++) {
      $response = $$('div', '', 'response')
        .append($$('label').attr('for', 'i-'+ i)
          .append($$('radio', 'i-'+ i).attr({ name:'r-input' }))
          .append($$('span', '', 'custom-input'))
          .append(l_responses[i].text[0]));

      $activity.append($response);
    }

    this.html.append($activity);

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  ready : function() {

    this._super();

    this.setupActivity();
  },



  /**
   * Adds listeners to activity interaction
   */
  setupActivity : function() {

    var $activity = this.$popup.find('#activity'),
        $submit = $('#btn-submit-popup');

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

    var $activity = this.$popup.find('#activity'),
        $responses = $activity.find('.response'),
        l_userData = [],
        l_correct = true,
        l_correctResponse = Number(this.data.correct),
        l_classes = '',
        l_finalRound = this.attempts >= this.data.max_attempts;

    //diable sumbit button
    $('#btn-submit-popup').disable();

    //disable activity, loop through inputs
    $responses.find('input').attr('disabled', 'true').each(function(i) {
      //Did the user check the radio?
      if (this.checked) {
        l_userData[i] = 1;
        //Yes
        if ((i + 1) !== l_correctResponse) {
          //They shouldnt have
          l_correct = false;
        }
      }
      else {
        l_userData[i] = 0;
        //No
        if ((i + 1) === l_correctResponse) {
          //They should have
          l_correct = false;
        }
      }

      //Mark checked and correct items
      l_classes = l_userData[i] ? 'checked' : '';
      l_classes += (i + 1) === l_correctResponse ? ' correct' : '';
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
  },



  /**
   * Re-enable the activity
   */
  enable : function() {

    this._super();

    //loop through response items
    this.$popup.find('.response').each(function() {
      //unselect, and reset inputs
      $(this).removeClass('selected')
        .find('input')
          .prop('checked', false)
          .removeAttr('disabled');
    });

    this.$popup.find('#activity').removeClass('disabled completed');

    this.setupActivity();
  }

});
