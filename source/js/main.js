var utils = require('./utils');
// var home = require('./home');
var projects = require('./projects');

var footer = require('./footer');

utils();

(function($) {

  global.$document = $(document);
  global.hash = '#home';

  $document.ready(function() {

    'use strict';

    var $body = $('body');

    // Animate scrolling to the anchor target
    $body.on('click.navigate', '.btn-navigate-down', smoothScroll);
    $(window).on('hashchange', smoothScroll);

    // $body.on('click.project', 'a[data-toggle="project"]', function(e) {
    //   console.log(e);
    //
    //   $body.toggleClass('show-project')
    //
    //   e.preventDefault();
    // })



    // home();

    projects();

    footer();
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
