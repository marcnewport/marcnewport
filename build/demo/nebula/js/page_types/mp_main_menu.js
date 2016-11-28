/**
 * The functionality for a mp_main_menu page type
 *
 * @author marc.newport@kineo.com.au
 * @copyright Kineo 2016
 * @version 2.x
 * @class mp_main_menu
 * @extends PageType
 */
var mp_main_menu = PageType.extend({



  /**
   * Build page markup
   */
  setup : function() {

    this.updatePageData();

    $('#panel-buttons').hide();

    var l_items = $.makeArray(this.data.links.item),
        l_count = l_items.length,
        l_completion = 0,
        l_score = 0,
        $leftColumn = $$('div', '', 'left-column-inner'),
        $centreColumn = $$('div', '', 'centre-column-inner'),
        $rightColumn = $$('div', '', 'right-column-inner');

    if (this.data.introduction) {
      $leftColumn.append($$('div', '', 'introduction').html(this.data.introduction));
    }

    if (this.data.media_description) {
      $leftColumn.append($$('div', '', 'media-description').html(this.data.media_description));
    }

    if (this.data.video && this.data.video.item) {
      $leftColumn.append($$('a', '', 'btn-video', { href:'#' }).html('Play video'));
    }

    for (var i = 0; i < l_count; i++) {

      l_completion = _app.session.getTopicCompletionPercent(l_items[i].link);

      if (l_items[i].type === 'assessment') {
        l_score = _app.session.getUserData('score');
        l_completion = l_score ? Math.round(l_score[3]) : 0;
      }

      // draw the circle as an svg
      var l_icon = '<i class="icon icon-chevron-right"></i>';
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      var circle = document.createElementNS(svg.namespaceURI, 'circle');
      circle.setAttribute('cx', '50%');
      circle.setAttribute('cy', '50%');
      circle.setAttribute('r', '50%');
      circle.setAttribute('stroke-alignment', 'inner');
      circle.setAttribute('class', 'percent-circle-inner');
      svg.appendChild(circle);

      if (l_items[i].type === 'assessment') {
        var l_scoreDescription = 'This section is mandatory, you\'d need at least <strong>';
        l_scoreDescription += _app.structure.course.settings.pass_mark || 0;
        l_scoreDescription += '%</strong> to pass.'

        $rightColumn
          .append($$('div', l_items[i].link, 'link '+ l_items[i].type)
            .append($$('div', '', 'link-inner')
              .append($$('div', '', 'link-title').html(l_items[i].title))
              .append($$('div', '', 'link-description').html(l_items[i].description))
              .append($$('div', '', 'score-circle', { 'data-percent':l_completion }))
              .append($$('div', '', 'score-description').html(l_scoreDescription))
            )
            .append($$('div', '', 'link-footer').html(l_items[i].title +' '+ l_icon))
          );
      }
      else {
        $centreColumn
          .append($$('div', l_items[i].link, 'link '+ l_items[i].type)
            .append($$('div', '', 'percent-circle', { 'data-percent':l_completion }).html(svg))
            .append($$('div', '', 'link-inner')
              .append($$('div', '', 'link-title').html(l_items[i].title +' '+ l_icon))
              .append($$('div', '', 'link-description').html(l_items[i].description))
            )
          );
      }
    }

    if (this.data.background_image.item && this.data.background_image.item.content) {
      this.html
        .prepend($$('img', '', 'background-image', {
          src: 'files/'+ this.data.background_image.item.content,
          alt: this.data.background_image.alt_text
        }));
    }

    this.html
      .append($$('div', '', 'left-column').html($leftColumn))
      .append($$('div', '', 'centre-column').html($centreColumn))
      .append($$('div', '', 'right-column').html($rightColumn));

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var scope = this;

    //add functionality
    _app.$content.on('click', '.link', function(e) {

      var l_child = _app.structure.firstViewableChild(this.id);

      //the clickable area on an assessment link is the footer
      if ($(this).hasClass('assessment')) {
        if ($(e.target).hasClass('link-footer')) {
          _app.sequence.goTo(l_child.id);
        }
      }
      //the other links, the whole thing is clickable
      else {
        _app.sequence.goTo(l_child.id);
      }
    });

    //open the video
    _app.$content.find('.btn-video').on('click', function(e) {

      var $modalContent = $$('div', 'main-menu-video'),
          l_video = scope.data.video.item,
          l_spacing = 0;

      var $modal = _app.modalOverlay('', $modalContent, 'full', 'Close', function($content) {

        l_video.height = $content.height();
        l_video.width = Math.round((l_video.height / 9) * 16);
        l_spacing = ($content.width() - l_video.width) / 2;

        $modal.css({
          width: $modal.width() - l_spacing
        });

        $content.prepend($$('div', '', 'modal-spacing').css({
          'width': l_spacing,
          'height': l_spacing,
          'float': 'left'
        }));

        _app.setupVideoPlayer('main-menu-video', l_video);
      });

      e.preventDefault();
    });

    //animate each topic to its percent
    _app.$content.find('.percent-circle').each(function() {

      var $this = $(this),
          percent = $this.data('percent') / 100,
          diameter = $this.width(),
          circumference = Math.ceil(diameter * Math.PI),
          stroke = Math.ceil(circumference * percent),
          diff = circumference - stroke;

      $this.find('.percent-circle-inner').css({
        strokeDasharray: stroke +'px '+ diff +'px'
      })
    });
  },



  /**
   * Resize elements on the page (called once elements are available)
   */
  resizePage : function() {

    var $title = _app.$content.find('.page-title'),
        l_minHeight = parseInt($title.css('min-height'), 10),
        $h2 = $title.find('h2'),
        l_height = $h2.height();

    // vertically align the title to the logo
    if (l_height < l_minHeight) {
      $h2.css({ marginTop: (l_minHeight - l_height) / 2 });
    }

  },


  destroy: function() {
    if (_app.navigation !== 'hamburger') $('#panel-buttons').fadeIn();
  }

});
