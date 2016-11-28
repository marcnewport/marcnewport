/**
 * The functionality for a splash page type
 *
 * @author celine.bonin@ninelanterns.com.au
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_drag_drop_sort
 * @extends PageType
 */
var mp_drag_drop_sort = PageType.extend({

  /**
   * Builds the markup for the page
   */
  setup : function() {

    var l_targets = $.makeArray(this.data.targets.item),
        l_targetData = [],
        l_targetCount = l_targets.length,
        $targets = $$('div','targets'),
        $targets_drops = $$('div','targets-drops'),
        $titles = $$('div','target-titles'),
        $dragables = $$('ul', '', 'draggables', { role:'group' }),
        $drags = $$('div','drags');

    this.targetCount = l_targetCount;
    this.grabbed = [];

    for (var i = 0; i < l_targetCount; i++) {
      l_targetData = l_targets[i];

      $targets_drops
        .append($$('div', 't_'+i, 'target')
          .append($$('ul', '', 'draggables', {
            title: 'Drop target. '+ l_targetData.title,
            tabindex: 0,
            role: 'group'
          })));

      $titles.append($$('div', '', 'title').html($$('h3').html(l_targetData.title)));
    }

    //insert page html
    this.html
      .append($$('div', 'intro').html(this.data.scenario))
      .append($$('div', 'drag-container')
        .append($drags.html($dragables))
        .append($targets
          .append($titles.append($$('div','','clear')))
          .append($targets_drops))
        .append($$('div','','clear')))
      .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit'));

    //super
    this._super();

    this.setUpResponses(true);
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    var l_targetCount = this.targetCount,
        l_userData = _app.session.getUserData(this.id),
        $target = [],
        l_dragData = [],
        l_dragCount = 0,
        l_responses =[];

    // check for user data
    if ($.isArray(l_userData[2])) {
      // get the saved user responses
      l_responses = l_userData[2];

      // loop through the data, drag-items per target
      for (var i = 0; i < l_targetCount; i++) {
        // target info
        l_dragData = l_responses[i] || [];
        l_dragCount = l_dragData.length;
        $target = _app.$content.find('#t_'+ i).find('.draggables');

        // drag-items
        for (var j = 0; j < l_dragCount; j++) {
          // find the original drag item and move it to it's saved location
          _app.$content.find('#'+ l_dragData[j]).appendTo($target);
        }
      }
    }

    this._super();
  },



  /*
   * Sets up activity interaction
   */
  setupActivity : function() {

    var scope = this,
        $draggables = _app.$content.find('.draggables');

    // initiate dragging
    $draggables.sortable({
      connectWith: '#content .draggables',
      containment: "#drag-container",
      start: function(event, ui) {
        ui.item.addClass('grabbed');
      },
      stop: function(event, ui) {
        ui.item.removeClass('grabbed');
      },
      receive: function( event, ui ) {
        //check previous versions to prevent overflow
        scope.checkCompletion();
      }
    });



    /**
     * the following is some code i nabbed from http://blog.alaabadran.com
     * to simulate mouse dragging so that we can use the current jquery ui
     * for drag and drops on touch screens. event variable just seems to be present
     */
    $draggables.bind('touchstart touchmove touchend touchcancel', function(e) {

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


    var t_index = 0,
        $targets = _app.$content.find('#targets .draggables'),
        t_length = $targets.length;

    //setup keyboard navigation
    _app.$content.bind('keyup.dads', function(e) {
      switch (e.which) {
        //space
        case 32:
        //enter
        case 13:
          scope.keyupHandler(e.target);
          break;
        //m
        case 77:
          //ctrl + m
          if (e.ctrlKey) scope.keyupHandler(e.target);
          break;
        //right arrow
        case 39:
          if (e.target.parentNode.className === 'target') {
            t_index = $(e.target.parentNode).index();

            if (t_index < t_length - 1) {
              t_index += 1;
              $targets.eq(t_index).focus();
            }
          }
          break;
        //left arrow
        case 37:
          if (e.target.parentNode.className === 'target') {
            t_index = $(e.target.parentNode).index();

            if (t_index > 0) {
              t_index -= 1;
              $targets.eq(t_index).focus();
            }
          }
          break;
        //esc
        case 27:
          scope.keyupHandler(scope.grabbed);
          break;
      }
    });
  },



  /**
   * Handles the keyup event on certain elements
   */
  keyupHandler : function(el) {

    var scope = this,
        $element = el instanceof $ ? el : $(el),
        $drag = $element,
        $clone = [],
        e_index = 0,
        e_left = 0,
        $parent = [],
        p_index = 0,
        $drags = _app.$content.find('#drags'),
        $targets = _app.$content.find('.target'),
        transitionendHandler;

    //was the event on the drop target?
    if ($element.hasClass('draggables')) {
      //the drag item is the element in memory
      $drag = scope.grabbed;
      $clone = $drag.clone(true);
      e_index = $element.parent().index();
      e_left = (e_index + 1) * 210;
      $parent = $drag.parent().parent();

      //is the drag parent also a drop target
      if ($parent.hasClass('target')) {
        p_index = $parent.index();
        //exit if theyre the same drop target
        if (p_index === e_index) return;

        e_left = (e_index - p_index) * 210;
      }

      //the actions to execute when the drag transition is complete
      transitionendHandler = function() {
        //add clone to the target and remove the old item
        $element.prepend($clone);
        $drag.remove();
        //ungrab the cloned drag item
        scope.keyupHandler($clone);
        scope.checkCompletion();
        //put focus back on drag stack
        setTimeout(function() {
          $drags.find('.drag-item').eq(0).focus();
        }, 1000);
      };

      //animate drag item to target
      $drag.css({
        position: 'relative',
        marginLeft: e_left +'px',
        transition: 'all 0.5s ease-out',
        zIndex: 5
      })
      .bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', transitionendHandler);

      //ie9 does not support transitions
      if ($element.get(0).style.transition === undefined) setTimeout(transitionendHandler, 150);
    }
    else if ($element.hasClass('drag-item')) {
      //the event was on a drag item
      if ($drag.length) {
        //are we grabbing or ungrabbing?
        if ($drag.data('grabbed')) {
          //ungrabbing..
          scope.grabbed = [];
          $drag.data('grabbed', false).attr({ 'aria-grabbed':false }).removeClass('grabbed');
          $targets.removeAttr('aria-dropeffect');
        }
        else {
          //grabbing...
          //but first, do we need to ungrab the item in memory?
          if (scope.grabbed.length) {
            scope.grabbed.data('grabbed', false).attr({ 'aria-grabbed':false }).removeClass('grabbed');
          }
          $drag.data('grabbed', true).attr({ 'aria-grabbed':true }).addClass('grabbed');
          scope.grabbed = $drag;
          //focus on the first drop target
          setTimeout(function() {
            $targets.find('.draggables').attr('aria-dropeffect', 'copy move').eq(0).focus();
          }, 1000);
        }
      }
    }
  },



  /**
   * Sets up the dragable items
   */
  setUpResponses : function() {

    var $drags = _app.$content.find('#drags').find('.draggables'),
        $targets = _app.$content.find('#targets'),
        l_dragItems = $.makeArray(this.data.draggables.item),
        l_dragData = [],
        l_dragCount = l_dragItems.length,
        l_drag_id = '';

    // reset & empty targets
    $drags.empty();
    $targets.find('.target').find('.draggables').empty();

    for (var i = 0; i < l_dragCount; i++) {
      l_dragData = l_dragItems[i];
      l_drag_id = 'd_'+i;

      // append drag items to user list
      $drags.append($$('li', l_drag_id, 'drag-item', {
          tabindex: 0,
          role: 'listitem',
          'aria-grabbed': false,
          'data-index': i
        })
        .html(l_dragData.label));
    }

    this.setupActivity();
  },



  /**
   * Checks if the activity is submittable
   */
  checkCompletion : function() {
    //check if there are any draggable items in the pile
    if (_app.$content.find('#drags').find('.drag-item').length) {
      $('#btn-submit').disable();
    }
    else {
      $('#btn-submit').enable();
    }
  },



  /**
   * Assesses the activity & logs user data
   */
  submitAnswers : function() {

    var scope = this,
        $targets = _app.$content.find('#targets'),
        l_activityCorrect = 1,
        l_userData = [],
        l_dragItems = $.makeArray(this.data.draggables.item),
        l_dragData = [],
        l_dragCount = l_dragItems.length,
        $drag_item = [],
        l_dragItemId = '',
        l_targetID = '',
        l_finalRound = (this.attempts == this.data.max_attempts-1)? true : false,
        l_count = 0,
        l_correctCount = 0;

    //disable the activity
    _app.$content.find('#btn-submit').disable();
    _app.$content.find('.draggables').sortable('disable');
    _app.$content.find('.target ul, .drag-item').removeAttr('tabindex');

    for (var i = 0; i < l_dragCount; i++) {
      l_dragItemId = 'd_'+i;
      $drag_item = $targets.find('#'+l_dragItemId);
      l_dragData = l_dragItems[i];
      l_targetID = $drag_item.parents('.target').attr('id').split( '_')[1];

      // check #ID agiant target ID in xml
      if (l_targetID == (Number(l_dragData.target)-1)) {
        // is the correct target
        l_correctCount++;
        $drag_item.addClass('correct');
      }
      else {
        // incorrect
        l_activityCorrect = 0;
        $drag_item.addClass('incorrect');
      }

      // save the user selections
      if (!l_userData[l_targetID]) {
        // create target array
        l_userData[l_targetID] = [];
      }
      l_userData[l_targetID].push(l_dragItemId);
    }

    // increment attempts
    this.attempts++;

    //add user data to session and show feedback
    this.updatePageData([Number(l_activityCorrect), l_userData, this.attempts]);

    if (l_finalRound || (l_correctCount === l_count)) {
      $targets.addClass('final');

      //enable next
      $('#btn-page-navigation-next').enable();

      //add a show correct order button to feedback panel
      if (! l_activityCorrect) {
        _app.$feedback.find('.btn-categories').show().click(function() {
          //remove the button so it dont show up in other feedback boxes
          this.style = '';
          scope.showCorrectOrder();
          _app.$feedback.trigger('hide');
        });
      }
    }
  },



  /**
   * Animates the responses into their correct categories
   */
  showCorrectOrder : function() {

    var l_items = $.makeArray(this.data.draggables.item);

    // Look at each response...
    _app.$content.find('.drag-item').each(function() {

      var $this = $(this),
          $clone = [],
          l_target = 0;

      // We only want to move the incorrect items
      if ($this.hasClass('incorrect')) {
        $clone = $this.clone().hide();
        l_target = l_items[$this.data('index')].target - 1;
        $this.fadeOut(1000);
        $('#t_'+ l_target).find('ul').append($clone.fadeIn(1000));
      }
    });
  },



  /**
   * Resete the activity to initial empty state
   */
  resetActivity : function() {

    this._super();

    var l_userData = _app.session.getUserData(),
        $targets = _app.$content.find('#targets');

    // remove the ticks & correct highlights
    $targets.removeClass('final');
    $targets.find('.drag-item').removeClass('correct');
    //enable the activity
    _app.$content.find('.draggables').sortable('enable');
    _app.$content.find('.target ul, .drag-item').attr('tabindex', 0);

    // TODO : What exactly is going on in the following block???
    // don't reset responses if attempting second round
    if (this.attempts === 0 || this.attempts === this.data.max_attempts || l_userData[1]) {
      // destroy the sorting functionality
      $('#content .draggables').sortable('destroy');
      // reset the responses
      this.setUpResponses();
    }
  },



  /**
   * Calculate and resize elements on the screen
   */
  resizePage : function() {

    var $inner = _app.$content.find('.inner').eq(0),
        $pageTitle = $inner.find('.page-title'),
        $intro = $inner.find('#intro'),
        $container = $inner.find('#drag-container'),
        $titles = $container.find('#target-titles'),
        $submit = $inner.find('#btn-submit'),
        l_height = $inner.height() - $pageTitle.height() - $intro.outerHeight(true) - $submit.outerHeight(true);

    $container.height(l_height);
  }

});
