module.exports = function() {

  var $window = $(window),
      windowHeight = $window.height(),
      $footer = $document.find('footer'),
      footerHeight = $footer.height(),
      position,
      diff,
      opacity,
      revealed = false;

  $document.on('scroll', function() {
    position = $document.scrollTop() + windowHeight;
    diff = (document.body.scrollHeight - position) / footerHeight;

    if (diff < 1) {
      // Animate the icons once the footer is half revealed
      if (diff < 0.5 && ! revealed) {
        animateIcons(true);
        revealed = true;
      }
    }
    else {
      // Reset the icons
      if (revealed) {
        animateIcons(false);
        revealed = false;
      }
    }
  });



  /**
   * Animate the icons in the footer by setting the scale to 1
   *
   * @param  {Boolean} animate
   *         To animate, or not to animate
   */
  function animateIcons(animate) {

    var $icons = $footer.find('a'),
        delay = 66;

    if (animate) {
      $icons.each(function(i) {
        var el = this;

        // Stagger the animation
        setTimeout(function() {
          el.style.transform = 'scale(1)';
        }, delay * i);
      });
    }
    else {
      $icons.removeAttr('style');
    }
  }
};
