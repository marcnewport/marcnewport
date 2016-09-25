var home = require('./home');
var projects = require('./projects');
var footer = require('./footer');


(function($) {

  global.$window = $(window);
  global.$document = $(document);
  global.hash = '#home';
  global.modalShowing = false;

  $document.ready(function() {

    'use strict';

    var $body = $('body');

    // Animate scrolling to the anchor target
    $body.on('click.navigate', '.btn-navigate-down', handleNavigation);
    $window.on('hashchange', handleNavigation);

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
  function handleNavigation(e) {

    var el;

    console.log(e.target);

    if (e.type === 'click') {
      el = $(this).attr('href');

      $('html, body').animate({
        scrollTop: $(el).offset().top
      },
      400,
      function() {
        window.location.hash = el;
      });
    }
    else {
      if (modalShowing) {
        $('.project-modal').modal('hide');
      }
      else {
        el = window.location.hash || '#home';

        $('html, body').animate({
          scrollTop: $(el).offset().top
        },
        400,
        function() {
          window.location.hash = el === '#home' ? '' : el;
        });
      }
    }

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
