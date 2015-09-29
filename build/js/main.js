(function($) {
  $(document).ready(function() {

    'use strict';

    var $window = $(window),
        winHeight = 0,
        winWidth = 0,
        $toggle = $('#navigation-toggle'),
        $navigation = $('#navigation'),
        $home = $('#home');

    //add some listeners to the window
    $window.bind('resize', windowResizeHandler)
    .bind('scroll', windowScrollHandler)
    //call the resize listener immediately
    .trigger('resize');

    $toggle.on('click', function() {
      $navigation.css({ left:0 })
    });



    /**
     * Handles window resize
     */
    function windowResizeHandler() {

      winWidth = $window.width();
      winHeight = $window.height();

      var $container = $home.find('.container'),
          margin = (winHeight - $container.height()) - 30;

      //TODO only if the content is less than the window size
      $navigation.css({ left:'-'+ winWidth +'px' });
      $('section').height(winHeight);
      $container.css({ marginTop:margin });
    }



    /**
     * Handles window scrolling
     */
    function windowScrollHandler() {

      var position = $window.scrollTop(),
          bgParallax = 0.3,
          bgTop = Math.round(position * bgParallax),
          fgParallax = 0.6,
          fgTop = Math.round(position * fgParallax),
          percent = (position / (winHeight - 100)) * 100,
          opacity = (100 - percent) / 100;

      $('#home').css({ backgroundPosition:'50% '+ bgTop +'px' })
      .find('.row').eq(0).css({ marginTop:fgTop +'px', opacity:opacity });
    }
  });
}(jQuery));
