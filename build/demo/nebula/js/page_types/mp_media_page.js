/**
 * The functionality for a media page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2015
 * @version 1.0
 * @class mp_media_page
 * @extends PageType
 */
var mp_media_page = PageType.extend({
  
  
  
  /**
   * Build pagetype markup
   */
  setup : function() {
    
    var l_media = $.makeArray(this.data.media.item),
        l_count = l_media.length,
        $media = $$('div', 'media'),
        l_alt = '';
    
    for (var i = 0; i < l_count; i++) {
      l_alt = l_media[i].thumb_alt || '';
      
      $media
        .append($$('div', 'media-item-'+ i, 'media-item')
          .append($$('div', '', 'thumb')
            .append($$('img').attr({ src:'files/'+ l_media[i].thumb, alt:l_alt })))
          .append($$('h5', '', 'title').html(l_media[i].title))
          .append($$('div', '', 'text').html(l_media[i].content)));
    }
    
    this.html
      .append($$('div', '', 'column left-column').html(this.data.main_content))
      .append($$('div', '', 'column right-column').html($media));
    
    this._super();
  },




  /**
   * Called once markup is inserted
   */
  pageReady : function() {
    
    this._super();
    
    var scope = this,
        $media = _app.$content.find('#media');
    
    //listen for thumbnail click
    $media.bind('click', function(e) {
      var $target = $(e.target);
      
      if ($target.is('img')) {
        //get index of media item clicked
        var l_index = Number($target.parents('.media-item').attr('id').split('-').pop());
        scope.showMedia(l_index);
      }
    });
  },
  
  
  
  /**
   * Shows media as a popup
   */
  showMedia : function(p_index) {
    
    var l_media = $.makeArray(this.data.media.item)[p_index].media.item,
        $content = $$('div', '', 'media'),
        $modal = [],
        l_dimensions = {},
        l_player = {},
        l_transcript = {};
    
    if (l_media.type) {
      switch (l_media.type) {
        case 'mp_resource_image':
          var $img = $$('img').attr({
            src: 'files/'+ l_media.content,
            alt: l_media.alt_text,
            width: l_media.width,
            height: l_media.height
          });
//          
//          _app.modalOverlay('', $content, 'full').addClass('media-page');
//          $content.html($img.scaleDimensions({ width:660, height:370, fill:true }));
            
            $modal = _app.modalOverlay('', $content, 'full', '', function() {
            
              l_dimensions = {
                width: $modal.find('.content').width(),
                height: $modal.find('.content').height(),
                fill: true
              };
              
              $content.html($img.scaleDimensions(l_dimensions));
              
            }).addClass('media-page');
          break;

        case 'mp_resource_video':
          $content.attr('id', 'media-popup-player');
          
          $modal = _app.modalOverlay('', $content, 'full', 'Close', function() {
            //gather the modals inner dimensions
            l_dimensions = {
              width: $modal.find('.content').width(),
              height: $modal.find('.content').height()
            };
            //set the the video 16*9 - assuming height is good
            l_media.width = Math.round((l_dimensions.height / 9) * 16);
            l_media.height = l_dimensions.height;
            //check if video is too wide
            if (l_media.width + 152 > l_dimensions.width) {
              //100px transcript min-width + 2px margin
              l_media.width = l_dimensions.width - 152;
              l_media.height = Math.round((l_media.width / 16) * 9);
            }
            
            l_player = _app.setupVideoPlayer('media-popup-player', l_media);
            
            //is there a transcript?
            if (l_media.description) {
              //make the width the remainder
              l_transcript = {
                width: l_dimensions.width - l_media.width - 2,
                height: l_media.height
              };
              
              $modal.find('.content')
                .append($$('div').html(l_media.description).transcript('right', l_transcript, 'media-popup-player', false));
            }
            
            setTimeout(function() {
              if (l_player.getState() === 'PLAYING') {
                l_player.pause();
              }
            }, 200);
            
          }).addClass('media-page');
          break;
      }
    }
  },
  
  
  
  /**
   * The elements that need their dimensions updated
   * Called on load of page and on resize of window
   */
  resizePage : function() {
    
    var $inner = _app.$content.find('.inner'),
        $title = $inner.find('.page-title'),
        $left = $inner.find('.left-column'),
        $right = $inner.find('.right-column'),
        l_height = $inner.height() - $title.height();
    
    $left.css({
      width: $inner.width() - $right.width() - 25,
      height: l_height
    });
    
    $right.height(l_height);
  }
});
