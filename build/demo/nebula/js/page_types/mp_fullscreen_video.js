/**
 * The functionality for a video activity page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_video_activity
 * @extends PageType
 *
 * @todo video needs description to be WCAG compliant
 */
var mp_fullscreen_video = PageType.extend({


  /**
   * Builds the page types html markup
   */
  setup : function() {
    
    this.player = {};

    this.html
      .append($$('div','video-wrap')
      .append($$('div', 'fullscreen-video-'+ this.id)));
    
    this._super();
  },


  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var l_video = $.makeArray(this.data.video.item)[0],
        l_player = {},
        $pageTitle = _app.$content.find('.page-title'),
        $inner = _app.$content.find('.inner'),
        l_availableWidth = $inner.width(),
        l_availableHeight = $inner.height() - $pageTitle.height(),
        l_width = l_availableWidth,
        l_height = Math.round((l_width / 16) * 9),
        l_padding = 0,
        l_float = 'left';
    
    //check the height isnt bigger than the available space
    if (l_height > l_availableHeight) {
      l_height = l_availableHeight;
      l_width = Math.round(((l_height) / 9) * 16);
    }
    
    //initiate the player
    l_video.width = l_width;
    l_video.height = l_height;
    
    //add autoplay get var
    if (Number(this.data.autoplay) && Number(l_video.streaming)) {
      //does the url have other vars
      if (l_video.address.indexOf('?') < 0) {
        l_video.address += '?autoplay=1';
      }
      else {
        l_video.address += '&autoplay=1';
      }
    }
    
    l_player = _app.setupVideoPlayer('fullscreen-video-'+ this.id, l_video);
    //make the player available throughout the class
    this.player = l_player;

    //vimeo player gets autoplay var from tpl.php which is passed through the url
    //so if its a jwplayer, play that shit here
    if (l_player.jwplayer && Number(this.data.autoplay)) {
      l_player.onBufferFull(function() {
        if (l_player.getState() == 'PAUSED') {
          l_player.play();
        }
      });
    }
    
    //add description if there is one and move the video to the left
    if (l_video.description) {
      $inner.find('#video-wrap')
        .append($$('div').html(l_video.description).transcript('right', { width:(l_availableWidth - l_width), height:l_height }, 'fullscreen-video-'+ this.id));
    }
    else {
      l_padding = (l_availableWidth - l_width) / 2;
      l_float = 'none';
    }
    
    $inner.find('#video-wrap').css('padding-left', l_padding +'px')
      .find('.jwplayer-wrap').css('float', l_float);
  },
  
  
  resizePage : function() {
    
//    var $pageTitle = _app.$content.find('.page-title'),
//        $inner = _app.$content.find('.inner'),
//        l_availableWidth = $inner.width(),
//        l_availableHeight = $inner.height() - $pageTitle.height(),
//        l_width = l_availableWidth,
//        l_height = Math.round((l_width / 16) * 9),
//        l_padding = 95;
//    
//    //check the height isnt bigger than the available space
//    if (l_height > l_availableHeight) {
//      l_height = l_availableHeight;
//      l_width = Math.round((l_height / 9) * 16);
//    }
//    
//    if (this.player.resize) {
//      this.player.resize(l_width, l_height);
//    }
//    
//    l_padding = (l_availableWidth - l_width) / 2;
//    
//    $inner.find('#video-wrap').css('padding-left', l_padding +'px');
  }

});
