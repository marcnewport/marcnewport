(function($) {
  $(document).ready(function() {

    'use strict';

    var $window = $(window),
        winHeight = 0,
        winWidth = 0,
        containerWidth = 0,
        $toggle = $('#navigation-toggle'),
        $navigation = $('#navigation'),
        $home = $('#home'),
        $homeContainer = $home.find('.container'),
        $awards = $('#awards').find('.award-item'),
        $projectContainer = $('#project-container'),
        $projects = $projectContainer.find('.project-item'),
        projectIndex = 0,
        $contacts = $('#contact').find('.contact-list');

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
    //$('[data-toggle="tooltip"]').tooltip();

    setupProjects();
    //buildMap();


    /**
     * Handles window scrolling
     */
    function windowScrollHandler() {

      var position = $window.scrollTop(),
          //bgParallax = 0.4,
          //bgTop = Math.round(position * bgParallax),
          fgParallax = 0.6,
          fgTop = Math.round(position * fgParallax),
          percent = (position / (winHeight - 100)) * 100,
          opacity = (100 - percent) / 100;

      opacity = opacity.toFixed(5);
      if (opacity < 0) opacity = 0;

      $home//.css({ backgroundPosition:'50% '+ bgTop +'px' })
        .find('.row').eq(0).css({ position:'relative', top:fgTop +'px', opacity:opacity });
    }



    /**
     * Handles window resize
     */
    function windowResizeHandler() {
      //get window dimensions
      winWidth = $window.width();
      winHeight = $window.height();
      containerWidth = $homeContainer.width();

      //if the section's height is smaller than the window,
      //make it the height of the window
      // $('section').each(function() {
      //   var $this = $(this);
      //
      //   if ($this.height() < winHeight) {
      //     $this.height(winHeight);
      //   }
      // });

      // conatctSize = $contacts.find('div').eq(0).width();
      // $contacts.find('a').css({
      //   width: conatctSize,
      //   height: conatctSize
      // })
      // .find('i').css({
      //   lineHeight: conatctSize +'px',
      //   fontSize: (conatctSize * 0.5) +'px'
      // });


      //ScrollReveal().reveal('.skill');


      //hide the nav
      $navigation.css({ left:'-'+ winWidth +'px' });

      resizeHome();
      resizeAwards();
      resizeProjects();

      //call the scroll handler to update home parralax
      windowScrollHandler();
    }



    /**
     * Resize the home section
     */
    function resizeHome() {

      var margin = winHeight - $homeContainer.height();
      //place MARC NEWPORT text near bottom of container
      $homeContainer.css({ marginTop:margin });
    }



    /**
     * Resize the awards section
     */
    function resizeAwards() {

      var awardHeight = 0;

      //set award height to tallest
      $awards.each(function() {
        awardHeight = Math.max(awardHeight, $(this).height());
      });

      $awards.height(awardHeight);
    }



    /**
     * Resize the awards section
     */
    function resizeProjects() {

      $projectContainer.height($projects.height() + 50);

      $projects.each(function(i) {
        $(this).css({
          width: containerWidth +'px',
          left: Number((containerWidth + 50) * (i - projectIndex)) +'px'
        });
      });
    }


    /**
     *
     */
    function setupProjects() {

      var $left = $('#slide-left'),
          $right = $('#slide-right'),
          count = $projects.length;

      $left.bind('click', function(e) {
        if (projectIndex > 0) {
          $projects.css({
            left: '+='+ Number(containerWidth + 50) +'px'
          });

          $right.removeClass('disabled');
          projectIndex--;
        }

        if (projectIndex === 0) {
          $left.addClass('disabled');
        }

        e.preventDefault();
      });

      $right.bind('click', function(e) {
        if (projectIndex < count - 1) {
          $projects.css({
            left: '-='+ Number(containerWidth + 50) +'px'
          });

          $left.removeClass('disabled');
          projectIndex++;
        }

        if (projectIndex === count - 1) {
          $right.addClass('disabled');
        }

        e.preventDefault();
      });
    }

  });
}(jQuery));
