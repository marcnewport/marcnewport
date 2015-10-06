(function($) {
  $(document).ready(function() {

    'use strict';

    var $window = $(window),
        winHeight = 0,
        winWidth = 0,
        $toggle = $('#navigation-toggle'),
        $navigation = $('#navigation'),
        $home = $('#home'),
        $homeContainer = $home.find('.container'),
        $awards = $('#awards').find('.award-item');

    //add some listeners to the window
    $window.bind('resize', windowResizeHandler)
      .bind('scroll', windowScrollHandler)
      //call the resize listener immediately
      .trigger('resize');

    //toggle the nav
    $toggle.on('click', function() {
      $navigation.css({ left:0 });
    });

    //turn on tooltips
    $('[data-toggle="tooltip"]').tooltip();



    /**
     * Handles window resize
     */
    function windowResizeHandler() {
      //get window dimensions
      winWidth = $window.width();
      winHeight = $window.height();

      var margin = winHeight - $homeContainer.height(),
          awardHeight = 0;

      //hide the nav
      $navigation.css({ left:'-'+ winWidth +'px' });

      //if the section's height is smaller than the window,
      //make it the height of the window
      // $('section').each(function() {
      //   var $this = $(this);
      //
      //   if ($this.height() < winHeight) {
      //     $this.height(winHeight);
      //   }
      // });

      //place MARC NEWPORT text near bottom of container
      $homeContainer.css({ marginTop:margin });
      windowScrollHandler();

      //set award height to tallest
      $awards.each(function() {
        awardHeight = Math.max(awardHeight, $(this).height());
      });

      $awards.height(awardHeight);
    }



    /**
     * Handles window scrolling
     */
    function windowScrollHandler() {

      var position = $window.scrollTop(),
          bgParallax = 0.4,
          bgTop = Math.round(position * bgParallax),
          fgParallax = 0.6,
          fgTop = Math.round(position * fgParallax),
          percent = (position / (winHeight - 100)) * 100,
          opacity = (100 - percent) / 100;

      opacity = opacity.toFixed(5);
      if (opacity < 0) opacity = 0;

      $home.css({ backgroundPosition:'50% '+ bgTop +'px' })
        .find('.row').eq(0).css({ position:'relative', top:fgTop +'px', opacity:opacity });
    }
  });
}(jQuery));
