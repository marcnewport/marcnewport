/**
 * The functionality for a true false popup from a mid video activity
 *
 * @author john.phoon@ninelanterns.com.au
 * @copyright Nine Lanterns 2015
 * @version 1.0
 * @class mp_timecode_text_dialogue
 * @extends TimecodeActivity
 */

var mp_timecode_text_dialogue = TimecodeActivity.extend({
  
  /**
   * Build some html for this popup
   */
  setup : function() {
    
    this.buttonLabel = 'Resume Video';
    //insert question
    this.html.append(this.data.question);
    
    this._super();
  },
  
  ready : function() {
    
    this._super();
    
    $('#btn-submit-popup').enable();

  },
  
  submit : function() {
    
    $('#btn-submit-popup').disable();
    
    this.updateActivityData([1, 1]);
  },
  
  showFeedback : function(p_result) {
    
    var scope = this,
        $footer = _app.$feedback.find('.feedback-footer');
    
    scope.$popup.remove();
    _app.$content.find('#video-blocker').hide();
    //hide feedback and unbind click
    _app.$feedback.trigger('hide', $('#video-activity-'+ _app.currentPage.id));
    $footer.unbind('click.hotspot-feedback');
    
    _app.currentPage.timecodeCompleted();
    _app.currentPage.position++;
    _app.currentPage.player.play();
  }
  
});