/**
 * The functionality for a splash page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_splash
 * @extends PageType
 *
 * @todo fill images on resize of window
 */
var mp_splash = PageType.extend({



  /**
   * Builds the markup for the page
   */
  setup : function() {

    this.initial = true;
    this.slides = [];

    var scope = this,
        $slides = $$('div', 'slides'),
        $slide = [],
        l_slide = {},
        l_imgClass = 'showing',
        l_slides = $.makeArray(scope.data.slides.slide),
        l_slideCount = l_slides.length,
        $courseTitle = $$('div', 'course-title'),
        $copyright = $$('div', 'copyright-splash'),
        $start = $$('button', 'btn-start', 'button').html('Start');

    //build images
    for (var i = 0; i < l_slideCount; i++) {

      //hide all but first images
      if (i > 0) {
        l_imgClass = 'hidden';
      }

      //create img element
      $slide = $$('img', 'slide-'+ i, l_imgClass, {
        src: 'files/'+ l_slides[i].image,
        alt: l_slides[i].alt_text,
        width: l_slides[i].width,
        height: l_slides[i].height
      });

      //preload the images
      l_slide = new Image();
      l_slide.src = 'files/'+ l_slides[i].image;

      this.slides.push(l_slide);

      $slides.append($slide);
    }

    //setup page html
    this.html
        .append($courseTitle
          .append($$('div', 'splash-logo'))
          .append($$('h1').html(_app.structure.course.title)));

    if (_app.structure.course.module_title && _app.structure.course.module_title !== '') {
      this.html.append($$('h2', 'module-title').html(_app.structure.course.module_title));
    }

    //insert credits
    if (! empty(this.data.credits)) {
      $copyright
        .append($$('p', 'credits')
          .append($$('a').attr('href', '#')
            .append(this.data.credits_link || 'Acknowledgements and Credits')));
    }

    $copyright.append($$('p').html(_app.structure.course.copyright));

    this.html
      .append($slides)
      .append($copyright)
      .append($start);

    this._super();
  },



  /**
   * Called once the markup has been added to the dom
   */
  pageReady : function() {

    this._super();

    var scope = this,
        $credits = $('#credits'),
        $start = $('#btn-start'),
        l_slides = $.makeArray(this.data.slides.slide),
        l_slidesLength = l_slides.length,
        l_creditsLink = this.data.credits_link || 'Acknowledgements and Credits';

    //check if there are slides
    if (l_slidesLength > 1) {
      this.showImage(1);
    }

    $start.click(function(p_event) {
      _app.sequence.next();
      //remove the credits link if user is moving on
      $credits.remove();
      //trigger resize of window so normal page types get proper dimensions
      setTimeout(function() {
        $(window).trigger('resize');
      }, 500);
      p_event.preventDefault();
    });

    //listen for credits click
    $credits.click(function(p_event) {
      _app.modalOverlay(l_creditsLink, scope.data.credits);
      p_event.preventDefault();
    });
  },



  /**
   * Waits for l_duration then fades in an image from the slide pool
   * then continues to loop through the pool
   *
   * @param p_index
   *    The index of the slide to show
   */
  showImage : function(p_index) {

    var scope = this,
        l_next = p_index + 1,
        l_duration = 5000,
        l_transition = 2000;

    //wait duration then show next image
    setTimeout(function() {
      //check if the image has loaded (preloaded in setup)
      if (scope.slides[p_index].complete) {
        //fade out currently showing image
        _app.$content.find('#slides').find('.showing').fadeOut(l_transition, function() {
          $(this).removeClass('showing');
        });

        //fade in the next image at the same time but take slightly longer to do it
        _app.$content.find('#slide-'+ p_index).fadeIn(l_transition + 20, function() {
          $(this).addClass('showing');
        });

        //check if there's a next image
        if (l_next >= scope.slides.length) {
          l_next = 0;
        }

        scope.showImage(l_next);
      }
      else {
        //TODO : handle a non loaded image
      }
    },
    l_duration);
  },



  /**
   * The elements that need their dimensions updated
   * Called on load of page and on resize of window
   *
   * @todo cache the elements outside of this function
   */
  resizePage : function() {

    var $title = _app.$content.find('#course-title'),
        $h1 = $title.find('h1'),
        $logo = $title.find('#splash-logo'),
        l_logoWidth = $logo.width(),
        l_titleMargin = $h1.outerWidth(true) - $h1.outerWidth(),
        $moduleTitle = _app.$content.find('#module-title'),
        moduleTitleHeight = $moduleTitle.outerHeight(),
        moduleTitlePadding = 0,
        ModuleTitleDiff = 0,
        $slides = _app.$content.find('#slides'),
        l_width = _app.$body.width(),
        l_height = _app.$body.height(),
        l_maxWidth = l_width,
        $copyright = _app.$content.find('#copyright-splash'),
        l_maxHeight = _app.dimensions.height - $title.height() - $copyright.height();

    //content size on splash page is different to other pages
    _app.$content.css({
      width: l_width,
      height: l_height
    });

    $h1.css({
      marginTop: ($title.height() - $h1.height()) / 2,
      width: l_width - l_titleMargin - l_logoWidth - 5
    });

    $slides.height(l_maxHeight)
      .find('img').scaleDimensions({ width:l_maxWidth, height:l_maxHeight, fill:true });

    if (moduleTitleHeight > l_maxHeight) {
      moduleTitlePadding = parseInt($moduleTitle.css('padding-top'), 10);
      ModuleTitleDiff = moduleTitleHeight - l_maxHeight;
      $moduleTitle.css('padding-top', (moduleTitlePadding - ModuleTitleDiff) +'px');
    }
  }

});
