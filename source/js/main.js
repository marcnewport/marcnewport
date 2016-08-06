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

    // // Animate scrolling to the anchor target
    $body.on('click.navigate', '.btn-navigate-down', smoothScroll);
    $window.on('hashchange', smoothScroll);



    home();

    projects();

    footer();

    ScrollReveal({ reset: true }).reveal('.img-circle', { duration: 1000 });
  });



  /**
   * Event handler for click and hashchange that scrolls the page to the internal anchors
   *
   * @param  {Object} e
   *         The event
   */
  function smoothScroll(e) {

    var el = e.type === 'click' ? $(this).attr('href') : window.location.hash || '#home';
    var pos = 0;

    if (global.hash !== el) {

      pos = $(el).offset().top;

      $('html, body').animate({
        scrollTop: pos
      },
      400,
      function() {
        window.location.hash = el === '#home' ? '' : el;
      });

      global.hash = el;
    }
    e.preventDefault();
  }

}(jQuery));
