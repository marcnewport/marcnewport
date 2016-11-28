/**
 * The functionality for a search scene page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_search_scene
 * @extends PageType
 */
var mp_search_scene = PageType.extend({


  /**
   * Setup the html etc.
   */
  setup : function() {

    var l_image = this.data.asset.item,
        l_hotspots = $.makeArray(this.data.hotspots.item),
        l_hsCount = l_hotspots.length,
        $image = $$('img').attr({
          src: 'files/'+ l_image.content,
          alt: l_image.alt_text +' Select each clickable within the image.',
          width: l_image.width,
          height: l_image.height
        }),
        l_userData = _app.session.getUserData(this.id),
        l_class = '';

    //make scene available throughout class
    this.$scene = $$('div', 'scene').attr({ role:'listbox' });


//    //add longdesc if there
//    if (l_image.description) $image.attr('longdesc', l_image.description);
    //insert image
    this.$scene.append($image);

    //insert hotspots
    for (var i = 0; i < l_hsCount; i++) {
      l_hotspots[i].id = 'hs-'+ i;
      l_hotspots[i].viewed = false;
      l_class = 'hotspot';

      //check userdata
      if (l_userData[2] != undefined && Boolean(l_userData[2][i])) {
        l_class += ' complete';
        l_hotspots[i].viewed = true;
      }

      //build hs html
      this.$scene
        .append($$('a', l_hotspots[i].id, l_class, { href:'#', role:'option' })
          .css({
            position: 'absolute',
            top: l_hotspots[i].top +'px',
            left: l_hotspots[i].left +'px'
          })
          .html(l_hotspots[i].title));
    }

    //make hotspots available to _app.currentPage
    this.hotspots = l_hotspots;

    //insert page html
    this.html
      .append($$('div', 'main-text').html(this.data.main))
      .append(this.$scene);

    //super
    this._super();

    //reference to current hotspot
    this.hotspotId = '';
  },


  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var scope = this,
        l_offset = {},
        c_offset = _app.$content.offset(),
        l_userData = _app.session.getUserData(this.id),
        l_hotspotCount = this.hotspots.length,
        l_completed = true,
        l_opacity = Number(_app.structure.course.settings.disabled_navigation_opacity);

    if (l_userData[2]) {
      for (var i=0;i<l_hotspotCount;i++){
        if (! this.hotspots[i].viewed) {
          //interaction incomplete disable next button
          $('#btn-page-navigation-next').disable({ opacity:l_opacity });
          l_completed = false;
          break;
        }
      }
    }
    else {
      l_completed = false;
    }

    if (l_completed) {
      $('#btn-page-navigation-next').enable();
    }

    //listen for hs click
    this.$scene.bind('click', function(event) {

      var $target = $(event.target),
          l_id = '';

      //remove any popups
      _app.$page.find('#hs-popup').fadeOut(400, function() {
        $(this).remove();
      });

      if($target.hasClass('hotspot')) {
        l_id = $target.attr('id');
        //only open a new popup if the current id is different
        if(l_id != scope.hotspotId) {
          scope.hotspotId = l_id;
          l_offset = $target.offset();
          scope.position = {
            top: l_offset.top - c_offset.top,
            left: l_offset.left - c_offset.left
          };
          scope.hotspotClicked(l_id);
        }
        else {
          //remove current id so we can reopen
          scope.hotspotId = '';
        }
        return false;
      }
      else {
        //remove current id so we can reopen
        scope.hotspotId = '';
      }
    });

    //add hover state
    this.$scene.find('.hotspot').hover(function() {
      $(this).addClass('hover');
    }
    , function() {
      $(this).removeClass('hover');
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
        $main = _app.$content.find('#main-text'),
        $scene = _app.$content.find('#scene'),
        l_height = _app.$content.height(),
        l_width = _app.$content.find('.inner').width(),
        l_imageWidth = $scene.find('img').attr('width');

    $main.css({
      maxHeight: l_height - l_outer,
      width: l_width - l_imageWidth - 35,
      paddingRight: '1em',
      overflow: 'auto'
    });

    $scene.css({
      maxHeight: l_height - l_outer,
      overflow: 'hidden'
    });

  },



  /**
   * Handles a hotspot click
   */
  hotspotClicked : function(p_id) {

    var scope = this,
        l_hsCount = this.hotspots.length,
        l_hotspot = {};

    //find the hotspot data
    for (var i = 0; i < l_hsCount; i++) {

      if (this.hotspots[i].id == p_id) {
        this.hotspots[i].viewed = true;
        l_hotspot = this.hotspots[i];
        break;
      }
    }

    //remove any existing popup
    _app.$page.find('#hs-popup').remove();

    this.popup(l_hotspot);
    //give the popup time to fade in before we mark as complete
    setTimeout(function() {
      scope.submit();
    }, 400);
  },


  /**
   *
   */
  popup : function(p_data) {

    var scope = this,
        $hotspot = $('#'+ this.hotspotId),
        $popup = $$('div', 'hs-popup', 'hidden popup', { role:'dialog' }),
        l_title = p_data.title || '',
        l_content = p_data.label || '',
        l_offset = 0,
        l_width = 0,
        l_height = 0,
        l_top = 0,
        l_left = 0,
        l_bottom = 0,
        l_right = 0,
        l_buttonWidth = 0,
        l_buttonOffset = 0,
        l_topBounds = 0;

    //create a hidden popup to use for the questions
    if (l_title) {
      $popup.html($$('div', '', 'title')
        .html($$('div', '', 'inner')
          .html($$('h3').html(l_title))));
    }

    if (l_content) {
      $popup.append($$('div', '', 'content').html(l_content))
    }

    //add markup to page
    _app.$page.append($popup);

    //get popup dimensions
    l_width = $popup.actual('width');
    l_height = $popup.actual('height');

    l_buttonOffset = (l_height - $hotspot.outerHeight()) / 2;

    //work out position of popup
    l_offset = $('#'+ this.hotspotId).offset();
    l_top = l_offset.top - _app.dimensions.top - l_buttonOffset;
    l_left = l_offset.left - _app.dimensions.left - l_width;
    l_bottom = _app.dimensions.height;
    l_right = _app.dimensions.width;
    l_topBounds = _app.$header.height() + 5;

    //make sure the popup doesn't spill over the bottom
    if (l_top + l_height + 60 > l_bottom) {
      l_top = l_bottom - l_height - 60;
    }
    //or the top
    if (l_top < l_topBounds) {
      l_top = l_topBounds;
    }
    //or the right hand side
    if (l_left + l_width + 10 > l_right) {
      l_left = l_right - l_width - 10;
    }
    //or the left
    l_buttonWidth = _app.navigation !== 'left' ? 0 : $('#panel-buttons').width();
    if (l_left < l_buttonWidth + 20) {
      l_left = l_offset.left - _app.dimensions.left + $hotspot.outerWidth() - 2;
    }

    $popup.css({
      top: Math.round(l_top) +'px',
      left: Math.round(l_left) +'px'
    });

    //fade it in
    $popup.fadeIn(400, function() {
      $popup.findFirstText().attr({ tabindex:'-1' }).focus();

      //if user tabs away, close the dialog
      $(document).bind('keyup.removehspopup', function(e) {
        switch (e.keyCode) {
          case 9:
          case 13:
          case 27:
             _app.$content.trigger('click');
            $(document).unbind('keyup.removehspopup');
            e.preventDefault();
            break;
        }
      });
    });

    //listen for close
    _app.$content.bind('click.closePopup', function(p_event) {

      $popup.fadeOut(400, function() {
        //focus back on hotspot
        $('#'+ p_data.id).focus();
        $(this).remove();
      });

      _app.$content.unbind('click.closePopup');
      scope.hotspotId = '';
      p_event.preventDefault();
    });
  },



  /**
   *
   */
  submit : function() {
    var l_hsCount = this.hotspots.length,
        l_userData = [],
        l_viewedCount = 0;

    //loop through hotspots
    for(var i = 0; i < l_hsCount; i++) {
      if(this.hotspots[i].viewed) {
        $('#'+ this.hotspots[i].id).addClass('complete');
        l_userData[i] = 1;
        l_viewedCount++;
      }
      else {
        l_userData[i] = 0;
      }
    }

    //all hotspots viewed
    if(l_viewedCount == this.hotspots.length){
      $('#btn-page-navigation-next').enable();
      this.updatePageData([-1, l_userData]);
    }

    //overwrite any userdata that exists for this page
    if(_app.session.getUserData(this.id)) {
      _app.session.setUserData([this.id, -1, l_userData]);
    }
  }

});
