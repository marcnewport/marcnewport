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
var mp_free_text = PageType.extend({



  /**
   *
   */
  setup : function() {

    this.layout = 'scenario-left';
    this.playerId = 'page-media-'+ $.randomString(6);
    this.$scenario = $$('div', 'scenario').html(this.data.scenario);
    this.$media = $$('div', this.playerId, 'page-media');
    this.$leftColumn = $$('div', '', 'left-column');
    this.$rightColumn = $$('div', '', 'inner-wrap');
    this.hasMedia = (this.data.media) ? true : false;

    var l_questions = $.makeArray(this.data.questions.question),
        l_questionCount = l_questions.length,
        l_comments = _app.session.getComments(this.id),
        l_comment = '',
        l_classes = '';

    //scenario_right...
    if (this.hasMedia) {
      this.layout = 'scenario-right';
      //insert media
      this.$leftColumn.append(this.$media);

      //insert scenario
      if (! empty(this.data.scenario)) {
        this.$rightColumn.append(this.$scenario);
      }
    }
    //scenario_left...
    else {
      this.$leftColumn.append(this.$scenario);
    }

    //add the questions
    for (var i = 0; i < l_questionCount; i++) {
      l_comment = l_comments[i] || 'Enter text here';
      l_classes = (i + 1) == l_questionCount ? 'question last' : 'question';

      this.$rightColumn
        .append($$('div', '', l_classes).html($$('label').attr('for', 'textarea-'+ i).html(l_questions[i].text[0]))
          .append($$('textarea', 'textarea-'+ i, 'freetext').val(l_comment.carriage())));
    }

    //add layout as class to content
    _app.$content.addClass(this.layout);

    //insert the columns
    this.html
      .append(this.$leftColumn)
      .append($$('div', '', 'right-column')
        .append(this.$rightColumn)
        .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit')));

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
        l_questions = $.makeArray(this.data.questions.question),
        l_questionCount = l_questions.length || 1,
        l_limit = 4000 / l_questionCount,
        $textarea = this.$rightColumn.find('textarea'),
        l_dimensions = {},
        l_description = '',
        l_media = this.data.media,
        l_dimensions = {},
        l_maxMediaWidth = 385,
        l_maxMediaHeight = _app.$content.find('.inner').eq(0).height() - _app.$content.find('.page-title').height(),
        n_width = 0,
        n_height = 0;


    // check for media
    if (l_media) {
      l_media = this.data.media.item;
      l_dimensions = { width:l_media.width, height:135 };

      switch  (l_media.type){
        case 'mp_resource_video':
          l_media.width = l_maxMediaWidth;
          l_media.height = Math.floor(l_media.width * (9/16));
          _app.setupVideoPlayer(this.playerId, l_media);
          break;

        case 'mp_resource_audio' :
          // calculate the width of media based on available space
          l_media.width = l_maxMediaWidth;
          l_media.height = Math.floor(l_media.width * (9/16));

          if (! l_media.image) {
            l_media.height = 24;
            l_dimensions.height = 350;
          }
          _app.setupAudioPlayer(this.playerId, l_media, l_media.image);
          break;

        case 'mp_resource_image':
          l_media = this.data.media.item;

          if (l_media.width > l_media.height) {
            n_width = l_maxMediaWidth;
            n_height = (l_media.height / l_media.width) * n_width;
          }
          else {
            n_height = l_maxMediaHeight;
            n_width = (l_media.width / l_media.height) * n_height;
          }

          this.$media
            .css({ width:n_width })
            .html($$('img')
            .attr({ src:'files/'+ l_media.content, alt:(l_media.alt_text || '') })
            .css({ width:n_width, height:n_height }));
        break;
      }

      //insert the transcript
      l_description = this.data.description || l_media.description || '';

      if (! empty(l_description) && l_media.type != 'mp_resource_image') {
        this.$leftColumn.append($$('div').html(l_description).transcript('down', l_dimensions, this.playerId));
      }

      this.resizePage();
    }

    //disable submission until some content is entered
    $('#btn-submit').disable();

    //if theres only one textarea, make it taller
    if ($textarea.length === 1) {
      $textarea.height(180);
    }


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
        $inner = _app.$content.find('.inner').eq(0),
        l_margin = $inner.outerHeight(true) - $inner.outerHeight(),
        l_outer = $pageTitle.outerHeight(true) + l_margin,
        $leftColumn = _app.$content.find('.left-column'),
        lc_margin = parseInt($leftColumn.css('margin-bottom'), 10),
        $rightColumn = _app.$content.find('.right-column'),
        rc_margin = parseInt($rightColumn.css('margin-bottom'), 10),
        $rightInner = $rightColumn.find('.inner-wrap'),
        l_height = _app.$content.height(),
        l_submit = _app.$content.find('#btn-submit').outerHeight(),
        y_margin = $inner.outerWidth(true) - $inner.outerWidth(),
        l_width = _app.$content.width(),
        $pageMedia = $inner.find('.page-media');

    switch (this.layout) {
      case 'scenario-left':
        $leftColumn.css({
          maxHeight: l_height - l_outer - lc_margin,
          overflow: 'auto',
          paddingRight: '10px'
        });
        break;

      case 'scenario-right':

        if (this.hasMedia) {
          if (! $pageMedia.length) $pageMedia = $inner.find('.jwplayer-wrap');

          $leftColumn.css('width', $pageMedia.width());
          $rightColumn.css('width', l_width - y_margin - $pageMedia.width() - 25);
        }
        else {
          $rightColumn.css({
            width: l_width - y_margin - $pageMedia.width()
          });
        }
        break;
    }

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
    $('.freetext').attr('disabled','true');

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
