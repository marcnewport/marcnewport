/**
 * The functionality for a demonstration page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_demonstration
 * @extends PageType
 */
var mp_demonstration = PageType.extend({
  
  
  setup : function() {
    
    this.audio = new Audio();
    this.transcript = false;
    this.positionIndex = 0;
    
    var l_userData = _app.session.getUserData(this.id)[2] || [],
        l_dataCount = l_userData.length,
        $img = $$('img'),
        $intro = '',
        $navigation = $$('div', 'navigation-wrap', 'hidden'),
        $list = $$('ul'),
        l_positions = $.makeArray(this.data.positions.item),
        l_count = l_positions.length;
    
    //get saved position
    for (var i= 0; i < l_dataCount; i++) {
      if (l_userData[i] > 1) this.positionIndex = i;
    }
    
    //insert main image
    $img.attr({
      src: 'files/'+ this.data.image.item.content,
      alt: this.data.image.item.alt_text
    })
    //add width and height to css as we will transition this later
    .css({
      width: this.data.image.item.width,
      height: this.data.image.item.height
    });
    
    //show intro text on first visit
    if (this.data.introduction && ! l_dataCount) {
      $intro = $$('div', 'introduction').attr({ tabIndex:0, role:'dialog' })
        .append($$('div', '', 'content').html(this.data.introduction))
        .append($$('a', 'btn-start').attr({ href:'#', role:'button' }).html('Start'));
    }
    
    //add navigation buttons
    for (var j = 0; j < l_count; j++) {
      $list.append($$('li')
        .append($$('a', 'item-'+ j, 'navigation-button').attr({ href:'#', role:'button', title:l_positions[j].label })
          .html(l_positions[j].label || '')));
      
      if (l_positions[j].audio.item && l_positions[j].audio.item.description) {
        this.transcript = true;
      }
    }
    
    this.html
      .append($$('div', 'stage').attr({ role:'widget' })
        .append($$('div', 'stage-blocker'))
        .append($img)
        .append($intro)
        .append($$('a', 'btn-pause', 'hidden').attr({ href:'#', role:'button', 'aria-live':'polite' })
          .append($$('i', '', 'icon icon-pause'))
          .append($$('span').html('Pause')))
        .append($$('div', 'position-back').html($$('i', '', 'icon icon-chevron-straight-left')))
        .append($$('div', 'position-next').html($$('i', '', 'icon icon-chevron-straight-right')))
        .append($navigation
          .append($list)));
    
    this._super();
  },
  
  
  
  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {
    
    this._super();
    
    var scope = this,
        l_userData = _app.session.getUserData(this.id)[2] || 0,
        $stage = _app.$content.find('#stage'),
        $blocker = $stage.find('#stage-blocker'),
        $navigation = $stage.find('#navigation-wrap'),
        $pause = $stage.find('#btn-pause');
    
    scope.updatePosition(scope.positionIndex);
    
    if (l_userData) {
      //show the position nav
      $navigation.fadeIn();
      scope.resizePage();
      
      //show play button
      if (scope.audio.src !== '') {
        scope.pauseAudio();
        $pause.show();
      }
      
      $blocker.fadeOut(function() {
        $stage.addClass('ready');
      });
    }
    else {
      //start button handler
      _app.$content.find('#btn-start').bind('click', function(p_event) {
        $stage.addClass('ready');
        //fadeout the intro text
        _app.$content.find('#introduction').fadeOut(function() {
          $pause.focus();
          $(this).remove();
          scope.updatePosition(0);
        });
        $blocker.fadeOut();
        //show buttons
        $navigation.fadeIn();
        scope.resizePage();
        p_event.preventDefault();
      });
    }
    
    $stage.find('#position-next').bind('click', function(p_event) {
      scope.updatePosition(scope.positionIndex + 1);
      p_event.preventDefault();
    });
    
    $stage.find('#position-back').bind('click', function(p_event) {
      scope.updatePosition(scope.positionIndex - 1);
      p_event.preventDefault();
    });
    
    //the navigation click handler
    $navigation.bind('click', function(p_event) {
      var l_index = Number(p_event.target.id.split('-').pop());
      if (! isNaN(l_index)) scope.updatePosition(l_index);
      p_event.preventDefault();
    });
    
    //the audio icon click handler
    $pause.bind('click', function(p_event) {
      //toggle play
      if (scope.audio.paused) {
        scope.playAudio();
      }
      else {
        scope.pauseAudio();
      }
      
      p_event.preventDefault();
    });
  },
  
  
  
  /**
   * Plays the audio file in memory and updates the icon
   */
  playAudio: function() {
    //update the icon
    _app.$content.find('#btn-pause').find('span').html('Pause').end()
      .find('.icon').removeClass('icon-play').addClass('icon-pause');
    
    this.audio.play();
  },
  
  
  
  /**
   * Pauses the audio file in memory and updates the icon
   */
  pauseAudio: function() {
    //update the icon
    _app.$content.find('#btn-pause').find('span').html('Play').end()
      .find('.icon').removeClass('icon-pause').addClass('icon-play');
    
    this.audio.pause();
  },
  
  
  
  /**
   * Updates the interface to use position p_index data
   */
  updatePosition : function(p_index) {
    
    var scope = this,
        l_userData = _app.session.getUserData(this.id)[2] || [],
        l_completed = 1,
        $inner = _app.$content.find('.inner').eq(0),
        $stage = $inner.find('#stage'),
        l_ready = $stage.hasClass('ready'),
        $pause = $stage.find('#btn-pause'),
        $img = $stage.find('img'),
        l_positions = $.makeArray(this.data.positions.item),
        l_count = l_positions.length,
        l_width = 0,
        l_height = 0,
        l_position = 0,
        l_left = 0,
        l_top = 0;
    
    //does the index exist?
    if (! l_positions[p_index]) return;
    
    //calculate dimensions, positions etc.
    l_width = Math.round(this.data.image.item.width * l_positions[p_index].zoom);
    l_height = Math.round(this.data.image.item.height * l_positions[p_index].zoom);
    l_position = l_positions[p_index].position.split(',');
    l_left = Number(l_position[0]);
    l_top = Number(l_position[1]);
    
    //update audio source
    if (l_positions[p_index].audio.item) {
      this.audio.src = 'files/'+ l_positions[p_index].audio.item.content;
      

      //autoplay functionality
      if (Number(this.data.autoplay)) {
        this.audio.onended = function() {
          scope.updatePosition(scope.positionIndex + 1);
        };
      }
      else {
        this.audio.onended = function() {
          scope.pauseAudio();
        };
      }
      if (l_ready) {
        $pause.show();
        this.playAudio();
      }
    }
    else {
      $pause.hide();
      this.pauseAudio();
    }
    
    //update image position and zoom
    $img.css({
      width: l_width,
      height: l_height,
      marginLeft: '-'+ l_left +'px',
      marginTop: '-'+ l_top +'px'
    });
    
    //select the current button
    $('#navigation-wrap').find('.navigation-button').each(function(i) {
      if (i === p_index) {
        $(this).addClass('selected');
      }
      else {
        $(this).removeClass('selected');
      }
    });
    
    //insert the transcript
    if (l_positions[p_index].audio.item && l_positions[p_index].audio.item.description) {
      //look for the transcript markup
      if ($inner.find('.transcript').length) {
        //update content
        $inner.find('.transcript').removeClass('hidden')
          .find('.transcript-content').html(l_positions[p_index].audio.item.description);
      }
      else {
        //not found, create it
        $inner.append($$('div')
          .html(l_positions[p_index].audio.item.description)
            .transcript('right', { width:260, height:$stage.height()}, 'demo'));
      }
    }
    else {
      $inner.find('.transcript').addClass('hidden');
    }
    
    //update index
    this.positionIndex = p_index;
    
    //set the page data
    //0 = not viewed, 1 = viewed, 2 = current position
    for (var i = 0; i < l_count; i++) {
      //update any current states to viewed
      if (l_userData[i] > 1) {
        l_userData[i] = 1;
      }
      //update any missing indices to not viewed
      if (! l_userData[i]) {
        l_userData[i] = 0;
      }
    }
    
    //update current position
    l_userData[p_index] = 2;
    
    this.updatePageData([-1, l_userData, 1, l_completed]);
    
    //are we complete?
    for (var i = 0; i < l_count; i++) {
      if (l_userData[i] === 0) {
        l_completed = 0;
      }
    }
    
    //update user data and enable next
    if (l_completed) {
      this.updatePageData([-1, l_userData, 1, l_completed]);
      _app.$page.find('#btn-page-navigation-next').enable();
    }
  },
  
  
  
  
  
  
  /**
   * The elements that need their dimensions updated
   * Called on load of page and on resize of window
   */
  resizePage : function() {
    
    var $inner = _app.$content.find('.inner').eq(0),
        $title = $inner.find('.page-title'),
        $stage = $inner.find('#stage'),
        l_height = $inner.height() - $title.height(),
        l_width = $inner.width(),
        $intro = $inner.find('#introduction'),
        $navigation = $('#navigation-wrap'),
        l_left = Math.round(($stage.width() - $navigation.width()) / 2);
    
    if (this.transcript) {
      l_width -= 260;
    }
    
    $stage.css({
      height: l_height,
      width: l_width,
      overflow: 'hidden'
    });
    
    $navigation.css({ left:l_left });
    
    $intro.css({
      left: Math.round(($stage.width() - $intro.width()) / 2),
      top: Math.round(($stage.height() - $intro.height()) / 2)
    });
  }
  
});
