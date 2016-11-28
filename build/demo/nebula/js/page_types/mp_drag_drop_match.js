/**
 * The functionality for a splash page type
 *
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_drag_drop_match
 * @extends PageType
 *
 * @todo this is messy! tidy this up
 */
var mp_drag_drop_match = PageType.extend({

  /**
   * Builds the markup for the page
   */
  setup : function() {

    var l_targets = $.makeArray(this.data.targets.item),
        l_targetData = [],
        l_targetCount = l_targets.length,
        $targets = $$('div','targets');

    this.targetCount = l_targetCount;
    this.userData = {};

    for(var i=0;i<l_targetCount;i++){
      l_targetData = l_targets[i];

      $targets
        .append($$('div', 't_'+i, 'item')
          .append($$('div','q_'+i,'question')
            .append($$('div','','question-top')
            .append($$('div','','question-mid')
              .html(l_targetData.title))))
          .append($$('div','','target'))
        )

    }

    //insert page html
    this.html
        .append($$('div', 'main-text').html(this.data.scenario))
        .append($$('div', 'drag-container')
          .append($targets)
          .append($$('div','drags')))
        .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit'));


    //super
    this._super();

    this.setUpResponses();
  },

  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    var l_targetCount = this.targetCount,
        $attachTo = [],
        $drag_item = [],
        l_position = [],
        l_userData = _app.session.getUserData(this.id);


    // check for user data
    if(l_userData[2] != undefined ){
      this.userData = l_userData[2];
    }

    for(var i=0;i<l_targetCount;i++){

      // move drag items to saved locations
      if(l_userData[2] != undefined ){
        $attachTo = _app.$content.find('#'+l_userData[2]['d_'+i].attached_to);
        l_position = $attachTo.position();
        $drag_item = _app.$content.find('#'+'d_'+i)

        $drag_item.css({
          top: l_position.top + 'px',
          left: l_position.left + 294 + 'px',
          'margin-left': 0
        })
        .addClass('placed');
      }else{
        // set the user data if not already defined
        this.userData['d_'+i] = {};
        this.userData['d_'+i].attached_to = 'c_'+i;
      }
    }

    this._super();
  },

  /*
   * Sets up activity interaction
   */
  setupActivity : function() {
    var l_userData = this.userData,
        l_targetCount = this.targetCount,
        $draggable = $( ".drag-item" ),
        $target = [],
        l_index = '',
        l_targetIndex = '',
        $drag_item = [],
        l_position = [],
        l_top = 0,
        l_left = 0,
        $container = [],
        l_containerPosition = [],
        l_moveTo = '',
        l_allPlaced = true;

    //user data is empty if you leave after the first attempt and come back
    if (_app.session.getUserData(this.id)[2]) {
      l_userData = _app.session.getUserData(this.id)[2];
    }

    $draggable.draggable({
      containment: "#drag-container"
    });

    $( ".item" ).droppable({
      drop: function( event, ui ) {
        var $this = $(this);

        $target = $this.find('.target');
        l_targetIndex = $this.attr('id').split('_')[1];
        $drag_item = ui.draggable;
        l_index = $drag_item.attr('id').split('_')[1];

        if($this.hasClass('ui-droppable')){
          // is on a target, place elegantly
          l_position = $this.position();
          l_top = l_position.top;
          l_left = l_position.left + 294;

          $drag_item.animate({
            top: l_top + 'px',
            left: l_left + 'px',
            'margin-left': 0
          }, 400, function(){
            // update element it's attached to in userData object
            l_userData['d_'+l_index].attached_to = 't_' + l_targetIndex;

            // add classes
            $drag_item.addClass('placed');

            // check if all targets are placed
            l_allPlaced = true;
            for(var t=0;t<l_targetCount;t++){
              // is it attached to a target ?
              if(l_userData['d_'+t].attached_to.split('_')[0] !='t'){
                // drag item is not in a target
                l_allPlaced = false;
                // no need to keep on looking
                break;
              }
            }

            // all drag items are placed, enable submit
            if(l_allPlaced) {
              $('#btn-submit').enable();
            }else{
              $('#btn-submit').disable();
            }
          });

          // check to see if target was not empty
          for(var i=0;i<l_targetCount;i++){
            if (l_userData['d_'+i].attached_to == 't_' + l_targetIndex  && i!=l_index){

              // target already had drag item, so move it to empty container
              l_moveTo = l_userData['d_'+l_index].attached_to;

              // check if l_moveTo is a target & swap to corresponding container
              if(l_moveTo.split('_')[0] == 't'){
                l_moveTo = 'c_'+l_moveTo.split('_')[1];
              }

              // find container & poistion
              $container = _app.$content.find('#'+l_moveTo);
              l_containerPosition = $container.position();

              // move it to empty container
              _app.$content.find('#d_'+i).animate({
                top: l_containerPosition.top + 'px',
                left: l_containerPosition.left + 'px'
              }, 400, function (){
                $(this).removeClass('placed');
              });

              // update element it's attached to in userData object
              l_userData['d_'+i].attached_to = l_moveTo;

              break;
            }

            // check to see if overlaps container
            if (l_userData['d_'+i].attached_to == 'c_' + l_targetIndex && i != l_index){

              l_moveTo = 'c_' + l_userData['d_'+l_index].attached_to.split('_')[1];
              $container = _app.$content.find('#'+l_moveTo);
              l_containerPosition = $container.position();

              _app.$content.find('#d_'+i).animate({
                top: l_containerPosition.top + 'px',
                left: l_containerPosition.left + 'px'
              });
              l_userData['d_'+i].attached_to = l_moveTo;
            }

          }
          // update with latest
          this.userData = l_userData;
        }
      }
    });

    // update with latest
    this.userData = l_userData;




    /**
     * the following is some code i nabbed from http://blog.alaabadran.com
     * to simulate mouse dragging so that we can use the current jquery ui
     * for drag and drops on touch screens. event variable just seems to be present
     */
    $draggable.bind('touchstart touchmove touchend touchcancel', function(e) {

      var touches = event.changedTouches,
          first = touches[0],
          type = '',
          simulatedEvent = document.createEvent('MouseEvent');

      switch(e.type) {
        case 'touchstart':
          type = 'mousedown';
          break;
        case 'touchmove':
          type = 'mousemove';
          break;
        case 'touchend':
          type = 'mouseup';
          break;
        default:
          return;
      }

      simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);

      first.target.dispatchEvent(simulatedEvent);

      e.stopPropagation();
      e.preventDefault();
    });

    // disable submit until all answered
    $('#btn-submit').disable();

  },



  /**
   * Sets up the dragable items
   */
  setUpResponses : function(p_reset){

    var $drags = _app.$content.find('#drags'),
        $targets = _app.$content.find('#targets'),
        $question = [],
        $drag_mid = [],
        $drag_item = [],
        l_maxHeight = 50,
        l_paddingMin = 11,
        l_padding = 0,
        l_dragItems = $.makeArray(this.data.draggables.item),
        l_dragData = [],
        l_targetCount = this.targetCount,
        l_drag_id = '',
        l_classes = '';


    // reset & empty targets
    $drags.empty();
    $targets
      .find('.target')
        .removeClass('correct')
        .removeClass('placed');

    for(var i=0;i<l_targetCount;i++){

      l_dragData = l_dragItems[i];
      l_drag_id = 'd_'+i;
      l_classes = 'drag-item';

      if (i % 2) l_classes += ' odd';

      if (p_reset) this.userData[l_drag_id].attached_to = 'c_'+i;

      // append drag items to user list
      $drags
      // draggable item
        .append($$('div', l_drag_id, l_classes).css('top',(55*i + 'px'))
          .append($$('div','','drag-item-point'))
          .append($$('span', '', 'icon icon-tick'))
          .append($$('div','','drag-item-mid').html(l_dragData.label)))
       // drag containers
        .append($$('div', 'c_'+i, 'container').css('top',(55*i + 'px')));

    }

    for(var q=0;q<l_targetCount;q++){
    // find our elements
      $question =_app.$content.find('#t_'+q).find('.question-mid');
      $drag_item = _app.$content.find('#d_'+q);
      $drag_mid = $drag_item.find('.drag-item-mid');

      // calculate padding for question height
      l_padding = (l_maxHeight - $question.height())/2;
      if(l_padding < l_paddingMin) l_padding = l_paddingMin;

      $question.css({
        paddingTop: Math.floor(l_padding) + 'px',
        //paddingBottom: Math.floor(l_padding) + 'px'
      });

      // calculate padding for drag item height
      l_padding = (l_maxHeight - $drag_mid.height())/2 ;
      if(l_padding < l_paddingMin) l_padding = l_paddingMin;

      $drag_mid.css({
        paddingTop: Math.ceil(l_padding - 1) + 'px',
        paddingBottom: Math.floor(l_padding - 1) + 'px'
      });

    }

    this.setupActivity();

  },

   /*
   * Assesses the activity & logs user data
   */
  submitAnswers : function() {

    var scope = this,
        l_userData = this.userData,
        l_targetCount = this.targetCount,
        l_dragItems = $.makeArray(this.data.draggables.item),
        $drag_item = [],
        l_id = '',
        l_activityCorrect = true,
        l_targetIndex = 0,
        l_finalRound = (this.attempts == this.data.max_attempts-1)? true : false,
        l_correctCount = 0;

    for(var i=0;i<l_targetCount;i++){
      l_id = 'd_'+i;
      $drag_item = _app.$content.find('#'+l_id);
      l_targetIndex = l_userData[l_id].attached_to.split('_')[1];

      if (Number(l_dragItems[i].target) != (Number(l_targetIndex) + 1)){
        // incorrect
        l_activityCorrect = false;
      }
      else{
        // correct
        $drag_item.addClass('correct');
        l_correctCount++;
      }
    }

    // increment attempts
    this.attempts++;

    //add user data to session and show feedback
    this.updatePageData([Number(l_activityCorrect), this.userData, this.attempts]);

    if (l_finalRound) {
      //disable dragging
      $('#drags').addClass('final').find('.drag-item').draggable('disable');
      $('#btn-submit').disable();

      //add a show correct order button to feedback panel
      if (! l_activityCorrect) {
        _app.$feedback.find('.btn-show').show().click(function() {
          //remove the button so it dont show up in other feedback boxes
          this.style = '';
          scope.showCorrectOrder();
          _app.$feedback.trigger('hide');
        });
      }
    }
  },



  /**
   * Places the drag items in their correct order
   */
  showCorrectOrder : function() {

    var l_dragItems = $.makeArray(this.data.draggables.item);

    $('#drags').find('.drag-item').each(function(i) {
      var l_position = Number(l_dragItems[i].target) - 1;

      $(this).addClass('ordered').animate({
        top: l_position * 55
      }, 1000);
    });
  },



  resetActivity : function(){
    this._super();
    var l_userData = _app.session.getUserData(),
        $drag_items = _app.$content.find('.drag-item');

    // remove the ticks & correct highlights
    $drag_items
      .removeClass('correct');


    // don't reset responses if attempting second round
    if (this.attempts === 0 || this.attempts === this.data.max_attempts || l_userData[1]) {
      // destroy the sorting functionality
      $('#content .draggables').sortable('destroy');
      // reset the responses
      this.setUpResponses(true);
    }

  },



  resizePage : function() {

    var $inner = _app.$content.find('.inner'),
        $title = _app.$content.find('.page-title'),
        $text = _app.$content.find('#main-text'),
        $drag = _app.$content.find('#drag-container'),
        $submit = _app.$content.find('#btn-submit');

    $text.css({
      maxHeight: $inner.height() - $title.outerHeight(true) - $drag.outerHeight(true) - $submit.outerHeight(true),
      overflow: 'auto'
    });

  }

});
