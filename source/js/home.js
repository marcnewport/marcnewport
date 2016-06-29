module.exports = function() {

  var $home = $('#home');
  var $layers = $('<div/>').addClass('layers');
  var layers = 3;

  // Create some divs to stick the stars into
  while (layers) {

    var $layer = $('<div/>').addClass('layer layer-'+ layers);
    var stars = 30;

    // Create a bunch of stars that are randomly positioned and scaled
    while (stars) {
      $star = $('<span/>')
        .addClass('star')
        .html('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M10.744,5.372C7.777,5.372,5.372,2.967,5.372,0c0,2.967-2.405,5.372-5.372,5.372c2.967,0,5.372,2.405,5.372,5.372 C5.372,7.777,7.777,5.372,10.744,5.372z"/></svg>')
        .css({
          left: _.random(1, 100) +'%',
          top: _.random(1, 100) +'%',
          transform: 'scale('+ _.randomFloat(0, 1) +')',
          opacity: _.randomFloat(0.6, 1)
        });

      $layer.append($star);
      stars--;
    }

    $layers.append($layer);
    layers--;
  }

  // Insert the stars into the DOM 
  $home.append($layers);

  $layer = $layers.find('.layer');

  var $document = $(document);
  var homeHeight = $home.height();
  var $titleBig = $home.find('.title-big');
  var $titleSmall = $home.find('.title-small');

  $document.on('scroll', function() {
    var scrollTop = $document.scrollTop();

    // Parallax the titles
    $titleBig.css({
      // marginTop: (scrollTop * 2) +'px'
    });
    $titleSmall.css({
      // marginTop: (scrollTop / 2.8) +'px'
    });

    // Parallax the star layers
    $layer.each(function(i) {
      $layer.eq(i).css({
        marginTop: (scrollTop / (i + 1)) +'px'
      });
    });

    // Fade to black
    var percentScrolled = (scrollTop / homeHeight) * 100;
    var opacity = (100 - percentScrolled) / 100;

    $layers.css({ opacity: opacity });
  });
}
