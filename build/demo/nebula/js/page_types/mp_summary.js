/**
 * The functionality for a summary page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_summary
 * @extends PageType
 *
 * @todo may need to store suspended score in page data
 */
var mp_summary = PageType.extend({



  /**
   * Gathers html for the page
   */
  setup : function() {

    this.hasMedia = false;
    this.score = {};
    this.updatePageData();

    var l_scoreData = [],
        $leftColumn = $$('div', '', 'left-column'),
        $summaryButtons = $$('div', 'summary-buttons'),
        $rightColumn = $$('div','','right-column'),
        l_summaryText = 'You have not completed the module yet.',
        l_summaryImage = '',
        l_useImage = this.data.include_image,
        l_customPassImage = this.data.pass_image,
        l_customFailImage = this.data.fail_image;

    //check completion of the course
    _app.session.checkCompletion();

    //check if there is score data saved
    l_scoreData = _app.session.getUserData('score') || ['score', 0, 0, 0];

    //put score into easily accessible object
    this.score = {
      raw: l_scoreData[1],
      max: l_scoreData[2],
      percent: l_scoreData[3]
    };

    //check score and image
    if (this.score.percent >= _app.structure.course.settings.pass_mark) {
      l_summaryText = this.data.pass_text;

      // check if this uses an image
      if (l_useImage) {
        // now use custom image or get default
        if (l_customPassImage){
          l_summaryImage = 'files/' + l_customPassImage.item.content;
        }
        else{
          l_summaryImage = 'files/skin/summary-pass.jpg';
        }
      }
    }
    else {
      l_summaryText = this.data.fail_text;
      // check if this uses an image
      if (l_useImage) {
        // now use custom image or get default
        if (l_customFailImage){
          l_summaryImage = 'files/' + l_customFailImage.item.content;
        }
        else{
          l_summaryImage = 'files/skin/summary-fail.jpg';
        }
      }
    }

    //add summary buttons
    $summaryButtons.append($$('h4').html(this.data.button_heading));

    //review
    if (Number(this.data.reviewable)) {
      $summaryButtons.append($$('a', 'btn-review').attr('href', '#').html(this.data.btn_review || 'Review module'));
    }
    //exit
    $summaryButtons.append($$('a', 'btn-page-exit').attr('href', '#').html(this.data.btn_exit || 'Exit module'));

    $leftColumn.append(l_summaryText).append($summaryButtons);

    // check for media
    if (this.data.media) {
      // check for title first
      if (this.data.media.title){
        $rightColumn.append($$('h2', 'media-title').html(this.data.media.title));
      }
      else {
        //if no heading add an empty space filler
        $rightColumn.append($$('div', 'media-title').html('\xa0'));
      }

      // add the media holder
      var $media = $$('div', 'media-player-'+ this.id, 'summary-media'),
          l_media = this.data.media.item || {};

      //insert image if available
      if (l_media.type === 'mp_resource_image') {
        $media.html($$('img').attr({
          src: 'files/'+ l_media.content,
          width: l_media.width,
          height: l_media.height,
          alt: l_media.alt_text
        }));
      }

      $rightColumn.append($media);
      _app.$content.addClass('has-media');

      this.hasMedia = true;
    }
    // load in media
    else {
      if (l_useImage) {
        $rightColumn
          .append($$('img').attr({ src:l_summaryImage, alt:'' }));
      }
      //directors tip
      if (this.data.directors_tip) {
        $rightColumn
          .append($$('div', '', 'directors-tip')
            .append($$('h5').html(this.data.summary_title))
            .append(this.data.directors_tip));
      }
    }

    this.html.append($leftColumn).append($rightColumn);
    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var l_media = {},
        l_dimensions = { width:373, height:120 },
        l_showScore = (this.data.show_score) ? this.data.show_score : false,
        l_description = '';

    // show score
    if (l_showScore) {
      switch(l_showScore) {
        case 'total':
          _app.$content
            .addClass('has-score')
            .find('.right-column')
              .prepend($$('div', 'user-score', 'total')
              .html($$('h2').html('your score: ' + this.score.raw + '/' + this.score.max)));
          this.hasScore = true;
          break;

      case 'percent':
        _app.$content
          .addClass('has-score')
          .find('.right-column')
            .prepend($$('div', 'user-score', 'percent')
            .html($$('h2').html('your score:<span> ' + this.score.percent + '%</span>')));
        this.hasScore = true;
        break;
      }
    }

    // check for media
    if (this.hasMedia){
      l_media = this.data.media.item;
      l_media.width = 373;
      l_media.height = 210;

      switch  (l_media.type) {
        case 'mp_resource_image':
          l_description = '';
          break;

        case 'mp_resource_video':
          l_description = l_media.description || '';
          _app.setupVideoPlayer('media-player-'+ this.id, l_media);
        break;

        case 'mp_resource_audio':
          l_description = l_media.description || '';
          if (l_media.image) {
            _app.setupAudioPlayer('media-player-'+ this.id, l_media, l_media.image);
          }
          else {
            _app.setupAudioPlayer('media-player-'+ this.id, l_media);
            l_dimensions.height = 300;
          }
        break;
      }

      //insert the transcript
      if (! empty(l_description)) {
        _app.$content.find('.right-column')
          .append($$('div').html(l_description).transcript('down', l_dimensions, this.playerId));
      }
    }

    //listen for a button click
    _app.$content.find('#summary-buttons').click(function(p_event) {
      switch (p_event.target.id) {
        case 'btn-review':
          _app.sequence.goTo(_app.structure.firstViewableChild(_app.structure.getTopics()[0].id).id);
          break;
        case 'btn-page-exit':
          _app.sequence.exit();
          break;
      }
      p_event.preventDefault();
    });

    //save session here incase user closes browser window
    _app.scorm.save();
  },



  /**
   * The elements that need their dimensions updated
   * Called on load of page and on resize of window
   */
  resizePage : function() {

    var $pageTitle = _app.$content.find('.page-title'),
        $inner = _app.$content.find('.inner'),
        l_margin = $inner.outerHeight(true) - $inner.outerHeight(),
        l_outer = $pageTitle.outerHeight(true) + l_margin,
        $leftColumn = _app.$content.find('.left-column'),
        lc_margin = parseInt($leftColumn.css('margin-bottom'), 10),
        $rightColumn = _app.$content.find('.right-column'),
        rc_margin = parseInt($rightColumn.css('margin-bottom'), 10),
        rc_marginTop = (this.hasScore) ? 62 : 30,
        l_height = _app.$content.height(),
        rc_maxHeight = l_height - l_outer - rc_margin + rc_marginTop,
        y_margin = $inner.outerWidth(true) - $inner.outerWidth(),
        l_width = _app.$content.width(),
        l_media = {},
        rc_maxWidth = 585,
        rc_width = 0;

    $leftColumn.css({
      maxHeight: l_height - l_outer - lc_margin,
      width: l_width - y_margin - 20 - $rightColumn.outerWidth(true),
      overflow: 'auto'
    });

    $rightColumn.css({
      maxHeight: rc_maxHeight,
      overflow: 'auto',
      marginTop: (rc_marginTop) * -1 + 'px'
    });

    //check if just an image in right column
    if (this.data.media && this.data.media.item) {
      l_media = this.data.media.item;

      if (l_media.type === 'mp_resource_image') {
        if (l_media.width > rc_maxWidth) {
          rc_width = rc_maxWidth;

          $rightColumn.width(rc_width).find('img').scaleDimensions({
            width: rc_width,
            height: rc_maxHeight,
            fill: true
          });
        }
        else {
          rc_width = l_media.width;
          $rightColumn.width(rc_width);
        }
        $leftColumn.width(rc_width - $inner.width() - 20);
      }
    }

    // add padding if overflowing
    if(l_height > rc_maxHeight && this.hasScore){
      $rightColumn.css({
        paddingRight: '15px'
      });
    }

  }

});
