/**
 * The base functionality for a page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class PageType
 */
var PageType = Class.extend({



  /**
   * The constructor method
   *
   * @param p_data
   *    The jsond xml data of the page
   */
  init : function(p_data) {

    //put the data into property and
    //nullify the parameter to free up memory
    this.data = p_data;
    this.id = p_data.id;
    p_data = null;

    //create some more properties used for all page types
    this.html = $$('div', '', 'inner');
    this.attempts = _app.session.getUserData(this.id)[3] || 0;
    this.maxAttempts = this.data.max_attempts || 999;
    this.time = {};
    this.whyFeedback = false;
    this.reviewMode = false;
    this.showable = true;
    this.caseStudyContent = false;

    // case study uses page types too but has some different configuration
    if (_app.structure.find(this.data.id).cs_content){
      this.caseStudyContent = true;
      this.html = $$('div', this.id);
      this.insertTitles();
    }
    //default page config
    else{
      if (this.data.type != 'mp_splash') {
        this.insertTitles();
        this.updateFooter();

        if (_app.navigation !== 'hamburger') {
          this.showPanels();
        }
      }
    }


    this.addClassNames();
    this.setup();

  },




  /**
   * Hides or shows the panel buttons
   */
  togglePanels : function() {

    var $panelButtons = $('#panel-buttons'),
        l_active;

    if (_app.panels.showing) {
      l_active = _app.panels.active.replace('-', '_');
      _app.panels[l_active].close();
      $panelButtons.hide();
      _app.panels.showing = false;
    }
    else {
      $panelButtons.show();
      _app.panels.menu.open();
      _app.panels.showing = true;

      this.checkPanels();

      // have to do some hacky positioning to get the secondary tabs underneath their parent
      // set a timeout so the elements can render before we get their offset
      setTimeout(function() {
        $panelButtons.find('.btn-panel').each(function() {

          var l_offset = this.offsetLeft,
              l_panel = this.id.replace('btn', 'panel'),
              $panel = $('#'+ l_panel),
              $tabs = $panel.find('.panel-tabs');

          if ($tabs.length) {
            $tabs.css({
              marginLeft: l_offset +'px'
            })
          }
        });
      }, 500);
    }
  },




  /**
   * Shows the panel buttons
   */
  showPanels : function() {

    if(! _app.panels.showing) {
      var $buttons = $('#panel-buttons');

      $buttons.fadeIn(500, function() {
        $buttons.removeClass('hidden');
      });
      $('#panels').removeClass('hidden');
      _app.panels.showing = true;
    }

    this.checkPanels();
  },





  /**
   * Decides if we need to enable the resources panel
   */
  checkPanels : function() {

    var l_parent = _app.structure.parent(this.id),
        l_topic = (l_parent.type == 'mp_topic') ? _app.sequence.getData(l_parent.id) : {},
        l_resources = [],
        l_groups = [],
        l_count = 0,
        l_review = {},
        l_other = {},
        l_gotLinks = false,
        l_essential = {},
        l_disabled = 0,
        l_btnHeight = $('#btn-menu').outerHeight(true),
        l_margin = l_btnHeight - $('#btn-menu').outerHeight();

    //check the notes panel is enabled
    if (Number(l_topic.enable_menu)) {
      _app.panels.menu.enable();
    }
    else {
      _app.panels.menu.disable();
      l_disabled++;
    }

    if (Number(l_topic.enable_resources)) {
      //add page resources over topic resources
      if (this.data.resources) {
        l_groups = $.makeArray(this.data.resources.group);
        l_count = l_groups.length;
        for(var i = 0; i < l_count; i++) {
          switch(l_groups[i].type) {
            case 'review':
              l_review = l_groups[i];
              l_gotLinks = true;
              break;
            case 'other':
              l_other = l_groups[i];
              l_gotLinks = true;
              break;
            case 'essential':
              l_essential = l_groups[i];
              break;
          }
        }
      }

      //check if we got links and essential, check the topic
      if(! l_gotLinks) {
        if (l_topic.resources) {
          l_groups = $.makeArray(l_topic.resources.group);
          l_count = l_groups.length;
          for(var j = 0; j < l_count; j++) {
            switch(l_groups[j].type) {
              case 'review':
                if(! l_gotLinks) l_review = l_groups[j];
                break;
              case 'other':
                if(! l_gotLinks) l_other = l_groups[j];
                break;
            }
          }
        }
      }

      //add them to resource object
      if(! empty(l_review)) l_resources.push(l_review);
      if(! empty(l_other)) l_resources.push(l_other);
      if(! empty(l_essential)) l_resources.push(l_essential);

      //add faq
      if(_app.structure.course.resources.faq) {
        l_resources.push(_app.structure.course.resources.faq);
      }

      //add glossary
      if (_app.structure.course.resources.glossary) {
        l_resources.push(_app.structure.course.resources.glossary);
      }

      //check we found something
      if(! empty(l_resources)) {
        _app.panels.resources.setup(l_resources);
        _app.panels.resources.enable();
      }
      else {
        _app.panels.resources.disable();
        l_disabled++;
      }
    }
    else {
      _app.panels.resources.disable();
      l_disabled++;
    }

    //check the case study is enabled
    if (_app.structure.getCaseStudy()) {
      if(Number(l_topic.enable_case_study)) {
        _app.panels.case_study.enable();
      }
      else {
        _app.panels.case_study.disable();
        l_disabled++;
      }
    }

    //check the notes panel is enabled too
    if(Number(l_topic.enable_my_notes)) {
      _app.panels.notes.enable();
    }
    else {
      _app.panels.notes.disable();
      l_disabled++;
    }

    if (l_disabled >= 4) {
      _app.$header.addClass('no-tabs');
    }
    else {
      _app.$header.removeClass('no-tabs');
    }

    $('#panel-buttons').height((l_btnHeight * 4) - (l_btnHeight * l_disabled) - l_margin);
  },



  /**
   * Gives content div active page class names
   */
  addClassNames : function() {

    var l_topic = _app.structure.parent(this.id),
        l_classes = this.data.type.split('_').join('-');

    //check if its an assessment topic
    if (l_topic.assessable === 'true') {
      l_classes += ' assessment';
    }

    //add page type name to page
    if (! this.caseStudyContent) {
      _app.$page.attr('class', l_classes);
      _app.$content.removeAttr('class');
    }
    else {
      // for case study add the classes to the panel
      this.html.addClass(l_classes);
    }
  },



  /**
   * Inserts title of page
   */
  insertTitles : function() {

    var $pageTitle = $$('div', '', 'page-title'),
        $h1 = _app.$header.find('h1'),
        l_title = '',
        l_available = _app.$header.width() - 200;

    if (_app.navigation === 'top' || _app.navigation === 'hamburger') {
      l_title = this.data.title || '&nbsp;';

      //add page title to main heading
      if (! this.caseStudyContent) {
        $h1.html(l_title);

        //update width depending on available space
        if (_app.navigation === 'top') {
          $h1.css({
            maxWidth: _app.$header.width() - $('#panel-buttons').width() - 40
          });
        }

        if (this.data.type === 'mp_main_menu') {
          //add page title to page title
          $pageTitle.append($$('h2').html(this.data.title));
          this.html.append($pageTitle);
        }
      }
    }
    else {
      //add module title to main heading
      _app.$header.find('h1').html(_app.structure.course.module_title || '&nbsp;');
      //add page title to page title
      $pageTitle.append($$('h2').html(this.data.title));
      this.html.append($pageTitle);
    }
  },



  /**
   * Updates the footer section of a page
   */
  updateFooter : function() {

    var scope = this,
        l_position = _app.structure.getPosition(this.id),
        l_userData = _app.session.getUserData(this.id),
        $navigation = _app.$footer.find('#page-navigation'),
        $back = $navigation.find('#btn-page-navigation-back'),
        $next = $navigation.find('#btn-page-navigation-next'),
        l_opacity = Number(_app.structure.course.settings.disabled_navigation_opacity),
        l_topic = {};

    //update page navigation in footer
    $navigation.find('.page-navigation-position').html(l_position[0] +'/'+ l_position[1]);

    //cannot navigate backwards from or to a splash page
    if(l_position[0] <= 1) {
      $back.disable({ opacity:l_opacity });
    }
    else {
      $back.enable();
    }

    //page types that we want to disable next on if the topic is forced
    //@TODO : add property to page type to discover if nextable
    switch (this.data.type) {
      case 'mp_checklist':
      case 'mp_click_scene':
      case 'mp_demonstration':
      case 'mp_drag_drop_match':
      case 'mp_drag_drop_scene':
      case 'mp_drag_drop_sort':
      case 'mp_explore':
      case 'mp_free_text':
      case 'mp_image_multiple_choice':
      case 'mp_mid_video_activity':
      case 'mp_multiple_choice':
      case 'mp_role_choice':
      case 'mp_search_scene':
      case 'mp_table_activity':
      case 'mp_true_false':
        l_topic = _app.structure.parent(this.id);
        //is the topic forced?
        if (l_topic.force_order === 'true') {
          switch (l_userData[4]) {
            case 0:
            case 1:
              //the activity is completed
              $next.enable();
              break;
            default:
              $next.disable({ opacity:l_opacity });
              break;
          }
        }
        else {
          $next.enable();
        }
        break;

      case 'mp_branching_menu':
        //Theres a user setting in nebula
        if (Number(this.data.disable_next)) {
          $next.disable({ opacity:l_opacity });
        }
        break;

      default:
        //next is enabled by default (unless on last page)
        if (l_position[0] === l_position[1]) {
          $next.disable({ opacity:l_opacity });
        }
        else {
          $next.enable();
        }
        break;
    }
  },


 /**
   * Checks to enable buttons in case study by tab
   */
  enableCasestudyButtons : function (){
    var l_tabReference = this.data.enable_cs_tab,
        l_btnReference = this.data.enable_cs_button;

    // if there is no reference, stop it right here
    if (!l_tabReference) return false;

    // send data to case study
    if (_app.panels.case_study.enabled) {
      _app.panels.case_study.enableButton([l_tabReference, l_btnReference]);
    }
  },



  /**
   * Gathers html for the page. Extended in page_type subclass
   */
  setup : function() {

    var scope = this,
        l_page = _app.structure.find(this.id);

    _app.$content.append(this.html);

    //check for a child item which will be a multi video popup
    if (l_page.children) {
      if (l_page.children.item.type == 'mp_multiple_media') {
        this.multipleMediaPopup(l_page.children.item);
      }
    }

    //hide feedback window
    if (_app.$feedback.is(':visible')) {
      _app.$feedback.trigger('hide');
    }

    //remove tooltip
    $('.tooltip').remove();
    // remove why window
    $('#why-popup').remove();
    //remove any hotspot windows
    $('#hs-popup').remove();

    //set the new location
    _app.session.set('cmi.core.lesson_location', this.id);

    //wait a tad, then call out that we're ready
    setTimeout(function() {
      scope.pageReady();
    }, 100);
  },



  /**
   * Called once html has been inserted into the page (html is built within subclass)
   */
  pageReady : function() {

    var scope = this,
        l_userData = _app.session.getUserData(this.id),
        l_class = this.data.type.split('_').join('-');

    //capture start time
    this.time.start = Date.now();

    //show content
    if (this.showable) {
      _app.$loader.fadeOut(300);
    }

    //look for a submit button and listen for a click
    $('#page.'+ l_class).find('#btn-submit').bind('click', function(p_event) {
      scope.submitAnswers();
      p_event.preventDefault();
    });

    //if there is userdata submit
    if (l_userData[2]) {
      //mark page in reviewMode
      //set to false on try again
      this.reviewMode = true;
      this.attempts--;
      this.submitAnswers();
    }

    //set as current page in menu
    _app.panels.menu.update();

    //check if user data exists & update
    if (! l_userData) {
      switch (this.data.type){
        case 'mp_summary':
          //do nothing because update page data is called on init of this page
          break;

        // no activity or interaction
        case 'mp_basic':
        case 'mp_branching_menu':
        case 'mp_fullscreen_video':
        case 'mp_introduction':
        case 'mp_main_menu':
        case 'mp_media_page':
        case 'mp_role_choice':
        case 'mp_transition':
          //upate as neutral
          this.updatePageData();
        break;

        default:
          //update as viewed
          this.updatePageData([-2]);
          break;
      }
    }

    //find the first heading in the newly inserted content and focus on it
    //so that a screen reader starts reading it out
    if(!this.caseStudyContent){
      _app.$content.findFirstText().attr('tabindex', '-1').focus();
    }else{
      _app.panels.case_study.$panel.find('#'+this.id).findFirstText().attr('tabindex', '-1').focus();
    }

    _app.resizeContent();

    //need to update the size of the elements on the page
    //this also gets called in application.js when the browser is resized
    this.resizePage();


    // check if we need to enable any case study elements
    if(this.data.type != 'mp_splash' && !this.caseStudyContent) {
      this.enableCasestudyButtons();
    }

  },



  /**
   * Called when try again button is pressed
   */
  resetActivity : function() {

    //capture start time
    this.time.start = Date.now();

    this.reviewMode = false;

    //enable sumbit button
    //$('#btn-submit').enable();
  },



  /**
   * The elements that need their dimensions updated
   * Called on page loaded, on browser resize, and text resize button click
   */
  resizePage : function() {
    //override
  },





  /**
   * Called when an activity is submitted
   */
  submitAnswers : function() {
    //override
  },





  /**
   * Shows the feedback results panel
   */
  feedback : function(p_correct) {

    var l_feedback = this.data.feedback ? $.makeArray(this.data.feedback.item) : false,
        l_feedbackCount = l_feedback.length,
        l_feedbackText = '',
        l_topic = _app.structure.parent(this.id),
        l_finalRound = false,
        l_selected = null,
        l_responses = [],
        l_position = _app.structure.getPosition(this.id);

    //go to the next page if theres no feedback on forced order
    if (l_feedback) {
      switch (p_correct) {
        //incorrect
        case 0:
          //check if we've exhausted attempts
          if (this.attempts >= this.maxAttempts) {
            l_feedbackText = l_feedback ? l_feedback[l_feedbackCount - 1].text[0] : '';
            l_finalRound = true;
          }
          else {
            l_feedbackText = l_feedback ? l_feedback[1].text[0] : '';
          }
          break;
        //correct
        case 1:
          l_feedbackText = l_feedback ? l_feedback[0].text[0] : '';
          l_finalRound = true;
          break;
      }
    }
    //check if there is individual feedback for the chosen response - only mp_multiple_choice
    if (this.data.type === 'mp_multiple_choice' && this.data.responses) {
      l_responses = l_responses = $.makeArray(this.data.responses.item);
      l_selected = null;

      _app.$content.find('input').each(function(i) {
        if (this.checked) {
          l_selected = i;
          return false;
        }
      });

      if (l_selected != null && l_responses[l_selected].feedback) {
        l_feedbackText = l_responses[l_selected].feedback;
      }

      if (p_correct || this.attempts >= this.maxAttempts) {
        l_finalRound = true;
      }
    }

    //check if there was feedback
    if (l_feedbackText === '') return;

    //insert the feedback text
    _app.$feedback.find('#feedback-txt').html(l_feedbackText);

    //specific stuff to do on last feedback
    if (l_finalRound) {
      //enable next button if there is a next
      if (l_position[0] < l_position[1]) {
        _app.$feedback.find('.btn-next').show();
      }
      else {
      //or just show an ok button
        _app.$feedback.find('.btn-feedback-hs-done').show().click(function() {
          _app.$feedback.trigger('minimise');
        });
      }

      //show the find out why button if we need it
      if (this.whyFeedback){
        _app.$feedback.find('.btn-findout').show();
      }

      //show the review button if we need it
      if (this.reviewMode && ! Number(l_topic.knowledge_check)) {
        _app.$feedback.find('.btn-reset').show();
      }

      //enable next button if there is a next
      if (l_position[0] < l_position[1]) {
        $('#btn-page-navigation-next').enable();
      }
    }
    else {
      _app.$feedback.find('.btn-tryagain').show(100, function() {
        $(this).focus();
      });
    }

    _app.$feedback.trigger('show');
  },





  /**
   * Adds page data to suspend data session object
   * If no data was passed, item is not scorable
   *
   * pageData [
   *   result (-2 = viewed, -1 = not scored, 0 = incorrect, 1= correct),
   *   user response [array as defined in page type subclass],
   *   page attempts (the attempts the learner has had on this page visit - can be reset)
   *   completed,
   *   actual attempts
   * ]
   */
  updatePageData : function(p_array) {

    var l_array = p_array || [-1],
        l_index = Number(_app.session.get('cmi.interactions._count')) || 0,
        l_result = '',
        l_timeTaken = 0,
        l_actualAttempts = _app.session.getUserData(this.id)[5] || 0,
        l_interactionType = '';

    //capture stop time
    this.time.stop = Date.now();
    l_timeTaken = this.time.stop - this.time.start;

    //add page id to start of array
    l_array.unshift(this.id);

    //retain actual attempts
    l_array[5] = l_actualAttempts;

    //get SCORM result string
    //and show feedback if its an activity
    switch (l_array[1]) {
      case -2:
        //viewed status, only update data
        _app.session.setUserData(l_array);
        _app.scorm.save();
        return;
      case -1:
        l_result = 'neutral';
        break;
      case 0:
        l_result = 'wrong';
        this.feedback(l_array[1]);
        break;
      case 1:
        l_result = 'correct';
        this.feedback(l_array[1]);
        break;
    }

    // mark pages as complete in menu & enable next button
    if (l_array[3]) {
      // pages with attempts get marked on final or correct attempt
      if (l_array[1] == 1 || l_array[3] == this.data.max_attempts) {
        _app.panels.menu.pageComplete(l_array[0]);
        //add completed value to user data
        l_array[4] = 1;
      }
    }
    else {
      // all other pages mark as complete directly
      _app.panels.menu.pageComplete(l_array[0]);
    }

    //maintain completion state
    if (_app.session.getUserData(this.id)[4]) {
      l_array[4] = 1;
    }

    //bypass adding another interaction attempt
    if (this.reviewMode || l_array[1] < 0) {
      //add or overwrite an entry
      _app.session.setUserData(l_array);
      _app.scorm.save();
      return;
    }
    else {
      //add attempts
      l_array[5] = l_actualAttempts + 1;
      //add or overwrite an entry
      _app.session.setUserData(l_array);
    }

    //add interaction to LMS
    _app.session.set('cmi.interactions.'+ l_index +'.id', this.id +'@'+ l_array[5]);
    _app.session.set('cmi.interactions.'+ l_index +'.result', l_result);
    _app.session.set('cmi.interactions.'+ l_index +'.latency', l_timeTaken.toScormTimeString());

    switch (this.data.type) {
      case 'mp_free_text':
        l_interactionType = 'fill-in';
        break;
      case 'mp_checklist':
      case 'mp_click_scene':
      case 'mp_image_multiple_choice':
      case 'mp_multiple_choice':
      case 'mp_table_activity':
        l_interactionType = 'choice';
        break;
      case 'mp_true_false':
        l_interactionType = 'true-false';
        break;
    }
    _app.session.set('cmi.interactions.'+ l_index +'.type', l_interactionType);

//    _app.session.set('cmi.interactions.'+ l_index +'.type', 'performance');
//    _app.session.set('cmi.interactions.'+ l_index +'.student_response', l_array[2].join(' - '));

    //update interactions index
    _app.session.set('cmi.interactions._count', l_index + 1);
    _app.scorm.save();
  },





  /**
   * Sets up why button on activity correct or final attempt
   */
  setupWhy : function() {

    var scope = this,
        $selected = [];

    $('.btn-why').click(function(p_event) {

      var $this = $(this),
          l_index = $this.parent().attr('id').split('r-')[1];

      //unselect previous, select new
      if ($selected.length) $selected.removeClass('selected');
      $selected = $this.addClass('selected');

      //open the box
      scope.launchWhy(l_index);
      p_event.preventDefault();
    })
    .show();
  },





  /**
   * Launches why pop up & functionality
   *
   * @p_index xml data & html selctor reference
   */
  launchWhy : function (p_index) {

    var l_index = p_index,
        $popup = _app.$page.find('#why-popup'),
        $whyButton = $('#r-'+l_index + ' .btn-why'),
        l_offset = $whyButton.offset(),
        l_left = 0,
        l_top = 0,
        h_height = _app.$header.height(),
        l_width = 0,
        l_height = 0;

    //build the popup if it hasn't already been
    if ($popup.length < 1) {
      $popup = $$('div', 'why-popup', 'popup', { role:'dialog' })
        .append($$('div', '', 'title'))
        .append($$('div', '', 'content'));

      //insert into page
      _app.$content.prepend($popup);
    }
    //check if there is a popup already showing
    else if ($popup.is(':visible')) {
      $popup.trigger('close');
    }

    //add the content
    $popup.find('.content').html($.makeArray(this.data.responses.item)[l_index].why);

    //calculate position
    l_width = $popup.actual('width');
    l_height = $popup.actual('height');
    l_left = l_offset.left - _app.dimensions.left - l_width;
    l_top = l_offset.top - _app.dimensions.top - h_height - ((l_height - 29) / 2);

    if (l_left < 5) {
      l_left = l_offset.left - _app.dimensions.left + $whyButton.outerWidth();
    }

    $popup.css({
      position: 'absolute',
      left: Math.round(l_left),
      top: Math.round(l_top)
    });

    //listen for a close trigger
    $popup.bind('close', function() {
      $(this).removeAttr('style');
      //$whyButton.focus();
      $whyButton.removeClass('selected').focus();

      _app.$page.unbind('click.closeWhy');
      _app.$content.find('#activity').unbind('scroll.why');
      $(document).unbind('keyup.findoutwhy');
    });

    //now fade it in
    $popup.fadeIn(400, function() {
      //focus on the content
      $popup.findFirstText().attr('tabindex', '-1').focus();

      //close button click handler
      $('#page, #panel-buttons').on('click.closeWhy', function() {
        $popup.trigger('close');
      });

      //scrolling closes why window too
      _app.$content.find('#activity').bind('scroll.why', function() {
        $popup.trigger('close');
      });

      //also if esc, tab or enter is pressed
      $(document).bind('keyup.findoutwhy', function(e) {
        switch (e.keyCode) {
          case 9:
          case 13:
          case 27:
            $popup.trigger('close');
            e.preventDefault();
            break;
        }
      });
    });
  },




  /**
   * Adds a button to the page that launches a multiple video popup
   *
   * @param p_data
   *    The data of the page type pulled from structure.xml
   *
   * @todo make this function tidier
   */
  multipleMediaPopup : function(p_data) {

    var l_data = _app.sequence.getData(p_data.id),
        l_items = $.makeArray(l_data.media.item),
        l_count = l_items.length,
        l_btnLabel = l_data.button_label || 'Media',
        $button = $$('a', 'btn-multiple-videos', 'btn', { href: '#' }),
        $html = $$('div', 'multivideo-btn').append($button),
        l_showVideo = function() {};

    $button.append(l_btnLabel);


    /**
     * Show the popup
     *
     * @todo move to another file
     */
    l_showVideo = function(p_event) {

      var l_video = {},
          $content = $$('div', '', 'multi-video'),
          $multiPlayer  = $$('div', 'multi-player'),
          l_playerId = 'multi-video-'+ $.randomString(6),
          $btnMedia = [],
          l_thumbSrc = '',
          l_alt = '',
          l_media = {},
          l_description = '',
          l_direction = 'right',
          l_dimensions = { width:300 },
          l_maxWidth = 780,
          l_width = 0,
          l_height = 0;

      //dont show thumbs if only one video
      if (l_count > 1) {

        //loop through vids
        for (var i = 0; i < l_count; i++) {

          l_video = l_items[i].item;
          $btnMedia = $$('div', 'video-'+ i, 'btn-media');
          l_thumbSrc = l_items[i].thumb || 'not_published.jpg';
          l_alt = l_items[i].thumb_alt || '';

          //add thumbnail
          $btnMedia.append($$('div', '', 'thumb')
            .append($$('img').attr({
              src: 'files/'+ l_thumbSrc,
              alt: l_alt
            })));

          //add title
          $btnMedia.append($$('a').attr('href', '#').html(l_video.title));
          $content.append($btnMedia);

          //first item is selected
          if (i === 0) {
            $btnMedia.addClass('selected');
          }
        }
      }
      else {
        $content.addClass('single-video');
      }

      //add video player div
      $content.append($multiPlayer.html($$('div', l_playerId, 'multi-video-media')));

      //popup dem vids yo
      _app.modalOverlay(l_data.title, $content, 'mmp');

      //setup first video
      l_media = l_items[0].item;

      //give the modal overlay time to finish animating - it'll look smoother
      setTimeout(function() {
        l_description = l_items[0].description || l_items[0].item.description || '';

        //setup the player
        switch (l_media.type) {
          case 'mp_resource_video':
            l_media.width = 465;
            l_media.height = l_dimensions.height = 262;
            _app.setupVideoPlayer(l_playerId, l_media);
            break;

          case 'mp_resource_audio':
            l_media.width = 465;
            l_media.height = l_dimensions.height = 262;

            if (l_media.image !== null) {
              _app.setupAudioPlayer(l_playerId, l_media, l_media.image);
            }
            else {
              _app.setupAudioPlayer(l_playerId, l_media);
              l_direction = 'down';
              l_dimensions = { width:465, height:262 };
            }
            break;

          case 'mp_resource_image':
            l_width = l_media.width;
            l_height = l_media.height;

            if (l_media.width > l_maxWidth) {
              l_width = l_maxWidth;
              l_height = l_media.height * (l_maxWidth / l_media.width);
            }

            $multiPlayer.html($$('img').attr({
              src:'files/'+ l_media.content,
              alt: l_items[0].description || l_media.alt_text || '',
              width: l_width,
              height: l_height
            }));
            //remove description for image
            l_description = '';
            break;
        }

        //insert the transcript
        if (! empty(l_description)) {
          $multiPlayer.append($$('div').html(l_description).transcript(l_direction, l_dimensions, l_playerId));
        }
      }, 400);

      //dont need click listeners if only one video
      if (l_count > 1) {

        //add click listener
        $('.btn-media').bind('click', function(p_event) {

          var $this = $(this),
              l_id = $this.attr('id').split('-').pop(),
              l_video = l_items[parseInt(l_id, 10)],
              l_direction = 'right',
              l_dimensions = { width:300 };

          //highlight the selected thumbnail
          $('.btn-media').removeClass('selected');
          $(this).addClass('selected');

          //kill the current player
          _app.removePlayers('multi-video');

          //setup a new player with a different id
          l_playerId = 'multi-video-'+ $.randomString(6);
          $multiPlayer.html($$('div', l_playerId, 'multi-video-media'));

          l_media = l_video.item;
          l_description = l_video.description || l_media.description || '';

          //setup the player
          switch (l_media.type) {
            case 'mp_resource_video':
              l_media.width = 465;
              l_media.height = l_dimensions.height = 262;
              _app.setupVideoPlayer(l_playerId, l_media);
              break;

            case 'mp_resource_audio':
              l_media.width = 465;
              l_media.height = l_dimensions.height = 262;

              if (! empty(l_media.image)) {
                _app.setupAudioPlayer(l_playerId, l_media, l_media.image);
              }
              else {
                _app.setupAudioPlayer(l_playerId, l_media);
                l_direction = 'down';
                l_dimensions = { width:465, height:262 };
              }
              break;

            case 'mp_resource_image':
              l_width = l_media.width;
              l_height = l_media.height;

              if (l_media.width > l_maxWidth) {
                l_width = l_maxWidth;
                l_height = l_media.height * (l_maxWidth / l_media.width);
              }

              $multiPlayer.html($$('img').attr({
                src:'files/'+ l_media.content,
                alt: l_video.description || l_media.alt_text || '',
                width: l_width,
                height: l_height
              }));
              //remove description for image
              l_description = '';
              break;
          }

          //insert the new transcript
          if (! empty(l_description)) {
            $multiPlayer.append($$('div').html(l_description).transcript(l_direction, l_dimensions, l_playerId));
          }

          p_event.preventDefault();
        });
      }

      p_event.preventDefault();
    };

    //listen for a click on the button
    $button.bind('click', l_showVideo);

    _app.$content.find('.inner').eq(0).append($html);
  },



  /**
   * Called before the sequence moves onto another page (sequence.js line 79)
   * Maybe used for saving data state if the user presses next
   */
  destroy : function() {
    //override
  }

});
