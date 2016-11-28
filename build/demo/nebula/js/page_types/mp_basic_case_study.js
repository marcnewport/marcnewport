/**
 * The functionality for a basic case study.
 * Make sure mp_basic.js is loaded from index.html
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_basic
 * @extends PageType
 */
var mp_basic_case_study = mp_basic.extend({



  /**
   * copied from mp_basic but tacked on some case study specific stuff instead of calling _super()
   */
  setup : function() {

    this.playerId = 'page-media-'+ $.randomString(6);

    var scope = this,
        $main = $$('div', '', 'main-text'),
        l_title = this.data.heading ? $$('h3').html(this.data.heading) : '',
        l_title2 = this.data.heading2 ? $$('h3').html(this.data.heading2) : '',
        l_media = $.makeArray(this.data.assets.item || []),
        l_mediaCount = l_media.length,
        $img = [],
        l_image = {},
        l_csTabIndex = 0;

    //add basic type to class name (use hyphens not underscores)
    this.html.addClass(this.data.basic_type.replace(/_/g, '-'));

    switch (this.data.basic_type) {
      //basic text layout--------------------------------------------------------------
      case 'text_only':
        this.html
            .append($main
                .append(l_title)
                .append(this.data.main));
        break;

      //columned latout-----------------------------------------------------------------
      case 'columns':
        this.html
            .append($$('div', '', 'left-column column')
                .append(l_title)
                .append(this.data.main))
            .append($$('div', '', 'right-column column')
                .append(l_title2)
                .append(this.data.main2));
        break;

      //left floating image layout------------------------------------------------------
      case 'image_inline':
        //get the image resource
        for(var i = 0; i < l_mediaCount; i++) {
          switch(l_media[i].type) {
            case 'mp_resource_image': l_image = l_media[i]; break;
          }
        }

        //create the image element
        $img = $$('img').attr({
          id: this.playerId,
          'class': 'page-media',
          src: 'files/'+ l_image.content,
          alt: l_image.alt_text,
          width: l_image.width,
          height: l_image.height
        });

        //insert page content
        this.html
            .append($img)
            .append($main
                .append(l_title)
                .append(this.data.main));
        break;

      //full width image layout------------------------------------------------------
      case 'image_full_width':
        //get the image resource
        for(var i = 0; i < l_mediaCount; i++) {
          switch(l_media[i].type) {
            case 'mp_resource_image': l_image = l_media[i]; break;
          }
        }

        //create the image element
        $img = $$('img').attr({
          id: this.playerId,
          'class': 'page-media',
          src: 'files/'+ l_image.content,
          alt: l_image.alt_text,
          width: l_image.width,
          height: l_image.height
        });

        //insert page content
        this.html
            .append($main
                .append($$('p').html($img))
                .append(l_title)
                .append(this.data.main));
        break;

      //media player layout----------------------------------------------------
      case 'video':
      case 'audio':
      case 'audio_image':
        this.html
            .append($main
                .append(l_title)
                .append(this.data.main))
            .append($$('div', this.playerId, 'page-media'));
        break;
    }

    //don't call _super()

    // if case study panel, insert html into panel
    l_csTabIndex = _app.structure.parent((_app.structure.parent(this.data.id).id)).id;
    _app.panels.case_study.$panel.find('#tab-content-'+ l_csTabIndex).find('.tab-sub-content').html(this.html.wrapInner( $$('div','','inner')));

    //wait a tad, then call out that we're ready
    setTimeout(function() {
      scope.pageReady();
    }, 10);
  },



  /**
   * The elements that need their dimensions updated
   * Called on load of page and on resize of window
   */
  resizePage : function() {

    var pageId = this.id,
        $page = $('#panels').find('#'+ pageId),
        pageHeight = $page.height();

    if ($page.hasClass('video')) {

      var $pageTitle = $page.find('.page-title'),
          pageTitleHeight = $pageTitle.height(),
          $mainText = $page.find('.main-text'),
          $media = $page.find('.jwplayer-wrap'),
          mediaHeight = $media.height(),
          newHeight = pageHeight - pageTitleHeight - mediaHeight -20;

      $mainText.css('max-height', newHeight +'px');
    }
  },



  /**
   * Loads media player
   */
  initiateMedia : function() {

    var l_media = $.makeArray(this.data.assets.item),
        l_mediaCount = l_media.length,
        l_video = {},
        l_audio = {},
        l_image = {},
        $inner = _app.panels.case_study.$panel.find('#'+ this.data.id +' > .inner');

    //look through the media and identify it
    for (var i = 0; i < l_mediaCount; i++) {
      switch(l_media[i].type) {
        case 'mp_resource_video': l_video = l_media[i]; break;
        case 'mp_resource_audio': l_audio = l_media[i]; break;
        case 'mp_resource_image': l_image = l_media[i]; break;
      }
    }

    //insert media
    switch (this.data.basic_type) {

      //video
      case 'video':
        l_video.width = 466;
        l_video.height = 262;

        _app.setupVideoPlayer(this.playerId, l_video);

       //insert the transcript
       l_dimensions = { width : 250, height : 262 };
       l_description = this.data.media_description || l_video.description || '';

       if (! empty(l_description)) {
         $inner.append($$('div').html(l_description).transcript('right', l_dimensions, this.playerId));
       }
        break;

      //audio
      case 'audio':
        l_audio.width = 466;
        _app.setupAudioPlayer(this.playerId, l_audio);

       //insert the transcript
       l_dimensions = { width:466, height:200 };
       l_description = this.data.media_description || l_audio.description || '';

       if (! empty(l_description)) {
         $inner.append($$('div').html(l_description).transcript('down', l_dimensions, this.playerId));
       }
        break;

      //audio and image
      case 'audio_image':
        //the image is either attached to the page or the audio resource
        if (empty(l_image)) l_image = l_audio.image;

        l_audio.width = 466;
        l_audio.height = 262;
        _app.setupAudioPlayer(this.playerId, l_audio, l_image);

       //insert the transcript
       l_dimensions = { width : 250, height : 262 };
       l_description = this.data.media_description || l_audio.description || '';

       if (! empty(l_description)) {
         $inner.append($$('div').html(l_description).transcript('right', l_dimensions, this.playerId));
       }
        break;
    }
  }

});
