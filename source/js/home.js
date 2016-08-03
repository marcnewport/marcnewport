module.exports = function() {

  var $home = $('#home');
  var homeHeight = $home.height();
  var $titleBig = $home.find('.title-big');
  var $titleSmall = $home.find('.title-small');

  $document.on('scroll', function() {
    var scrollTop = $document.scrollTop();
    var percentScrolled = (scrollTop / homeHeight) * 100;
    var opacity = [
      (50 - percentScrolled) / 100,
      (75 - percentScrolled) / 100,
      (100 - percentScrolled) / 100
    ];

    // Animate/parallax the titles
    $titleSmall.css({
      position: 'relative',
      top: (scrollTop / 3) +'px',
      opacity: opacity[0].toFixed(3)
    });
    $titleBig.eq(0).css({
        position: 'relative',
        top: (scrollTop / 5) +'px',
        opacity: opacity[1].toFixed(3)
    });
    $titleBig.eq(1).css({
        position: 'relative',
        top: (scrollTop / 10) +'px',
        opacity: opacity[2].toFixed(3)
    });
  });
}
