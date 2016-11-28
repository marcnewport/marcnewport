/**
 * The base functionality for a page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_explore
 * @extends PageType
 */
var mp_explore = PageType.extend({



  /**
   * Builds the HTML for the page type
   */
  setup : function() {

    var l_items = this.data.information.item,
        l_itemCount = l_items.length,
        $main = $$('div', 'main-text'),
        $leftColumn = $$('div', '', 'left-column'),
        $list = $$('ul'),
        $link = [],
        $innerWrap = $$('div', '', 'inner-wrap'),
        $panel = [],
        l_userData = _app.session.getUserData(this.id)[2] || [],
        l_lastViewed = 0,
        l_classes = '',
        l_image = {},
        $image = [];

    $main.html(this.data.main);

    for (var i = 0; i < l_itemCount; i++) {
      $image = [];
      l_classes = 'link';

      //create a viewed property
      //check saved data to see if the item was viewed previously
      if (l_userData[i]) {
        this.data.information.item[i].viewed = l_userData[i];
        l_classes += ' viewed';
        l_lastViewed = i;
      }
      else {
        this.data.information.item[i].viewed = 0;
      }

      //add the list item on the left
      $link = $$('a', 'link-'+ i, l_classes, { href: '#' }).html(l_items[i].label.stripTags());
      $list.append($$('li').html($link));

      //add the panel on the right
      $panel = $$('div', 'panel-'+ i, 'panel hidden')
          .append($$('h4').html(l_items[i].label.stripTags()))
          .append(l_items[i].text[0]);

      // Look for an attached image on the item
      if (! empty(l_items[i].image)) {
        l_image = l_items[i].image;
      }
      // Or one attached globally
      else if (! empty(this.data.image)) {
        l_image = this.data.image;
      }

      // Now insert the image into the DOM
      if (l_image.path) {
        $image = $$('img').attr({
          src: 'files/'+ l_image.path,
          alt: l_image.alt_text || '',
          width: l_image.width,
          height: l_image.height
        });

        if (l_items[i].image_position) {
          switch (l_items[i].image_position) {
            case 'bottom':
              $panel.addClass('panel-image-'+ l_items[i].image_position).append($image);
              break;
            default:
              $panel.addClass('panel-image-'+ l_items[i].image_position).prepend($image);
              break;
          }
        }
        else {
          $panel.addClass('panel-image-bottom').append($image);
        }
      }

      $innerWrap.append($panel);
    }

    //now show the last viewed item or the first
    this.data.information.item[l_lastViewed].viewed = 1;
    $list.find('#link-'+ l_lastViewed).addClass('active viewed');
    $innerWrap.find('#panel-'+ l_lastViewed).css('display', 'block');

    // Append the list we just built
    $leftColumn.append($list);

    //Append an image under the list if available
    if (this.data.list_image) {
      $leftColumn.append($$('img').attr({
        src: 'files/'+ this.data.list_image.path,
        alt: this.data.list_image.alt_text || '',
        width: this.data.list_image.width,
        height: this.data.list_image.height
      }));
    }

    this.html
        .append($main)
        .append($leftColumn)
        .append($$('div', '', 'right-column').html($innerWrap));

    this._super();
  },



  /**
   * Called after the HTML has been inserted into the DOM
   * so we can perform tasks on these elements
   */
  pageReady : function() {

    var scope = this,
        $leftColumn = _app.$content.find('.left-column'),
        $inner = _app.$content.find('.inner').eq(0),
        innerHeight = $inner.height(),
        $pageTitle = _app.$content.find('.page-title'),
        pageTitleHeight = $pageTitle.height(),
        $mainText = _app.$content.find('#main-text'),
        mainTextHeight = $mainText.height(),
        areaOffset = pageTitleHeight + mainTextHeight,
        areaHeight = innerHeight - pageTitleHeight - mainTextHeight;

    //listen for a link click
    $leftColumn.bind('click', function(p_event) {

      var $target = $(p_event.target),
          $panel = [],
          l_top = 0,
          t_top = 0,
          t_height = 0,
          panelHeight = 0,
          l_item = '';

      if ($target.is('span')) {
        $target = $target.parent();
      }
      //check it was a link that was clicked
      if ($target.is('a')) {
        l_item = $target.attr('id');
        l_item = l_item.split('-')[1];

        //remove active links
        $leftColumn.find('.active').removeClass('active');
        //set the link as active
        $target.addClass('active viewed');

        //hide all panels
        _app.$content.find('.panel').removeAttr('style');

        //find the corresponding panel and position it in the center of the link
        //unless it tries to spill over the page
        $panel = _app.$content.find('#panel-'+ l_item);
        panelHeight = $panel.actual('height');

        //get the link co-ordinates
        t_top = $target.position().top;
        t_height = $target.height();
        l_top = t_top + (t_height / 2);
        //now halve the height of the panel with it
        l_top = l_top - (panelHeight + 30) / 2;

        //check bottom
        if (areaOffset + l_top + panelHeight > areaHeight) {
          var diff = areaHeight - (areaOffset + l_top + panelHeight);
          l_top += diff;
        }

        //check if the panel will spill over the top
        if (l_top < -15) l_top = -15;

        //give the right column the margin
        _app.$content.find('.right-column').css('margin-top', Math.floor(l_top));

        //show the panel
        $panel.fadeIn(500, function() {
          $panel.findFirstText().attr('tabindex', '-1').focus();

          //tab to the next link
          $(document).bind('keyup.explore', function(e) {
            if (e.keyCode == 9) {
              var l_next = Number(l_item) + 1;
              $('#link-'+ l_next).focus();
              $(document).unbind('keyup.explore');
            }
          });
        });

        //mark the panel as viewed
        scope.data.information.item[l_item].viewed = 1;

        //enable next if done
        if (scope.viewedAll()) {
          $('#btn-page-navigation-next').enable();
        }
      }

      return false;
    });

    this._super();

    //enable next if done
    if (this.viewedAll()) {
      $('#btn-page-navigation-next').enable();
    }

  },



  /**
   * The elements that need their dimensions updated
   * Called on first load of the page and on resize of window
   */
  resizePage : function() {

    var $inner = _app.$content.find('.inner').eq(0),
        $title = $inner.find('.page-title'),
        $main = $inner.find('#main-text'),
        l_height = $inner.height() - $title.height() - $main.height() - 50,
        $rightInner = _app.$content.find('.right-column .inner-wrap'),
        l_width = $rightInner.width() - 20;

    $rightInner.css({
      maxHeight: l_height,
      overflow: 'auto',
      paddingRight: '10px'
    });

    // $rightInner.find('img').scaleDimensions({ width:l_width });
  },



  /**
   * Check if all the links/panels were viewed
   */
  viewedAll : function() {

    var l_items = $.makeArray(this.data.information.item),
        l_count = l_items.length,
        l_userData = _app.session.getUserData(this.id)[2] || [],
        l_complete = true;

    //check if its been completed
    for (var i = 0; i < l_count; i++) {
      l_userData[i] = l_items[i].viewed;

      if (l_items[i].viewed === 0) {
        //item not viewed
        l_complete = false;
      }
    }

    //update the interaction data
    this.updatePageData([-1, l_userData]);

    return l_complete;
  }

});
