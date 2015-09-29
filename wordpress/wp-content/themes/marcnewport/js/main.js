(function($) {
  $(document).ready(function() {

    var $window = $(window),
        $home = $('#home'),
        $map = $('#map'),
        $canvas = $map.find('#map-canvas'),
        map = {};

    //add some listeners to the window
    $window
      .bind('resize', windowResizeHandler)
      .bind('scroll', windowScrollHandler)
      //call the resize listener immediately
      .trigger('resize');

    //$home.find('.img-bg').fillParent();

    // $('.section-title').each(function() {
    //   //console.log(this.innerHTML)
    //   //console.log(this.clientWidth)
    //   this.style.width = this.clientWidth +'px';
    //   this.style.float = 'none';
    // });

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
      //$container.css({ marginTop:margin });

      //make the map 1/3 the size of the screen
      // $map.find('iframe').height(Math.round(winHeight * 0.4));
      $canvas.height(Math.round(winHeight * 0.5));
    }



    /**
     * Handles window scrolling
     */
    function windowScrollHandler() {

      var position = $window.scrollTop(),
          parallax = 0.6,
          top = Math.round(position * parallax),
          winHeight = $window.height(),
          kensington = {},
          marker = {};

      //$('.img-bg').css({ marginTop:top +'px' });
      $home.css({ backgroundPosition: 'center '+ top +'px' });

      if (! map.animated) {
        if (position + winHeight >= document.body.scrollHeight - (winHeight / 2)) {
          kensington = new google.maps.LatLng(-37.794317, 144.929107);

          setTimeout(function() {
            marker = new google.maps.Marker({
              position: kensington,
              map: map,
              //icon: 'media/logo-shadowed.png',
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

      var northMelbourne = new google.maps.LatLng(-37.801992, 144.949747);

      map = new google.maps.Map($canvas.get(0), {
        zoom: 13,
        center: northMelbourne,
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


  String.prototype.getWidth = function(font) {
    var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

    context.font = font;
    return Math.round(context.measureText(this).width);
  }

  $.fn.fillParent = function() {
    return this.each(function() {
      var image = this,
          parent = image.parentElement,
          naturalWidth = image.naturalWidth,
          naturalHeight = image.naturalHeight,
          width = 0,
          height = 0,
          scale = 0,
          xOffset = 0,
          yOffset = 0;

      //remove dimension attributes - css is smoother
      image.removeAttribute('width');
      image.removeAttribute('height');

      //listen for browser resize
      $(window).bind('resize.fillParent', function() {
        //stretch width to fit
        width = parent.clientWidth;
        scale =  width / naturalWidth;
        height = naturalHeight * scale;

        //check height aint too small
        if (height < parent.clientHeight) {
          height = parent.clientHeight;
          scale = height / naturalHeight;
          width = naturalWidth * scale;
        }

        //update with new dimensions
        image.style.width = width +'px';
        image.style.height = height +'px';

        //centre the image
        xOffset = Math.round((parent.clientWidth - width) / 2);
        if (xOffset) image.style.marginLeft = xOffset +'px';
        yOffset = Math.round((parent.clientHeight - height) / 2);
        if (yOffset) image.style.marginTop = yOffset +'px';
      })
      .trigger('resize.fillParent');
    });
  };
}(jQuery));
