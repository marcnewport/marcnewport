var home = require('./home');
var projects = require('./projects');
var footer = require('./footer');


(function($) {

  global.$window = $(window);
  global.$document = $(document);
  global.hash = '#home';

  $document.ready(function() {

    'use strict';

    var $body = $('body');

    // Animate scrolling to the anchor target
    $body.on('click.navigate', '.btn-navigate-down', smoothScroll);
    $window.on('hashchange', smoothScroll);

    home();
    projects();
    footer();

    // Use scrollreveal
    var sr = ScrollReveal({ reset: true });
    if (sr.isSupported()) {
      sr.reveal('.img-circle', { duration: 1000 });
    }
  });



  /**
   * Event handler for click and hashchange that scrolls the page to the internal anchors
   */
  function smoothScroll(e) {

    var el = e.type === 'click' ? $(this).attr('href') : window.location.hash || '#home';
    var pos = $(el).offset().top;

    $('html, body').animate({
      scrollTop: pos
    },
    400,
    function() {
      window.location.hash = el === '#home' ? '' : el;
    });

    global.hash = el;

    return false;
  }


  /**
   * Check if client supports CSS Transform and CSS Transition.
   * @return {boolean}
   */
  ScrollReveal.prototype.isSupported = function () {
    var style = document.documentElement.style;
    return 'WebkitTransition' in style && 'WebkitTransform' in style || 'transition' in style && 'transform' in style;
  }

}(jQuery));
