/**
 * The functionality for a click scene page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_click_scene
 * @extends PageType
 */
var mp_click_scene = PageType.extend({


  setup : function() {

    //load child activity class scripts for use later
    $.loadScript('js/page_types/mp_hotspot_activity.js', function() {
        $.loadScript('js/page_types/mp_hotspot_multiple_choice.js');
    });

    //reference to the currently selected hotspot
    this.hotspot = {};
    //make click scene available throughout class
    this.$scene = $$('div', 'scene', '', { role:'listbox' });
    this.activityIndex = 0;
    this.hotspotActivity = {};
    this.userData = _app.session.getUserData(this.id)[2] || {};

    var l_image = this.data.asset.item,
        l_hotspots = $.makeArray(this.data.hotspots.item),
        l_hsCount = l_hotspots.length,
        $image = $$('img').attr({
          src: 'files/'+ l_image.content,
          alt: l_image.alt_text +' Select each clickable within the image.',
          width: l_image.width,
          height: l_image.height
        }),
        l_classes = '';

//    //add longdesc if there
//    if (l_image.description) $img.attr('longdesc', l_image.description);

    //make hotspots available to _app.currentPage
    this.hotspots = l_hotspots;

    //insert image
    this.$scene.append($image);

    //insert hotspots
    for (var i = 0; i < l_hsCount; i++) {

      if (empty(this.userData[l_hotspots[i].id])) {
        this.userData[l_hotspots[i].id] = [0, 0];
        l_classes = 'hotspot';
      }
      else if (this.userData[l_hotspots[i].id][0] === 0) {
        this.userData[l_hotspots[i].id][0] = 0;
        l_classes = 'hotspot';
      }
      else {
        l_classes = 'hotspot complete';
      }

      this.$scene
        .append($$('a', l_hotspots[i].id, l_classes, { href:'#', role:'option' })
        .css({
          position: 'absolute',
          top: l_hotspots[i].top +'px',
          left: l_hotspots[i].left - 4 +'px'
        })
        .html(l_hotspots[i].title));
    }

    //insert page html
    this.html
      .append($$('div', 'main-text').html(this.data.main))
      .append(this.$scene);

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var scope = this,
        $reset = [];

    //listen for hs click
    this.$scene.bind('click', function(event) {
      var $target = $(event.target);

      //remove any popups
      _app.$content.find('#hs-popup').fadeOut(400, function() {
        $(this).remove();
        this.hotspot = {};
      });

      if ($target.hasClass('hotspot') && ! $target.hasClass('complete')) {
        scope.hotspotClicked($target.attr('id'));
      }

      return false;
    });

    //check status of page
    if (this.reviewMode) {
      //add a reset activity button
      $reset = $$('a', 'btn-reset', 'reset question', { href: '#' }).html('Reset');
      $('#scene').append($reset);

      $reset.click(function() {
        _app.session.setUserData([scope.id, undefined, undefined]);
        _app.sequence.goTo(scope.id);
        return false;
      });

      //page is nextable
      $('#btn-page-navigation-next').enable();
    }
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
      width: l_width - l_imageWidth - 12,
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

    var l_hsCount = this.hotspots.length,
        l_hotspot = {};

    //find the hotspot data
    for (var i = 0; i < l_hsCount; i++) {
      if(this.hotspots[i].id == p_id) {
        l_hotspot = this.hotspots[i];
        break;
      }
    }

    if (this.userData[l_hotspot.id]) {
      this.activityIndex = this.userData[l_hotspot.id][1] || 0;
    }

    //update current hotspot
    this.hotspot = l_hotspot;
    this.showHotspotActivity();
  },


  /**
   * Show a popup activity from a hotspot activity item
   */
  showHotspotActivity : function() {

    var l_activities = $.makeArray(this.hotspot.activities.item),
        l_activity = l_activities[this.activityIndex],
        l_id = l_activity.id,
        l_type = l_activity.type,
        l_data = _app.sequence.getData(l_id);

    _app.$page.find('#hs-popup').remove();

    //instantiate activity class (scripts loaded in this.setup())
    this.HotspotActivity = new window[l_type](l_data);
    this.userData[this.hotspot.id][1] = this.activityIndex;
  },


  /**
   * Called from the hotspot activity
   */
  hotspotCompleted : function() {

    var l_completed = 1;

    //update userdata
    this.userData[this.hotspot.id][0] = 1;

    //check completion
    for (var a in this.userData) {
      if (this.userData[a][0] < 1) {
        l_completed = 0;
        break;
      }
    }

    if (l_completed) {
      $('#btn-page-navigation-next').enable();
      _app.panels.menu.pageComplete(this.id);
    }

    //add userdata to session
    _app.session.setUserData([this.id, l_completed, this.userData]);

    //mark as completed
    $('#'+ this.hotspot.id).addClass('complete').unbind('click').attr('tabindex', '-1');

    this.hotspot = {};
    this.activityIndex = 0;
  }

});
