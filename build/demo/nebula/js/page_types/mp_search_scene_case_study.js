/**
 * The functionality for a search scene case study.
 * Make sure mp_search_scene.js is loaded from index.html
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns
 * @class mp_search_scene_case_study
 * @extends mp_search_scene
 */
var mp_search_scene_case_study = mp_search_scene.extend({


  /**
   * copied from mp_basic but tacked on some case study specific stuff instead of calling _super()
   */
  setup : function() {

    var scope = this,
        l_image = this.data.asset.item,
        l_hotspots = $.makeArray(this.data.hotspots.item),
        l_hsCount = l_hotspots.length,
        $image = $$('img').attr({
          src: 'files/'+ l_image.content,
          alt: l_image.alt_text +' Select each clickable within the image.',
          width: l_image.width,
          height: l_image.height
        }),
        l_userData = _app.session.getUserData(this.id),
        l_class = '',
        l_csTabIndex = 0;

    //make scene available throughout class
    this.$scene = $$('div', 'scene-case-study').attr({ role:'listbox' });


//    //add longdesc if there
//    if (l_image.description) $image.attr('longdesc', l_image.description);
    //insert image
    this.$scene.append($image);

    //insert hotspots
    for (var i = 0; i < l_hsCount; i++) {
      l_hotspots[i].id = 'hscs-'+ i;
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

    //reference to current hotspot
    this.hotspotId = '';

    //don't call _super()

    // if case study panel, insert html into panel
    l_csTabIndex = _app.structure.parent((_app.structure.parent(this.data.id).id)).id;
    _app.panels.case_study.$panel.find('#tab-content-'+ l_csTabIndex).find('.tab-sub-content').html(this.html.wrapInner( $$('div','','inner')));

    //wait a tad, then call out that we're ready
    setTimeout(function() { scope.pageReady() }, 10);
  },



  /**
   * The elements that need their dimensions updated
   * Called on load of page and on resize of window
   */
  resizePage : function() {

    var scope = this,
        $container = $('#'+ this.id),
        $pageTitle = $container.find('.page-title'),
        $inner = $container.find('.inner'),
        l_margin = $inner.outerHeight(true) - $inner.outerHeight(),
        l_outer = $pageTitle.actual('height') + l_margin,
        $main = $container.find('#main-text'),
        $scene = $container.find('#scene-case-study'),
        $csTab = [],
        $csPanel = [],
        l_buttonMargin = 30,
        l_padding = 15,
        l_height = $container.actual('height'),
        l_width = $container.find('.inner').actual('width'),
        $img = $scene.find('img'),
        l_imageWidth = $img.width(),
        l_imageHeight = 0,
        l_availableWidth = 0,
        l_availableHeight = 0;

    // find our case study panel & tab
    $csPanel = _app.panels.case_study.$panel.find('.panel-content');
    $csTab = $('#tab-content-'+_app.panels.case_study.tab);

    l_height = ($csPanel.css('max-height')).split('px')[0];
    l_imageHeight = $img.height();

    // allow for buttons if they exist
    if ($csTab.hasClass('has-buttons')){
      l_width = $csPanel.width() - $csTab.find('.tab-buttons').width() - l_buttonMargin;
    }
    // update our panel width
    $csTab.find('.tab-sub-content').width(l_width);
    // find available space
    l_availableWidth = l_width - l_imageWidth - 40 - (l_padding * 2);
    l_availableHeight = l_height - l_outer  - 10;

    // check if we have enough space to float items
    if (l_availableWidth > 90){
      $main.css({
        width: l_availableWidth,
        paddingRight: l_padding + 'px',
        float: '',
        marginRight: l_padding + 'px'
      });

      if (l_imageHeight < l_availableHeight){
        $main.height(l_availableHeight);
      }

      $scene.css({
        float: '',
        marginTop: ''
      });

      $csTab.find('.content-wrap').css({
        width: '98%',
        height : l_availableHeight,
        'overflow-y' : 'auto',
        paddingRight: '2%'
      })
      .scroll(function() {
          //remove any popups
          $csTab.find('#hs-popup').fadeOut(400, function() {
            scope.hotspotId = '';
            $(this).remove();
          });
      });
    }
    // viewport too slim , stack items
    else{
      // for CS make whole page scroll as we don't have much space
      $csTab.find('.content-wrap').css({
        width: '95%',
        height : l_height - l_outer  - 10,
        'overflow-y' : 'auto',
        paddingRight: '5%'
      })
      .scroll(function() {
          //remove any popups
          $csTab.find('#hs-popup').fadeOut(400, function() {
            scope.hotspotId = '';
            $(this).remove();
          });
      });

      $main.css({
        width: 'auto',
        float: 'none',
        paddingRight: '',
        maxHeight: 'auto',
        overflow: 'visible'
      });

      $scene.css({
        width: 'auto',
        float: 'none',
        marginTop: l_padding + 'px'
      });
    }
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
    $('#'+ this.id).find('#hs-popup').remove();

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
        $container = $('#'+ this.id),
        $hotspot = $('#'+ this.hotspotId),
        $popup = $$('div', 'hs-popup', 'hidden popup', { role:'dialog' }),
        l_title = p_data.title || '&nbsp;',
        l_content = p_data.label || '&nbsp;',
        $close = $$('a', 'btn-close-popup').attr({ href:'#', role:'button' }).html('Close'),
        l_width = 0,
        l_height = 0,
        l_scrollTop = 0,
        c_offset = 0,
        s_offset = 0,
        l_difference = 0,
        hs_position = 0,
        l_middle = 0,
        l_top = 0,
        l_left = 0,
        l_bottom = 0;

    //create a hidden popup to use for the questions
    $popup
      .html($$('div', '', 'title')
        .append($$('div', '', 'inner').html($$('h3').html(l_title))))
      .append($$('div', '', 'content').html(l_content));

    //add markup to page
    $container.append($popup);

    //get popup dimensions
    l_width = $popup.actual('width');
    l_height = $popup.actual('height');

    $container = $container.parent();
    l_scrollTop = $container.scrollTop();

    c_offset = $container.offset();
    s_offset = $('#scene-case-study').offset();
    l_difference = s_offset.top - c_offset.top;

    hs_position = $hotspot.position();
    l_middle = (l_height - $hotspot.outerHeight()) / 2;

    l_top = l_difference + hs_position.top - l_middle + l_scrollTop;
    l_left = hs_position.left - l_width;
    l_bottom = $container.height();

    //make sure the popup doesn't spill over the bottom
    if (l_top + l_height + 5 > l_bottom + l_scrollTop) {
      l_top = l_bottom - l_height - 5;
    }
    //or the top
    if (l_top < 5) {
      l_top = 5;
    }
    //or the left
    if (l_left < 5) {
      l_left = hs_position.left + $hotspot.outerWidth() - 2;
    }

    $popup.css({
      top: Math.round(l_top) +'px',
      left: Math.round(l_left) +'px'
    });

    //fade it in
    $popup.fadeIn(400, function() {
      $popup.findFirstText().attr({ tabindex:'-1' }).focus();

      //clicking on close will close it
      $close.bind('click.closePopup', function(e) {
        $popup.trigger('closePopup');
        $close.unbind('click.closePopup');
        e.preventDefault();
      });

      //hitting esc will close the popup
      $(document).bind('keyup.closePopup', function(e) {
        if (e.keyCode == 27) {
          $popup.trigger('closePopup');
          $(document).unbind('keyup.closePopup');
          e.preventDefault();
        }
      });

      //and... if a user clicks outside the popup, also close it
      $container.bind('click.closePopup', function(e) {
        $popup.trigger('closePopup');
        _app.$content.unbind('click.closePopup');
        e.preventDefault();
      });

      //the closing handler
      $popup.bind('closePopup', function() {
        $popup.fadeOut(400, function() {
          //focus back on hotspot
          $('#'+ p_data.id).focus();
          $(this).remove();
        });
        scope.hotspotId = '';
        $container.unbind('closePopup');
      });
    });
  }

});
