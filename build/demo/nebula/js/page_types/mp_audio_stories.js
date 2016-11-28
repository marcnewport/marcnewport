/**
 * The functionality for a free_text page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_free_text
 * @extends PageType
 */
var mp_audio_stories = PageType.extend({

  /**
   *
   */
  setup : function() {

    this.playerId = 'page-media-'+ $.randomString(6);
    this.$scenario = $$('div', 'scenario').html(this.data.scenario);
    this.$media = $$('div', this.playerId, 'page-media');
    this.$leftColumn = $$('div', '', 'left-column');
    this.$rightColumn = $$('div', '', 'inner-wrap');
    this.$mediaButtons  = $$('div', 'audio-buttons');
    this.mediaPlayer = [];

    var l_media = $.makeArray(this.data.audio.item) || [],
        l_mediaCount = l_media.length,
        l_comments = _app.session.getComments(this.id),
        l_comment = l_comments[0] || 'Enter text here',
        l_question = (this.data.questions) ? this.data.questions.question : false,
        l_class = '';

    // insert media buttons
    if (l_media.length >= 1){
      for (var j = 0; j < l_mediaCount; j++) {
        //select the first item
        l_class = j < 1 ? 'btn-audio selected' : 'btn-audio';

        this.$mediaButtons.append($$('a', 'btn-audio-'+j, l_class).attr({ href:'#', role:'button' })
          .html($$('span', '', 'icon icon-headphones'))
          .append(l_media[j].label));
      }
      this.$leftColumn.append(this.$mediaButtons);
    }
    //insert media player
    this.$leftColumn.append(this.$media);

    //insert scenario
    if (! empty(this.data.scenario)) {
      this.$rightColumn.append(this.$scenario);
    }

    //add the question
    if(l_question){

      this.$rightColumn
          .append($$('div', '', 'question').html($$('label').attr('for', 'textarea').html(l_question.text[0]))
            .append($$('textarea', 'textarea', 'freetext').val(l_comment.carriage())))
            .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit'));
    }

    //insert the columns
    this.html
      .append(this.$leftColumn)
      .append($$('div', '', 'right-column')
        .append(this.$rightColumn));

    //call parent method
    this._super();
  },


  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    //get number of freetext fields so we can limit the text that goes into cmi.comment field
    var scope = this,
        l_limit = 4000,
        $mediaButtons = scope.$mediaButtons.find('.btn-audio'),
        l_mediaIndex = 0;

    //disable submission until some content is entered
    $('#btn-submit').disable();

    this.insertAudio(l_mediaIndex);

    //limit input character length
    this.$rightColumn.find('textarea').each(function() {

      var $this = $(this);

      //when focus is on textarea
      $this.focus(function() {
        //empty text
        if ($this.val() == 'Enter text here') {
          $this.val('');
        }
      })
      //after any key is pressed inside a textarea
      .keyup(function() {

        var l_text = $this.val();
        //truncate the text if its over the limit
        if (l_text.length > l_limit) {
          $this.val(l_text.substr(0, l_limit));
        }

        scope.submitable();
      })
      //when focus leaves
      .blur(function() {

        var l_text = $this.val();

        //if theres no text inserted, show default
        if (l_text == '') {
          $this.val('Enter text here');
          return;
        }
        //truncate the text if its over the limit
        else if (l_text.length > l_limit) {
          $this.val(l_text.substr(0, l_limit));
        }
      });
    });


    //click listener for audio. Change the classes on buttons and swap the media file in the player
    _app.$content.find('#audio-buttons').bind('click', function(p_event) {
      if (p_event.target.className == 'btn-audio') {
        // remove all selected
        $mediaButtons.removeClass('selected');
        // now select our button
        scope.$mediaButtons.find('#'+p_event.target.id).addClass('selected');
        // get the index from teh id of the target
        l_mediaIndex = p_event.target.id.split('btn-audio-')[1];
        // swap the file in the media player
        scope.insertAudio(l_mediaIndex);

      }
      p_event.preventDefault();
    });
  },



  /**
   * Inserts audio and transcript into the page
   */
  insertAudio : function(p_index) {

    var l_media = $.makeArray(this.data.audio.item),
        l_mediaItem = l_media[p_index].item,
        l_dimensions = {},
        l_description = '';

    l_mediaItem.width = 372;
    this.mediaPlayer = _app.setupAudioPlayer(this.playerId, l_mediaItem);

    //insert the transcript
    l_dimensions = { width:372, height:350 };
    l_description = l_mediaItem.description || '';

    if(l_description) {
      this.$leftColumn.find('.transcript').remove()
        .end()
        .append($$('div').html(l_description).transcript('down', l_dimensions, this.playerId));
    }
  },



  /**
   * Checks if activity can be submitted
   */
  submitable : function() {

    var $textareas = this.$rightColumn.find('textarea'),
        l_count = $textareas.length,
        l_submitable = true;

    for (var i = 0; i < l_count; i++) {
      switch ($textareas.eq(i).val()) {
        case '':
        case 'Enter text here':
          l_submitable = false;
          break;
      }
    }

    if (l_submitable) {
      $('#btn-submit').enable();
    }
    else {
      $('#btn-submit').disable();
    }

  },



  /**
   * The elements that need their dimensions updated
   * Called on first load of the page and on resize of window
   */
  resizePage : function() {

    var $pageTitle = _app.$content.find('.page-title'),
        $inner = _app.$content.find('.inner'),
        l_margin = $inner.outerHeight(true) - $inner.outerHeight(),
        l_outer = $pageTitle.outerHeight(true) + l_margin,
        $rightColumn = _app.$content.find('.right-column'),
        rc_margin = parseInt($rightColumn.css('margin-bottom'), 10),
        $rightInner = $rightColumn.find('.inner-wrap'),
        l_height = _app.$content.height(),
        l_submit = _app.$content.find('#btn-submit').outerHeight(),
        y_margin = $inner.outerWidth(true) - $inner.outerWidth(),
        l_width = _app.$content.width(),
        l_videoWidth = 400;

    $rightColumn.css({
      width: l_width - y_margin - l_videoWidth
    });

    $rightInner.css({
      maxHeight: l_height - l_outer - l_submit - rc_margin - 15,
      overflow: 'auto',
      paddingRight: '15px',
      marginBottom: '15px'
    });

    $rightInner.find('textarea').css({
      width: $rightInner.width() - 55
    });

  },



  /**
   * Called when an activity is submitted
   */
  submitAnswers : function() {

    var l_userData = [];

    _app.pausePlayers();

    //diable sumbit button
    $('#btn-submit').disable();
    //disable text field
    $('.freetext').attr('disabled', 'true');

    //collect the user data
    this.$rightColumn.find('textarea').each(function() {
      var l_input = this.value;

      if (l_input === 'Enter text here' || l_input === '') {
        l_input = 'No comment.';
      }

      l_userData.push(l_input.uncarriage());
    });

    _app.session.setComments(this.id, l_userData);

    //mark as complete
    this.updatePageData([1, []]);
  },



  /**
   * Called when try again button is pressed
   */
  resetActivity : function(){
    $('.freetext').removeAttr('disabled');
    $('#btn-submit').enable();
  }

});
