module.exports = function() {

  var $home = $('#home');
  var homeHeight = $home.height() * 0.6;
  var triggers = [0, homeHeight * 0.15, homeHeight * 0.3];
  var $parallaxImage = $home.find('.parallax-image');
  var $titleBig = $home.find('.title-big');
  var $titleSmall = $home.find('.title-small');

  $document.on('scroll', function() {
    var scrollTop = $document.scrollTop();
    var percentScrolled = 0;
    var opacity = [];

    for (var i in triggers) {
      percentScrolled = 0;
      if (scrollTop >= triggers[i]) {
        // Get the percentage scrolled relative to the trigger point
        percentScrolled = ((scrollTop - triggers[i]) / homeHeight * 100);
        // Keep that number in range of 0 - 100
        percentScrolled = Math.min(Math.max(percentScrolled, 0), 100);
      }
      opacity.push((100 - percentScrolled) / 100);
    }

    // Update top position for parallax effect, and opacity for depth
    $parallaxImage.css({
      top: (scrollTop / 2).toFixed(3) +'px'
    })
    $titleSmall.css({
      position: 'relative',
      top: (scrollTop / 3).toFixed(3) +'px',
      opacity: opacity[0].toFixed(3)
    });
    $titleBig.eq(0).css({
        position: 'relative',
        top: (scrollTop / 5).toFixed(3) +'px',
        opacity: opacity[1].toFixed(3)
    });
    $titleBig.eq(1).css({
        position: 'relative',
        top: (scrollTop / 10).toFixed(3) +'px',
        opacity: opacity[2].toFixed(3)
    });
  });
}
