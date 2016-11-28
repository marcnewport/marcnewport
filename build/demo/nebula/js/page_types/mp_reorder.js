/**
 * The functionality for a reorder page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2014
 * @version 2.0
 * @class mp_transition
 * @extends PageType
 */
var mp_reorder = PageType.extend({


  /**
   * Builds the HTML of the page type
   */
  setup : function() {

    var $leftColumn = $$('div', '', 'left-column column'),
        l_list = $.makeArray(this.data.list.item),
        l_count = l_list.length,
        l_id = '',
        l_savedOrder = [],
        $list = $$('ul', 'reorder-list'),
        l_userData = _app.session.getUserData(this.id)[2];

    this.data.order = [];

    for (var i = 0; i < l_count; i++) {
      //assign a random id so users cant cheat by loooking at DOM
      l_id = $.randomString(6);
      l_list[i].id = l_id;
      this.data.list.item[i].id = l_id;
      this.data.list.item[i].order = i;
      this.data.order.push(l_id);
    }

    //check if there is saved data
    if (l_userData) {
      //there was, we need to restore order AND fast!
      //look through saved data array and assign the positions into new array
      for (i = 0; i < l_count; i++) {
        l_savedOrder[i] = l_list[l_userData[i]];
      }
      //now make it the list
      l_list = l_savedOrder;
    }
    else {
      //just shuffle the list
      l_list.shuffle();
    }


    //append list items
    for (i = 0; i < l_count; i++) {
      $list.append($$('li', l_list[i].id).html(l_list[i].content));
    }

    $leftColumn
      .append($$('div', '', 'content-wrap')
        .append($$('div', '', 'scenario').html(this.data.scenario))
        .append($$('div', '', 'question').html(this.data.question)));

    // check for media
    if (this.data.media) {
      // insert a media player holder
      $leftColumn.append($$('div','media-holder-'+this.id, 'media-holder'));
      //we need diff styles if transcript present
      if (this.data.media.item.description) _app.$page.addClass('transcript');
    }

    this.html
      .append($leftColumn)
      .append($$('div', '', 'right-column column')
        .append($$('div', 'activity')
          .append($list))
        .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit')));

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    var $list = $('#reorder-list'),
        $submit = $('#btn-submit'),
        l_submittable = false;

    $submit.disable();

    $list.sortable({
      placeholder: 'place-holder',
      update: function() {
        if (! l_submittable) {
          $submit.enable();
          l_submittable = true;
        }
      }
    });

    $list.disableSelection();


    /**
     * the following is some code i nabbed from http://blog.alaabadran.com
     * to simulate mouse dragging so that we can use the current jquery ui
     * for drag and drops on touch screens. event variable just seems to be present
     */
    $list.bind('touchstart touchmove touchend touchcancel', function(e) {

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

    // check for media
    if (this.data.media) {

      var l_media = this.data.media.item,
          l_maxMediaWidth = 385.
          l_description = l_media.description || '';

      switch  (l_media.type) {
        case 'mp_resource_video':
          // calculate the width of media based on available space
          l_media.width = l_maxMediaWidth;
          l_media.height = Math.floor(l_media.width * (9/16));
          _app.setupVideoPlayer('media-holder-'+ this.id, l_media);
        break;
        case 'mp_resource_audio' :
          // calculate the width of media based on available space
          l_media.width = l_maxMediaWidth;
          if (l_media.image){
            l_media.height = Math.floor(l_media.width * (9/16));
          }
          else{
            l_media.height = 24;
          }
          _app.setupAudioPlayer('media-holder-'+ this.id, l_media, l_media.image);
        break;
        case 'mp_resource_image' :
          $('#media-holder-'+ this.id).html($$('img', '','', {src: 'files/'+ l_media.content}));
        break;
      }
      //insert the transcript
      l_dimensions = { width : l_media.width , height : 120 };

      if (! empty(l_description)) {
        $leftColumn.append($$('div').html(l_description).transcript('down', l_dimensions, l_media.id));
      }
    }


    this._super();

  },



  /**
   * Assesses the activity & logs user data
   */
  submitAnswers : function() {

    this.attempts++;

    var scope = this,
        $reorder = $('#reorder-list'),
        $list = $reorder.find('li'),
        l_correct = 1,
        l_lastAttempt = this.attempts >= this.data.max_attempts,
        l_index = 0,
        l_userData = [];

    $('#btn-submit').disable();
    $reorder.sortable('disable');

    //check if its in the correct order
    $list.each(function(i) {
      l_index = scope.data.order.indexOf(this.id);
      l_userData[i] = l_index;

      if (scope.data.list.item[i].id == this.id) {
        $(this).addClass('correct');
      }
      else {
        l_correct = 0;
      }
    });

    //show correct order
    if (l_lastAttempt || l_correct) {
      _app.$content.find('#activity').addClass('completed');

      $list.each(function() {
        var $this = $(this);

        if ($this.hasClass('correct')) {
          $this.prepend($$('span', '', 'icon icon-tick'));
        }
      });

      //add a show correct order button to feedback panel
      if (! l_correct) {
        _app.$feedback.find('.btn-show').show().click(function() {
          //remove the button so it dont show up in other feedback boxes
          this.style = '';
          scope.showCorrectOrder();
          _app.$feedback.trigger('hide');
        });
      }
    }

    //send data
    this.updatePageData([l_correct, l_userData, this.attempts]);
  },


  /**
   * Displays the correct order to the learner
   */
  showCorrectOrder: function() {

    var scope = this,
        $list = $('#reorder-list'),
        $items = $list.find('li'),
        l_height = $items.eq(0).outerHeight(true);

    // Loop through each list item
    $items.each(function(i) {
      // Figure out its correct position relative to the wrapping element
      // we wont bother updating the DOM
      var $this = $(this),
          l_offset = $this.position().top,
          l_order = scope.data.order.indexOf(this.id),
          l_position = (l_order * l_height) - l_offset;

      $this.animate({ top:l_position }, 600);
    });
  },



  /**
   * Handler for when an activity needs resetting eg. "try again" is clisked
   */
  resetActivity : function() {

    this._super();

    var $list = _app.$content.find('#reorder-list'),
        l_submittable = false;

    _app.$content.find('#activity').removeClass('completed');
    $list.find('.correct').removeClass('correct');

    $list.sortable('enable');

    $list.bind('sortupdate', function() {
       if (! l_submittable) {
         $('#btn-submit').enable();
         l_submittable = true;
       }
     });

  },



  /**
   * The elements that need their dimensions updated, called on page load and on resize of window
   */
  resizePage : function() {

    // var $inner = _app.$content.find('.inner'),
    //     $title = $inner.find('.page-title'),
    //     $wrap = $inner.find('.content-wrap'),
    //     $media = $inner.find('.media-holder');
    //
    // $wrap.css({
    //   height: $inner.height() - $title.height() - $media.height() - 15,
    //   overflow: 'auto'
    // });

  }

});
