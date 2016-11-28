/**
 * The functionality for a drag and drop scene page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_drag_drop_scene
 * @extends PageType
 */
var mp_drag_drop_scene = PageType.extend({


  /**
   * Setup the html etc.
   */
  setup : function() {

    var l_asset = this.data.asset.item,
        l_hotspots = $.makeArray(this.data.hotspots.item),
        l_count = l_hotspots.length,
        l_hotspot = {},
        l_dragId = '',
        l_order = [],
        $draggables = $$('div', 'draggables'),
        $droppable = [],
        $scene = $$('div', 'scene'),
        l_userData = _app.session.getUserData(this.id)[2];

    $scene.append($$('img').attr({
      src: 'files/'+ l_asset.content,
      alt: l_asset.alt_text,
      width: l_asset.width,
      height: l_asset.height
    }));

    //loop through items
    for (var i = 0; i < l_count; i++) {
      //assign a random id so users cant cheat by loooking at DOM
      l_hotspot = l_hotspots[i];
      l_dragId = $.randomString(6);

      //remember the correct order
      l_order[i] = l_dragId;

      //add draggable elements
      $draggables.append($$('div', l_dragId, 'draggable').html(l_hotspot.content));

      //add the target elements
      $droppable = $$('div', '', 'droppable').css({
        left: l_hotspot.left - 18 +'px',
        top: l_hotspot.top - 18 +'px'
      });

      $scene.append($droppable);
    }

    this.data.order = l_order;

    this.html
      .append($$('div', '', 'left-column')
        .append($$('div', '', 'text-content')
          .append(this.data.scenario)
          .append(this.data.question))
        .append($draggables))
      .append($$('div', '', 'right-column')
        .append($scene)
        //.append($$('a', 'btn-reset-activity').attr('href', '#').html('Reset'))
        .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit')));

    this._super();

    //check if theres saved data
    if (l_userData) {
      var l_id = '',
          $droppables = $scene.find('.droppable');

      for (i = 0; i < l_count; i++) {
        //add id to the data
        l_id = l_order[l_userData[i][0]];
        $droppables.eq(i).data('draggable', l_id).addClass('dropped');
        //put draggable into saved position
        $('#'+ l_id).css({
          position: 'relative',
          left: l_userData[i][1] +'px',
          top: l_userData[i][2] +'px'
        });
      }
    }
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    var scope = this,
        $draggables = _app.$content.find('#draggables'),
        $draggable = $draggables.find('.draggable'),
        $droppables = _app.$content.find('.droppable'),
        $submit = $('#btn-submit');

    //make the draggables draggable
    $draggable.draggable({
      revert: 'invalid'
    });

    //we need a starting point for the draggables
    $draggables.droppable({
      tolerance: 'intersect',
      drop: function(p_event, p_ui) {
        //remove the id from all droppable's data
        var l_id = p_ui.draggable.attr('id');
        if (l_id) {
          scope.removeDraggable(l_id);
        }

        //check if the activity can be submitted
        if (scope.submittable()) {
          $submit.enable();
        }
        else {
          $submit.disable();
        }
      }
    });

    //make the hotspots droppable
    $droppables.droppable({
      tolerance: 'touch',
      over: function() {
        $(this).addClass('over');
      },
      out: function() {
        $(this).removeClass('over');
      },
      drop: function(p_event, p_ui) {

        var $this = $(this),
            l_oldId = $this.data('draggable'),
            l_newId = p_ui.draggable.attr('id'),
            $draggable = $('#'+ l_newId),
            l_sceneOffset = _app.$content.find('#scene').offset(),
            l_droppablePosition = $this.position(),
            l_offset = {},
            l_dropWidth = 0,
            l_dropHeight = 0,
            l_dragWidth = 0,
            l_dragHeight = 0,
            l_newX = 0,
            l_newY = 0;

        if (l_newId) {
          //if there is a draggable already here, remove it
          if (l_oldId && l_oldId != l_newId) {
            scope.removeDraggable(l_oldId);
          }

          //if this got dragged from a droppable in the scene
          //we need to remove the data from its previous spot
          $droppables.each(function() {
            var $this = $(this);
            if ($this.data('draggable') == l_newId) {
              $this.removeClass('dropped').removeData('draggable');
            }
          });

          //add the new id to this droppable's data
          $this.data('draggable', l_newId);
          $this.addClass('dropped').removeClass('over');

          //animate into centre of hotspot
          //calculate droppable offset from page - 5 is from content margin
          l_offset = {
            left: l_sceneOffset.left + l_droppablePosition.left,
            top: l_sceneOffset.top + l_droppablePosition.top
          };
          //get dimensions
          l_dropWidth = $this.outerWidth();
          l_dropHeight = $this.outerHeight();
          l_dragWidth = $draggable.outerWidth();
          l_dragHeight = $draggable.outerHeight();
          //calculate how many pixels to move
          l_newX = Math.floor(p_ui.offset.left - (l_offset.left + ((l_dropWidth - l_dragWidth) / 2)));
          l_newY = Math.floor(p_ui.offset.top - (l_offset.top + ((l_dropHeight - l_dragHeight) / 2)));
          //animate
          $draggable.animate({
            left: '-='+ l_newX +'px',
            top: '-='+ l_newY +'px'
          });

          //check if the activity can be submitted
          if (scope.submittable()) {
            $submit.enable();
          }
          else {
            $submit.disable();
          }
        }
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

    this._super();
  },



  /**
   * Removes draggable id from all droppable's data
   */
  removeDraggable : function(p_id) {

    _app.$content.find('.droppable').each(function() {

      var $this = $(this),
          l_draggable = $this.data('draggable');

      if (l_draggable == p_id) {
        $this
          .removeData('draggable')
          .attr('class', 'droppable ui-droppable')
          .droppable('option', 'accept', '.draggable');

        //zero the draggable's position
        $('#'+ p_id).animate({ left:0, top:0 });
      }
    });
  },



  /**
   * Checks if all droppables have a draggable attached to them
   */
  submittable: function() {

    var $droppables = _app.$content.find('.droppable'),
        l_submittable = true;

    $droppables.each(function() {
      if (! $(this).data('draggable')) {
        l_submittable = false;
        //break loop
        return false;
      }
    });

    return l_submittable;
  },



  /**
   * Handler for submit click
   */
  submitAnswers : function() {

    this.attempts++;

    var scope = this,
        $droppables = _app.$content.find('.droppable'),
        l_draggable = '',
        $draggable = [],
        l_userData = [],
        l_index = 0,
        l_left = 0,
        l_top = 0,
        l_correct = 1,
        l_lastAttempt = this.attempts >= this.data.max_attempts;

    //disable dragging
    _app.$content.find('.draggable').draggable('disable');
    //disable submit
    $('#btn-submit').disable();

    //loop through each droppable and check it matches the correct order
    $droppables.each(function(i) {
      var $this = $(this);
      //get the draggables id that is in this target
      l_draggable = $this.data('draggable');
      //jquery select that draggable
      $draggable = $('#'+ l_draggable);
      //get this item's actual index
      l_index = scope.data.order.indexOf(l_draggable);
      //get position data
      l_left = parseInt($draggable.css('left'), 10);
      l_top = parseInt($draggable.css('top'), 10);
      //save some stuff
      l_userData[i] = [l_index, l_left, l_top];

      //check it is in the correct place
      if (l_draggable == scope.data.order[i]) {
        $this.addClass('correct');
        $draggable.addClass('correct');
      }
      else {
        l_correct = 0;
      }
    });

    if (l_lastAttempt || l_correct) {
      $('#scene').addClass('completed');
      $('#draggables').addClass('completed');

      //add a show correct order button to feedback panel
      if (! l_correct) {
        _app.$feedback.find('.btn-location').show().click(function() {
          //remove the button so it dont show up in other feedback boxes
          this.style = '';
          scope.showCorrectOrder();
          _app.$feedback.trigger('hide');
        });
      }
    }

    this.updatePageData([l_correct, l_userData, this.attempts]);
  },



  /**
   * Handler for when an activity needs resetting eg. "try again" is clisked
   */
  resetActivity : function() {

    this._super();

    var scope = this,
        l_items = this.data.order,
        l_count = l_items.length,
        $submit = _app.$content.find('#btn-submit');

    //remove draggable and data
    for (var i = 0; i < l_count; i++) {
      this.removeDraggable(l_items[i]);
    }

    //remove some classes and enable dragging
    _app.$content.find('#scene').removeClass('completed');
    _app.$content.find('#draggables').removeClass('completed');
    _app.$content.find('.draggable').removeClass('correct').draggable('enable');

    //enable submit on first drop
    _app.$content.find('.droppable').bind('drop', function() {
      $(this).removeClass('correct');
      if (scope.submittable()) {
        $submit.enable();
      }
      else {
        $submit.disable();
      }
    });

  },



  /**
   * Animates the responses to their correct locations
   */
  showCorrectOrder : function () {

    var scope = this;

    _app.$content.find('.droppable').each(function() {
      // Calculate the difference between this hotspot and the one it should be on
      var $this = $(this),
          l_draggable = $this.data('draggable'),
          $draggable = _app.$content.find('#'+ l_draggable),
          l_dragOffset = $this.offset(),
          l_droppable = scope.data.order.indexOf(l_draggable),
          $droppable = _app.$content.find('.droppable').eq(l_droppable),
          l_dropOffset = $droppable.offset();

      $draggable.animate({
        left: '-='+ (l_dragOffset.left - l_dropOffset.left) +'px',
        top: '-='+ (l_dragOffset.top - l_dropOffset.top) +'px'
      });
    });
  },



  /**
   * The elements that need their dimensions updated
   * Called on load of page and on resize of window
   */
  resizePage : function() {

    var $pageTitle = _app.$content.find('.page-title'),
        $inner = _app.$content.find('.inner'),
        l_margin = $inner.outerHeight(true) - $inner.outerHeight(),
        l_outer = $pageTitle.height() + l_margin,
        $left = _app.$content.find('.left-column'),
        $text = $left.find('.text-content'),
        $draggables = $left.find('#draggables'),
        $right = _app.$content.find('.right-column'),
        l_height = _app.$content.height(),
        l_width = _app.$content.find('.inner').width(),
        l_imageWidth = _app.$content.find('#scene img').attr('width');

    $left.css({
      width: l_width - l_imageWidth - 12
    });

    $text.css({
      maxHeight: l_height - l_outer - $draggables.outerHeight() - 20,
      overflow: 'auto',
      marginBottom: '20px'
    });

    $right.css({
      width: l_imageWidth
    });

  }

});
