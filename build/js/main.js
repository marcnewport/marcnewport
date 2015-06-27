(function($) {
  $(document).ready(function() {

    var $window = $(window);

    $window.bind('resize', function() {
      var winHeight = window.innerHeight,
          $home = $('#home'),
          $container = $home.find('.container'),
          margin = (winHeight - $container.height()) / 2;

      //TODO only if the content is less than the window size
      $home.height(winHeight);
      $container.css({ marginTop:margin });
    })
    .bind('scroll', function() {
      var position = $window.scrollTop(),
          top = Math.round(position / 4);

      $('.img-bg').css({ marginTop:top +'px' })
    })
    .trigger('resize');

  });
}(jQuery));
