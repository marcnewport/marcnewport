module.exports = function() {

  var $home = $('#home');
  var homeHeight = $home.height();
  var $titleBig = $home.find('.title-big');
  var $titleSmall = $home.find('.title-small');

  $document.on('scroll', function() {
    var scrollTop = $document.scrollTop();
    var percentScrolled = (scrollTop / homeHeight) * 100;
    var opacity = (100 - percentScrolled) / 100;

    // Animate/parallax the titles
    $titleSmall.css({
      position: 'relative',
      top: (scrollTop / 2) +'px',
      opacity: opacity
    });
    $titleBig.eq(0).css({
        position: 'relative',
        top: (scrollTop / 3.5) +'px',
        opacity: opacity * 1.5
    });
    $titleBig.eq(1).css({
        position: 'relative',
        top: (scrollTop / 15) +'px',
        opacity: opacity * 2
    });
  });
}
