/**
 * The functionality for a basic page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_basic
 * @extends PageType
 */
var mp_basic = PageType.extend({



  /**
   *
   */
  setup : function() {

    this.playerId = 'page-media-'+ $.randomString(6);
    this.media = {};
    this.player = {};

    var $main = $$('div', '', 'main-text'),
        l_title = this.data.heading ? $$('h3').html(this.data.heading) : '',
        l_title2 = this.data.heading2 ? $$('h3').html(this.data.heading2) : '',
        l_media = $.makeArray(this.data.assets.item || []),
        l_mediaCount = l_media.length,
        $img = [];

    //add basic type to class name (use hyphens not underscores)
    _app.$content.addClass(this.data.basic_type.replace(/_/g, '-'));

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
            case 'mp_resource_image': this.media = l_media[i]; break;
          }
        }

        //create the image element
        $img = $$('img', this.playerId, 'page-media').attr({
          src: 'files/'+ this.media.content,
          alt: this.media.alt_text,
          width: this.media.width,
          height: this.media.height
        });

//        //add longdesc if there
//        if (l_image.description) $img.attr('longdesc', l_image.description);

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
            case 'mp_resource_image': this.media = l_media[i]; break;
          }
        }

        //create the image element
        $img = $$('img', this.playerId, 'page-media').attr({
          src: 'files/'+ this.media.content,
          alt: this.media.alt_text,
          width: this.media.width,
          height: this.media.height
        });

//        //add longdesc if there
//        if (l_image.description) $img.attr('longdesc', l_image.description);

        //insert page content
        this.html
            .append($main
                .append($$('p').html($img))
                .append(l_title)
                .append(this.data.main));
        break;

      //media player layout----------------------------------------------------
      case 'audio':
        this.media = l_media[0];
        this.media.width = 465;
        this.media.height = 24;

        this.html
            .append($main
                .append(l_title)
                .append(this.data.main))
            .append($$('div', this.playerId, 'page-media'));
        break;

      case 'video':
      case 'audio_image':
        this.media = l_media[0];
        this.media.width = 465;
        this.media.height = 262;

        this.html
            .append($main
                .append(l_title)
                .append(this.data.main))
            .append($$('div', this.playerId, 'page-media'));
        break;
    }

    this._super();
  },




  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    if (this.data.assets) this.initiateMedia();
  },



  /**
   * The elements that need their dimensions updated
   * Called on load of page and on resize of window
   */
  resizePage : function() {

    var $pageTitle = _app.$content.find('.page-title'),
        $inner = _app.$content.find('.inner').eq(0),
        l_margin = parseInt($inner.css('margin-top'), 10),
        l_width = $inner.width(),
        l_innerHeight = $inner.height(),
        l_titleHeight = $pageTitle.height(),
        $main = _app.$content.find('.main-text'),
        l_maxHeight = l_innerHeight - l_titleHeight - 5,
        n_width = 0,
        $media = [],
        l_mediaHeight = this.media.height;

    switch (this.data.basic_type) {
      //basic text layout--------------------------------------------------------------
      case 'text_only':
        $main.css({
          height: l_maxHeight,
          paddingRight: '15px',
          overflow: 'auto'
        });
        break;

      //columned layout------------------------------------------------------
      case 'columns':
        _app.$content.find('.column').css({
          height: l_maxHeight,
          paddingRight: '15px',
          overflow: 'auto'
        });
        break;

      //inline image layout------------------------------------------------------
      case 'image_inline':
        $media = $('#'+ this.playerId);

        $main.css({
          height: l_maxHeight,
          width: l_width - $media.width() - 35,
          paddingRight: '15px',
          overflow: 'auto'
        });
        break;

      //full width image layout------------------------------------------------------
      case 'image_full_width':
        $media = $('#'+ this.playerId);

        l_width -= 120;
        n_width = Math.floor(($media.height() / $media.width()) * l_width);

        $media.attr({
          width: l_width,
          height: n_width
        })
        .css('margin-left', '40px')

        $main.css({
          height: l_maxHeight,
          paddingRight: '10px',
          overflow: 'auto'
        });
        break;

      //media player layout----------------------------------------------------
      case 'audio':
        if (this.media.description) {
          l_mediaHeight = l_mediaHeight + 200;
        }

        $main.css({
          height: l_maxHeight - l_mediaHeight - 15,
          paddingRight: '15px',
          overflow: 'auto'
        });
        break;

      case 'audio_image':
      case 'video':
        $main.css({
          height: l_maxHeight - l_mediaHeight - 15,
          paddingRight: '15px',
          overflow: 'auto'
        });
        break;
    }
  },



  /**
   * Loads media player
   */
  initiateMedia : function() {

    var scope = this,
        l_media = $.makeArray(this.data.assets.item),
        l_mediaCount = l_media.length,
        l_userData = _app.session.getUserData(this.id),
        l_video = {},
        l_audio = {},
        l_image = {},
        l_dimensions = {},
        l_description = '',
        $inner = _app.$content.find('.inner');

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
        this.player = _app.setupVideoPlayer(this.playerId, this.media);

        //insert the transcript
        l_dimensions = { width:370, height:this.media.height };
        l_description = this.data.media_description || this.media.description || '';

        if (! empty(l_description)) {
          $inner.append($$('div').html(l_description).transcript('right', l_dimensions, this.playerId));
        }
        break;

      //audio
      case 'audio':
        this.player = _app.setupAudioPlayer(this.playerId, this.media);

        //insert the transcript
        l_dimensions = { width:this.media.width, height:200 };
        l_description = this.data.media_description || this.media.description || '';

        if (! empty(l_description)) {
          $inner.append($$('div').html(l_description).transcript('down', l_dimensions, this.playerId));
        }
        break;

      //audio and image
      case 'audio_image':
        //the image is either attached to the page or the audio resource
        if (empty(l_image)) l_image = this.media.image;

        this.player = _app.setupAudioPlayer(this.playerId, this.media, l_image);

        //insert the transcript
        l_dimensions = { width:370, height:this.media.height };
        l_description = this.data.media_description || l_audio.description || '';

        if (! empty(l_description)) {
          $inner.append($$('div').html(l_description).transcript('right', l_dimensions, this.playerId));
        }
        break;
    }

    //check if there is a saved media timecode
    if (l_userData[2]) {
      this.player.onReady(function() {
        scope.player.setPosition(l_userData[2]);
      });
    }
  },



  /**
   * Called before the sequence moves onto another page
   */
  destroy : function() {
    var scope = this;
    //save the position of the video
    //vimeo player has to use a callback function
    if (this.player.getPosition) {
      //youtube & jwplayer...
      var l_position = this.player.getPosition();

      if (l_position > 0) {
        _app.session.setUserData([this.id, -1, l_position]);
      }
    }
    else if (this.player.onReady) {
      //vimeo...
      this.player.onReady(function() {
        scope.player.api('getCurrentTime', function(p_position) {
          if (p_position > 0) {
            _app.session.setUserData([scope.id, -1, p_position]);
          }
        });
      });
    }
  }

});
