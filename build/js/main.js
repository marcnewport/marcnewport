(function($) {
  $(document).ready(function() {

    var $window = $(window),
        $home = $('#home'),
        $map = $('#map'),
        $canvas = $map.find('#map-canvas'),
        map = {};

    //add some listeners to the window
    $window.bind('resize', windowResizeHandler)
    .bind('scroll', windowScrollHandler)
    //call the resize listener immediately
    .trigger('resize');

    //insert the google map
    buildMap();



    /**
     * Handles window resize
     */
    function windowResizeHandler() {

      var winHeight = $window.height(),
          $container = $home.find('.container'),
          margin = (winHeight - $container.height()) / 2;

      //TODO only if the content is less than the window size
      $home.height(winHeight);
      $container.css({ marginTop:margin });

      //make the map 1/3 the size of the screen
      // $map.find('iframe').height(Math.round(winHeight * 0.4));
      $canvas.height(Math.round(winHeight * 0.5));
    }



    /**
     * Handles window scrolling
     */
    function windowScrollHandler() {

      var position = $window.scrollTop(),
          parallax = 0.4,
          top = Math.round(position * parallax),
          winHeight = $window.height(),
          kensington = {},
          marker = {};

      $('.img-bg').css({ marginTop:top +'px' });

      if (! map.animated) {
        if (position + winHeight >= document.body.scrollHeight - (winHeight / 2)) {
          kensington = new google.maps.LatLng(-37.794317, 144.929107);

          setTimeout(function() {
            marker = new google.maps.Marker({
              position: kensington,
              map: map,
              icon: 'media/logo-shadowed.png',
              animation: google.maps.Animation.DROP,
            });
          }, 1000);

            map.animated = true;
        }
      }
    }



    /**
     * Builds the google map
     */
    function buildMap() {

      var parkville = {};

      parkville = new google.maps.LatLng(-37.796802, 144.951059);

      map = new google.maps.Map($canvas.get(0), {
        zoom: 14,
        center: parkville,
        disableDefaultUI: true
      });

      map.animated = false;

      //give the map back its functionality on click
      $map.bind('click', function() {
        $canvas.removeClass('no-pointer-events');

        //remove the functionality again
        $map.unbind('mouseleave').bind('mouseleave', function() {
          $canvas.addClass('no-pointer-events');
          $map.unbind('mouseleave');
        });
      });
    }

  });
}(jQuery));
