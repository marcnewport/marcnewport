/**
 * Application
 *
 * The main script that calls other scripts
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 *
 * @todo this is more of a controller, should the views be removed?
 * @todo should make application customisable by passing params!!!
 * @todo add debugging mode that prints to new window
 * @todo might be thing: adding id at end of hash so vox doesnt say internal link
 * @todo need a button creating method eg. $.button('Label', attr{}, callback())
 * @todo when storing data to suspend_data make sure null values are 0's or something else that is 1 character
 */
var Application = Class.extend({



  /**
   * The constructor. Initialises some important public variables
   */
  init : function() {

    this.initialised = false;

    //fireup the models
    this.scorm = new Scorm();
    this.structure = new Structure();
    this.session = new Session();
    this.sequence = new Sequence();

    //reference to the page type showing
    this.currentPage = {};

    //reference to the slide panels
    this.panels = {};

    //for toggling text size
    this.textSize = 'normal';

    //application dimensions - can be overwritten in init.js
    this.dimensions = {
      layout: 'fixed',
      width: 990,
      height: 550
    };

    //where the navigation is placed
    this.navigation = 'left';

    //check environment
    this.environment = this.checkEnvironment();

    //the role that may be selected by the learner
    this.role = '';

    // Debugging turned off by default
    this.debug = false;
  },



  /**
   * Called when the page has loaded. Initialises te models etc.
   */
  start : function() {

    var l_environment = '',
        l_fragment = document.URL.split('.')[0].replace('http://', ''),
        l_classes = [];

    //grab some elements and wrap them in jquery
    this.$body = $('body');
    this.$page = $('#page');
    this.$header = $('#header');
    this.$content = $('#content');
    this.$footer = $('#footer');
    this.$blocker = $('#blocker');
    this.$loader = $('#loader');
    this.$feedback = $('#feedback');

    switch (l_fragment) {
      case 'local':
      case 'dev':
        l_environment = l_fragment;
        break;
    }

    l_classes = [
      'navigation-'+ _app.navigation,
      l_environment
    ];

    this.$body.addClass(l_classes.join(' '));

    //navigation position...
    switch (_app.navigation) {
      case 'top':
        //reverse order of buttons so we can float them right
        var $buttons = $('#panel-buttons');
        $buttons.append($buttons.children('.btn-panel').get().reverse());
        //remove images
        $buttons.find('img').remove();
        break;

      case 'hamburger':
      var $hamburger = $$('a', '', 'btn-hamburger').attr('href', '#').html($$('i', '', 'icon icon-hamburger-menu'));
        this.$header.find('.inner').prepend($hamburger);

        $hamburger.on('click', function(e) {
          e.preventDefault();
          _app.currentPage.togglePanels();
        });
        break;
    }

    this.resizeContent();

    //initialise the panels
    this.panels = {
      menu: new PanelMenu(),
      resources: new PanelResources(),
      case_study: new PanelCaseStudy(),
      notes: new PanelNotes(),
      active: '',
      showing: false,
      close: function() {
        var l_active = this.active.replace(/-/g, '_');
        if (! empty(l_active)) {
          this[l_active].close();
        }
      }
    };

    var scope = this;

    //connect to the LMS
    this.scorm.connect(function() {
      //build the structure object
      scope.structure.build(function() {
        //fire up the session object
        scope.session.start(function() {
          //now do the rest of the things
          scope.ready();
        });
      });
    });
  },



  /**
   * Called when the app is ready to display the page
   */
  ready : function() {

    //check if debug mode was pesistent
    if (_app.debug || _app.session.getUserData('DEBUG')) {
      this.debugMode(true);
    }

    //following panels are always available
    this.panels.menu.setup();
    this.panels.menu.enable();
    this.panels.notes.setup();
    this.panels.notes.enable();

    //if there is a case study, enable it
    var l_caseStudy = this.structure.getCaseStudy(),
        l_csTitle = l_caseStudy.title || 'Case study';

    if (l_caseStudy) {
      this.panels.case_study.enable();
      this.panels.case_study.setup(l_caseStudy);

      $('#btn-case-study').attr('title', 'Show the '+ l_csTitle.toLowerCase() +' panel')
        .find('.label').html(l_csTitle);
    }

    //add a body class that hides disabled panel tabs
    if (Number(_app.structure.course.settings.display_disabled_tabs) === 0) {
      this.$body.addClass('hide-disabled-tabs');
    }

    //setup some page areas
    this.setupPage();
    this.setupHeader();
    this.setupFooter();
    this.setupFeedback();

    //launch application into the first appropriate page
    this.sequence.goTo(this.getLocation());

    //resize the content div when the window gets resized
    $(window).resize(this.resizeContent);
    //window.addEventListener('orientationchange', this.resizeContent);

    _app.$loader.removeClass('initialising');
  },



  /**
   * Determines what page to start on
   */
  getLocation : function() {

    var l_location = '',
        l_url = document.location.href;

    //if we're connected to an LMS and we are resuming, get the saved location
    if (this.scorm.connected && this.structure.course.settings.resume_session) {
      l_location = this.scorm.retrieve('cmi.core.lesson_location');
    }

    //check the url for a hash, this has precedence
    if (l_url.indexOf('#') > -1) {
      l_location = l_url.split('#').pop();
    }

    //if there's no location, just get the first page in the structure
    if (empty(l_location)) {
      l_location = this.structure.first().id;
    }

    return l_location;
  },



  /**
   * Sets up page functionality
   */
  setupPage : function() {

//    //preload player.swf
//    $(document).load('files/player.swf');

    //create a live click on glossary-term
    $(document).on('click', '.glossary-term', this.glossaryHandler);

    // //focus for invisible inputs
    // $('.custom-input').live('focus', function() {
    //   $(this).parent().addClass('focus');
    // });
    //
    // //unfocus for invisible inputs
    // $('.focus').live('blur', function() {
    //   $(this).removeClass('focus');
    // });
  },



  /**
   * Sets up page header functionality
   */
  setupHeader : function() {

    var scope = this,
        l_state = 0,
        l_sizes = ['text-size-normal', 'text-size-big', 'text-size-biggest'],
        $message = [],
        $button = [];

    $('#header-buttons').click(function(p_event) {
      //if the target was the button's image element, bubble up
      if (p_event.target.nodeName.toLowerCase() == 'img') {
        p_event.target = p_event.target.parentElement;
      }

      //now check what button was clicked
      switch (p_event.target.id) {
        case 'btn-size-minus':
          if (l_state > 0) l_state--;
          scope.$body.removeClass(l_sizes.join(' ')).addClass(l_sizes[l_state]);
          _app.currentPage.resizePage();
          break;

        case 'btn-size-plus':
          if (l_state < 2) l_state++;
          scope.$body.removeClass(l_sizes.join(' ')).addClass(l_sizes[l_state]);
          _app.currentPage.resizePage();
          break;

        case 'btn-help':
          scope.showHelp();
          break;

        case 'btn-exit':
          $message = $$('div');
          $button = $$('a', 'btn-exit-confirm', 'button', { href:'#', role:'button' });

          $message
            .append($$('p').html('Are you sure you want to exit this module?'))
            .append($button.html('Exit module'));

          scope.modalOverlay('Exit module', $message, 'small', 'Cancel');

          $button.click(function(p_event) {
            p_event.preventDefault();
            scope.sequence.exit();
          });
          break;
      }

      p_event.preventDefault();
    });


    if (_app.structure.course.settings.exit_button === 'text') {
      $('#btn-exit').html('save & exit').addClass('has-text-label');
    }

  },



  /**
   * Sets up page footer functionality
   */
  setupFooter : function() {

    var scope = this,
        $navigation = this.$footer.find('#page-navigation'),
        l_copyright = this.structure.course.copyright || '',
        $back = [],
        $next = [];

    //insert copyright text
    this.$footer.find('#copyright').html($$('p').html(l_copyright));

    //build the buttons
    $back = $$('button', 'btn-page-navigation-back', 'button').html('Back').attr({
      title: 'Go to the previous page'
    });

    $next = $$('button', 'btn-page-navigation-next', 'button').html('Next').attr({
      title: 'Go to the next page'
    });

    $navigation
      .append($back)
      .append($$('span', '', 'page-navigation-position'))
      .append($next);

    $(document).on('click', '#btn-page-navigation-back', function(p_event) {
      scope.panels.close();
      scope.sequence.back();
      p_event.preventDefault();
    });

    $(document).on('click', '#btn-page-navigation-next', function(p_event) {
      scope.sequence.next();
      scope.panels.close();
      p_event.preventDefault();
    });

//    //let the user navigate via ctrl + arrow buttons
//    $(document).bind('keyup', function(e) {
//      if (e.ctrlKey) {
//        switch (e.keyCode) {
//          case 37:
//            _app.sequence.back();
//            break;
//          case 39:
//            _app.sequence.next();
//            break;
//        }
//      }
//    })
//    .bind('contextmenu', function(e) {
//      //listen for a ctrl + right click for testers to get environment details
//      if (e.ctrlKey) {
//        console.group('Application Information');
//        console.log('Environment: '+ window.navigator.userAgent);
//        console.log('Location: '+ _app.structure.course.id +' > '+ _app.currentPage.id);
//        console.groupEnd();
//        e.preventDefault();
//      }
//    });
  },



  /**
   * Sets up feedback panel functionality
   */
  setupFeedback : function() {

    var $document = $(document),
        $feedbackFooter = _app.$feedback.find('.feedback-footer'),
        $feedbackBtn = $feedbackFooter.find('.btn-feedback'),
        $enabled = [];

    //listen for feedback buttons being clicked..
    this.$feedback.click(this.feedbackHandler);

    //custom events on the feedback box
    this.$feedback.bind('show', function() {
      _app.$feedback.find('#feedback-content').removeAttr('style');

      //slide down, focus on first button
      _app.$feedback.addClass('open').removeAttr('style').slideDown(200, function() {
        _app.$feedback.findFirstText().attr({ tabindex:'-1' }).focus();
        //disable tabbing
        $('#content, #panel-buttons').disableFocus();
      });

      //Fadein blocker and close on click
      _app.$blocker.addClass('feedback').fadeIn().bind('click.feedbackMinimise', function() {
        _app.$feedback.trigger('minimise');
      });

      //listen for an esc pressed
      $document.bind('keyup.feedback', function(e){
        if (e.keyCode == 27) _app.$feedback.trigger('minimise');
      });
    })
    .bind('hide', function(e, $element) {
      //need to hide buttons first to avoid ghosts in IE7
      _app.$feedback.find('.feedback-button').removeAttr('style');

      //slide up
      _app.$blocker.hide().removeClass('feedback');
      _app.$feedback.removeClass('open').slideUp(200, function() {
        //enable tabbing
        $('#content, #panel-buttons').enableFocus();

        //were we given an element to return focus to?
        if (! $element) {
          //nope, is there question text we can return to?
          $element = _app.$content.find('#question');

          if (! $element.length) {
            //if not, just focus on the first text element in the content
            $element = _app.$content.findFirstText();
          }
        }
        //for some reason jquery gets stripped from param
        if (! $element.is) $element = $($element);
        $element.attr('tabindex', '-1').focus().removeAttr('tabindex');
      });

      //unlisten...
      _app.$blocker.unbind('click.feedbackMinimise');
      $document.unbind('keyup.feedback');
    })
    .bind('maximise', function() {
      //slide down
      _app.$blocker.addClass('feedback').fadeIn();
      _app.$feedback.addClass('open').find('#feedback-content').slideDown(200, function() {
        //enable old button
        $enabled.show();
        $feedbackBtn.removeAttr('style');
        //focus on text
        _app.$feedback.findFirstText().attr({ tabindex:'-1' }).focus();
        //disable tabbing
        $('#content, #panel-buttons').disableFocus();
      });

      //listen for a click on the blocker
      _app.$blocker.bind('click.feedbackMinimise', function() {
        _app.$feedback.trigger('minimise');
      });

      //listen for an esc pressed
      $document.bind('keyup.feedback', function(e){
        if (e.keyCode == 27) _app.$feedback.trigger('minimise');
      });

      //unbind maximise listener
      $feedbackBtn.unbind('click.feedbackMaximise');
    })
    .bind('minimise', function(e, $element) {
      //capture enabled buttons in footer
      $enabled = $feedbackFooter.find('.feedback-button:visible');

      //slide up
      _app.$blocker.fadeOut(400, function() {
        _app.$blocker.removeClass('feedback');
      });
      _app.$feedback.removeClass('open').find('#feedback-content').slideUp(200, function() {
        //hide all buttons
        $feedbackFooter.find('.feedback-button').removeAttr('style');
        //show a maximise feedback button
        $feedbackBtn.show().bind('click.feedbackMaximise', function() {
          _app.$feedback.trigger('maximise');
        });

        //check if an element was given to focus on
        if ($element) {
          $element.focus();
        }
        else {
          //just focus on the first text element in the content
          _app.$content.findFirstText().attr('tabindex', '-1').focus();
        }

        //enable tabbing
        $('#content, #panel-buttons').enableFocus();
      });

      //unlisten...
      _app.$blocker.unbind('click.feedbackMinimise');
      $document.unbind('keyup.feedback');
    });
  },





  /**
   * Displays the help popup
   */
  showHelp : function() {

    var l_items = $.makeArray(_app.structure.course.resources.help.item),
        l_count = l_items.length,
        $overlay = [],
        l_overlayWidth = 0,
        $help = $$('ul', 'help-content'),
        $item = [],
        $image = [],
        l_maxW = 140,
        l_newW = 0,
        l_newH = 0;

    //loop through help items and add em to the html
    for (var i = 0; i < l_count; i++) {
      $image = $$('div', '', 'image');

      //look for an image
      if (l_items[i].image !== undefined) {

        if (l_items[i].width > l_maxW) {
          l_newW = l_maxW;
          l_newH = Math.floor((l_items[i].height / l_items[i].width) * l_maxW);
        }
        else {
          l_newW = l_items[i].width;
          l_newH = l_items[i].height;
        }

        $image.append($$('img').attr({
          src: 'files/'+ l_items[i].image,
          alt: '',
          width: l_newW,
          height: l_newH
        }));
      }

      //add html content to the item
      $item = $$('li', '', 'help-item')
          .append($$('a').attr({ href:'#', 'class':'title custom-input', 'aria-expanded':'false' })
            .append(l_items[i].title))
          .append($$('div', '', 'help-item-content hidden closed')
            .append($image)
            .append($$('div', '', 'text').html(l_items[i].content)));

      //add that item to a wrapping div
      $help.append($item);
    }

    //show the overlay
    $overlay = _app.modalOverlay('Help', $help);

    //calculate the inner text width
    l_overlayWidth = $overlay.width();
    l_overlayWidth = Math.round(l_overlayWidth - l_maxW - 60 - 60 - 40 - 20);
    $overlay.find('.help-item').find('.text').width(l_overlayWidth);

    //listen for clicks and expand content
    $help.find('a.title').bind('click', function(p_event) {

      var $this = $(this),
          $item = $this.parent();

      if ($item.hasClass('open')) {
        //close the accordian item
        $this.attr({ 'aria-expanded':'false' });
        $item.find('.help-item-content').slideUp(function() {
          $item.removeClass('open');
        });
      }
      else {
        //open the accordian item
        $this.attr({ 'aria-expanded':'true' });
        $item.find('.help-item-content').slideDown(function() {
          $item.addClass('open');
        });
      }

      p_event.preventDefault();
    });
  },



  /**
   * inside these handler functions 'this' refers to the event caller not the _app class
   */
  glossaryHandler : function(p_event) {

    var $this = $(this),
        l_glossary = $.makeArray(_app.structure.course.resources.glossary.item),
        l_count = l_glossary.length,
        l_term = $this.attr('name'),
        l_definition = 'Not found.';

    //find the definition
    for (var i = 0; i < l_count; i++) {
      if (l_glossary[i].term == l_term) {
        l_definition = l_glossary[i].definition;
      }
    }

    //open a custom tooltip
    $this.tooltip(l_definition);

    p_event.preventDefault();
  },



  /**
   * Handler for feedback buttons clicked
   * inside these handler functions 'this' refers to the event caller not the _app class
   */
  feedbackHandler : function(p_event) {

    var $target = $(p_event.target);

    if ($target.hasClass('feedback-button')) {
      if ($target.hasClass('btn-tryagain')) {
        _app.currentPage.resetActivity();
        _app.$feedback.trigger('hide');
      }
      else if ($target.hasClass('btn-reset')) {
        _app.currentPage.attempts = 0;
        _app.currentPage.reviewMode = false;
        _app.currentPage.resetActivity();
        _app.$feedback.trigger('hide');
      }
      else if ($target.hasClass('btn-next')) {
        _app.$feedback.trigger('hide');
        _app.sequence.next();
      }
      else if ($target.hasClass('btn-findout')) {
        if (_app.currentPage.whyFeedback){
          _app.currentPage.setupWhy();
          _app.$feedback.trigger('minimise', _app.$content.find('.btn-why').get(0));
          //hide the find out why button after 1 second
          setTimeout(function() {
            $target.removeAttr('style');
          }, 1000);
        }
        //minimise feedback
        if (_app.$feedback.hasClass('open')) {
          _app.$feedback.find('.btn-toggle').trigger('click');
        }
      }

      p_event.preventDefault();
    }

  },



  /**
   * Returns the environment
   */
  checkEnvironment : function() {

    var l_host = location.host,
        l_environment = '';

    switch (l_host.split('.')[0]) {
      case 'localhost':
        l_environment = 'local';
        break;

      case 'dev':
        l_environment = 'dev';
        break;

      default:
        l_environment = 'live';
        break;
    }
    return l_environment;
  },



  /**
   * Handler for a resize of the browser
   * Positions elements on the page
   */
  resizeContent : function() {

    var $window = $(window),
        $panels = $('#panels'),
        $body = this.$body || $('body'),
        l_marginTop = 0,
        l_marginLeft = 0,
        w_width = $window.width(),
        w_height = $window.height(),
        h_width = 0,
        x_outer = 0,
        y_outer = 0,
        $inner = _app.$content.find('.inner'),
        y_margin = 0,
        x_margin = 0;

    if (window.orientation) {
      switch (window.orientation) {
        case 0:
        case 180:
          $body.addClass('portrait');
          break;
        default:
          $body.removeClass('portrait');
          break;
      }
    }

    //is this a fluid design?
    if (_app.dimensions.layout == 'fluid') {
      l_marginTop = 0;
      l_marginLeft = 0;
      w_width = _app.dimensions.width = $window.width();
      w_height = _app.dimensions.height = $window.height();
    }
    else {
      //center it
      l_marginTop = (w_height - _app.dimensions.height) / 2;
      l_marginTop = (l_marginTop < 0) ? 0 : Math.round(l_marginTop);
      l_marginLeft = (w_width - _app.dimensions.width) / 2;
      l_marginLeft = (l_marginLeft < 0) ? 0 : Math.round(l_marginLeft);

      //update width vars
      w_width = _app.dimensions.width;
      w_height = _app.dimensions.height;
    }

    $body.css({
      position: 'absolute',
      marginTop: l_marginTop,
      marginLeft: l_marginLeft,
      width: w_width,
      height: w_height
    });

    //update the header inner width
    h_width = _app.dimensions.width - _app.$header.find('#header-logo').width() - _app.$header.find('#header-buttons').width() - 10;
    _app.$header.find('h1').width(h_width);

    //update margins for later retrieval
    _app.dimensions.left = l_marginLeft;
    _app.dimensions.top = l_marginTop;

    //outer margins/padding etc. for content
    y_outer = _app.$header.find('.inner').eq(0).height() + _app.$footer.outerHeight(true);

    //update the content div
    _app.$content.css({
      width: w_width - x_outer,
      height: w_height - y_outer
    });

    _app.$content.find('#inner-wrap').css({
      width: (w_width - x_outer) * 2,
      height: w_height - y_outer
    });

    x_margin = parseInt($inner.css('margin-left'), 10) + parseInt($inner.css('margin-right'), 10);
    y_margin = parseInt($inner.css('margin-top'), 10) + parseInt($inner.css('margin-bottom'), 10);

    $inner.css({
      width: w_width - x_outer - x_margin,
      height: w_height - y_outer - y_margin
    });

    //update blocker dimensions
    _app.$blocker.css({
      width: w_width - x_outer,
      height: w_height - y_outer
    });

    //outer margins/padding etc. for panels
    x_outer = 130;
    switch (_app.navigation) {
      case 'top':
      case 'hamburger':
        x_outer = 40;
        break;
    }
    y_outer = 86;

    //update the panel divs
    $panels.css({
      width: w_width - x_outer,
      height: w_height - y_outer
    })
    .find('.panel-content').css({
      //width: w_width - x_outer - 110,
      height: w_height - y_outer - 78
    });

    // responsive open button
    $('#panel-buttons').find('.btn-open').css('left', w_width - x_outer + 19 + 'px');
    $('#panel-menu').find('.panel-content').css('height', w_height - y_outer - 60);

    //call page specific resizes
    if (! empty(_app.currentPage)) {
      _app.currentPage.resizePage();
    }
  },




  /**
   * Creates a modal overlay that will resize with the page
   */
  modalOverlay : function(p_title, p_content, p_size, p_label, p_callback) {

    var scope = this,
        $window = $(window),
        $overlay = $('#modal-overlay'),
        $title = $overlay.find('.title').find('.inner'),
        $btnClose = $overlay.find('#btn-overlay-close'),
        $content = $overlay.find('.content'),
        l_title = p_title || '',
        l_content = p_content || '',
        l_resize = function() {},
        l_label = p_label || 'Close',
        l_opener = document.activeElement,
        l_type = _app.currentPage.data.type.split('_').join('-');

    /**
     * Calculate the size the overlay should be
     */
    l_resize = function() {

      var w_width = (scope.dimensions === 'fluid') ? $window.width() : scope.dimensions.width,
          w_height = (scope.dimensions === 'fluid') ? $window.height() : scope.dimensions.height,
          l_width = w_width - 240,
          l_height = w_height - 100,
          l_left = 135,
          l_top = _app.$header.find('.inner').eq(0).height(),
          l_titleHeight = $overlay.children('.title').outerHeight(true),
          y_margin = $content.outerWidth(true) - $content.outerWidth(),
          x_margin = $content.outerHeight(true) - $content.outerHeight();

      switch (p_size) {
        case 'small':
          l_width -= 240;
          l_height -= 200;
          l_left = (w_width - l_width) / 2;
          break;

        case 'tall':
          l_height += 25;
          break;

        case 'full':
          l_left = 20;
          l_width = w_width - 40;
          l_height += 25;
          break;

        case 'mmp':
          //add width so the mmp covers its opening button
          l_width += 90;
          //shorten the height of multi media panel with top nav
          if (_app.navigation === 'top' || _app.navigation === 'hamburger') {
            l_height -= 30;
          }
          break;
      }

      $overlay.css({
        width: l_width,
        height: l_height,
        top: l_top,
        left: l_left
      });

      $content.css({
        width: l_width - y_margin,
        height: l_height - l_titleHeight - x_margin
      });
    };

    $overlay.removeAttr('class').addClass(p_size).addClass(l_type);

    //calculate the size of the overlay and listen for resize
    l_resize();
    $window.bind('resize.overlay', l_resize);

    //show blocker
    this.$blocker.addClass('modal').fadeIn();

    //show window
    $overlay.slideDown(150, function() {
      //this should focus the screen reader on the title
      $overlay.findFirstText().attr('tabindex', '-1').focus();
      //bind esc keypress to close the overlay
      $(document).bind('keyup.closeOverlay', function(e) {
        if (e.keyCode === 27) {
          $overlay.trigger('close');
          e.preventDefault();
        }
      });

      //hit resize again so we can get the title height
      l_resize();

      if (p_callback) p_callback($content);
    });

    //insert the content
    $title.html($$('h3').html(l_title));
    $content.html(l_content);
    $btnClose.html(l_label);

    //disable all focusable items outside the modal
    $('#page, #panel-buttons').disableFocus();

    $overlay.bind('close', function() {
      //dont remove blocker if a panel is open
      if ($('#panels').is(':visible') || _app.$feedback.find('#feedback-content').is(':visible')) {
        scope.$blocker.removeClass('modal');
      }
      else {
        scope.$blocker.removeClass('modal').fadeOut();
      }

      //fade out the overlay then remove the content
      $overlay.slideUp(150, function() {
        $title.empty();
        $content.empty();
        $overlay.removeAttr('class');
      });

      _app.removePlayers('resource-media', 'multi-video');

      //return focusable elements back to normal
      $('#page, #panel-buttons').enableFocus();

      //remove event listeners
      $btnClose.unbind('click');
      $window.unbind('resize.overlay', l_resize);
      _app.$blocker.unbind('click.blockerClickModal');
      $(document).unbind('keyup.closeOverlay');

      //put focus back on the opening element or the title of the page
      setTimeout(function() { l_opener.focus(); }, 500);
    });

    //listen for the close click
    $btnClose.click(function(p_event) {
      $overlay.trigger('close');
      p_event.preventDefault();
    });

    //should be able to close on bg click too
    _app.$blocker.bind('click.blockerClickModal', function() {
      $overlay.trigger('close');
    });

    return $overlay;
  },



  /**
   * Sets up a jwplayer for video
   */
  setupVideoPlayer :function(p_selector, p_video) {

    var $body = this.$body,
        $player = [],
        $wrap = [],
        $frame = [],
        l_player = {};

    //jwplayer doesnt seem to keep the class name, wrap it in a div so we can target it
    $wrap = $$('div', '', 'jwplayer-wrap', { title:'Video player'}).css({
      position: 'relative',
      width: p_video.width,
      height: p_video.height
    });

    $player = $('#'+ p_selector).wrap($wrap);

    //is this a VIMEO player?
    if (Number(p_video.streaming) && p_video.address.indexOf('vimeo') > -1) {

      $frame = $$('iframe').attr({
        title: 'Vimeo player',
        src: p_video.address,
        width: p_video.width,
        height: p_video.height,
        frameborder: 0,
        webkitallowfullscreen: 1,
        mozallowfullscreen: 1,
        allowfullscreen: 1
      });

      //found an issue with the combination of vimeo/firefox/moodle as documented in jira ASBL-818
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        $frame.attr('sandbox', 'allow-same-origin allow-scripts allow-popups');
      }

      $player.html($frame);

      l_player = $f($frame[0]);
      l_player.vimeo = true;
      l_player.ready = false;

      //wrap the vimeo player api methods so that they have the same names as jwplayer
      l_player.onReady = function(callback) {
        l_player.addEvent('ready', function() {
          l_player.ready = true;
          if (callback) callback();
        });
      };

      l_player.onPlay = function(callback) {
        l_player.addEvent('play', function() {
          if (callback) callback();
        });
      };

      l_player.onTime = function(callback) {
        l_player.addEvent('playProgress', function(event) {
          event.position = event.seconds;
          if (callback) callback(event);
        });
      };

      l_player.onSeek = function(callback) {
        l_player.addEvent('seek', function(event) {
          event.offset = Number(event.seconds);
          if (callback) callback(event);
        });
      };

      l_player.play = function() {
        l_player.api('play');
      };

      l_player.pause = function() {
        l_player.api('pause');
      };

      l_player.seek = function(time) {
        l_player.addEvent('ready', function() {
          l_player.api('seekTo', time);
          l_player.play();
        });
      };

      l_player.setFullscreen = function(fullscreen) {
        //there is no exit full screen in the vimeo api
        //firing an esc key press event doesn't work either
        //
      };

      l_player.getMute = function() {
        var volume = l_player.api('getVolume');
        return volume === 0 ? true : false;
      };

      l_player.setMute = function(mute) {
        if (mute) {
          l_player.api('setVolume', 0);
        }
        else {
          l_player.api('setVolume', 0.8);
        }
      };

      l_player.resize = function(width, height) {
        $wrap.css({ width:width, height:height });
        $frame.attr({ width:width, height:height });
      };

      l_player.setPosition = function(time) {
        l_player.play();
        l_player.api('seekTo', time);
        l_player.pause();
      };
    }
    //is this a YOUTUBE player?
    else if (Number(p_video.streaming) && p_video.address.indexOf('youtube') > -1) {

      var l_playerVars = {},
          l_playTimeInt = 0,
          l_event = {};

      //force captions by default
      if (Number(p_video.force_captions) === 0) {
        //do nothing
      }
      else {
        l_playerVars.cc_load_policy = 1;
      }

      l_playerVars.rel = 0;
      l_playerVars.showinfo = 0;
      l_playerVars.html5 = 1;
      l_playerVars.autohide = 1;

      // loads the player into the page
      l_player = new YT.Player(p_selector, {
        height: p_video.height,
        width: p_video.width,
        videoId: p_video.address.split('/').pop(),
        playerVars: l_playerVars
      });

      //wrap the youtube player api methods so that they have the same names as jwplayer
      l_player.onReady = function(callback) {
        l_player.addEventListener('onReady', function() {
          l_player.ready = true;
          if (callback) callback();
        });
      };

      l_player.onTime = function(callback) {
        l_player.addEventListener('onTime', function(event) {
            if (callback) callback(event);
        });
      };

      l_player.onPlay = function(callback) {
        l_player.addEventListener('onStateChange', function() {
          if (l_player.getPlayerState() == 1){
            if (callback) callback();
          }
        });
      };

      l_player.onPause = function(callback) {
        l_player.addEventListener('pause', function() {
          if (callback) callback();
        });
      };

      l_player.onSeek = function(callback) {
        l_player.addEventListener('seek', function(event) {
          if (callback) callback();
        });
      };

      l_player.play = function() {
        l_player.playVideo();
      };

      l_player.pause = function() {
        l_player.pauseVideo();
      };

      l_player.seek = function(time) {
        l_player.seekTo(time);
        l_player.playVideo();
      };

      l_player.onTime = function(time) {
        //listen for the video to play or pause
        l_player.addEventListener('onStateChange', function() {
          //what changed?
          if (l_player.getPlayerState() == 1){
            //playing - continuosly check the time 5 times a second
            l_playTimeInt = setInterval(function() {
              l_event.position = l_player.getCurrentTime();
              time(l_event);
              }, 200);
          }
          else {
            //paused - kill the interval
            clearInterval(l_playTimeInt);
          }
        });
      };

      l_player.getMute = function() {};
      l_player.setMute = function() {};

      l_player.setFullscreen = function(fullscreen) {
        // TODO: there's a hole in YT API here.
        // Possibly need to write custom controls with chromeless player to avaoid
      };

      l_player.getPosition = function() {
        return l_player.getCurrentTime();
      };

      l_player.setPosition = function(time) {
        l_player.seekTo(time);
        l_player.pause();
      };
    }
    //must be a JWPLAYER player
    else {
      l_player = jwplayer(p_selector).setup({
        width: p_video.width +'px',
        height: p_video.height +'px',
        file: 'files/'+ p_video.content,
        modes: [{ type:'html5' }, { type:'flash', src:'files/player.swf' }, { type:'download' }],
        'controlbar.position': 'over',
        'controlbar.idlehide': true,
        stretching: 'fill',
        repeat: false
      });

      //players are set to autoplay, we want to pause it on first frame
      l_player.onReady(function() {
        this.ready = true;
        this.play();

        //try to pause the player at start to see an image frame
        l_player.onBufferFull(function() {
          if (l_player.getPosition() < 1 && l_player.getState() !== 'PAUSED') {
            l_player.pause();
          }
        });

        if (l_player.getState() === 'PLAYING') {
          l_player.pause();
        }
      })
      .onComplete(function() {
        //set time back to 0 and stop playback
        l_player.seek(0);
        l_player.pause();
      })
      .onFullscreen(function() {
        //add/remove class to body
        if (this.getFullscreen()) {
          $body.addClass('fullscreen');
        }
        else {
          $body.removeClass('fullscreen');
        }
      });

      l_player.setPosition = function(time) {
        l_player.play();
        l_player.seek(time);
        l_player.pause();
      };

      l_player.jwplayer = true;
    }

    l_player.onReady(function() {
      this.ready = true;

      //label the video player an associate its description
      $(this.container).attr({
        'aria-label': 'Video Player',
        'aria-describedby': p_selector +'-description',
        'tabindex': '0'
      })
      //add keyboard listener
      .on('keyup', function(e) {
        switch (e.which) {
          case 13:
          case 32:
            if (l_player.getState() === 'PLAYING') {
              l_player.pause();
            }
            else {
              l_player.play();
            }
            break;
        }
      })
      //add alt tags to any images in the player
      .find('img').each(function() {
        if (! this.alt) this.alt = '';
      });
    });

    //return the player reference
    return l_player;
  },



  /**
   * Sets up a jwplayer for audio
   */
  setupAudioPlayer : function(p_selector, p_audio, p_image) {

    var $body = this.$body,
        $selector = $('#'+ p_selector),
        l_player = {},
        l_image = p_image || {},
        l_height = l_image.content ? p_audio.height : 24,
        l_config = {};

    //jwplayer doesnt seem to keep the class name, wrap it in a div so we can target it
    $selector.wrap($$('div', '', 'jwplayer-wrap')
        .css({ position: 'relative', width:p_audio.width, height:l_height }));

    //player config
    l_config = {
      width: l_player.width +'px',
      height: l_height +'px',
      file: 'files/'+ p_audio.content,
      modes: [{ type:'html5' }, { type:'flash', src:'files/player.swf' }, { type:'download' }],
      controlbar: 'bottom',
      stretching: 'fill'
    };

    if (l_image.content) {
      l_config.image = 'files/'+ l_image.content;
      l_config.controlbar = 'over';
      l_config['controlbar.idlehide'] = true;
    }

    //config complete - setup player
    l_player = jwplayer(p_selector).setup(l_config);

    //players are set to autoplay, we want to pause it on first frame
    l_player.onReady(function() {
      this.ready = true;

      //label the audio player an associate of its description
      $(this.container).attr({
        'aria-label': 'Audio Player',
        'aria-describedby': p_selector +'-description',
        'tabindex': '0'
      })
      //add keyboard listener
      .on('keyup', function(e) {
        switch (e.which) {
          case 13:
          case 32:
            if (l_player.getState() === 'PLAYING') {
              l_player.pause();
            }
            else {
              l_player.play();
            }
            break;
        }
      })
      //add alt tags to any images in the player
      .find('img').each(function() {
        if (this.id.indexOf('_jwplayer_display_image') > -1) {
          this.alt = l_image.alt_text || '';
        }
        else if (! this.alt) {
          this.alt = '';
        }
      });
    })
    .onFullscreen(function() {
      if (this.getFullscreen()) {
          $body.addClass('fullscreen');
        }
        else {
          $body.removeClass('fullscreen');
        }
    });

    l_player.setPosition = function(time) {
      l_player.play();
      l_player.seek(time);
      l_player.pause();
    };

    //return the player reference
    return l_player;
  },



  /**
   * Pauses all or some media players in the app
   *
   * @param arguments
   *    An array of player id's or partial id's eg. 'multi-video-'
   */
  pausePlayers : function() {

    var players = arguments,
        searching = players.length;

    $.each(jwplayer.getPlayers(), function(i, player) {
      if (player.ready && player.getState() === 'PLAYING') {
        //are we looking for particular players?
        if (searching) {
          for (var id in players) {
            if (String(player.id).indexOf(players[id]) > -1) {
              player.pause();
            }
          }
        }
        else {
          player.pause();
        }
      }
    });

    //pause any vimeo or youtube iframes too
    //also need to look for id names
    _app.$content.find('iframe').each(function() {
      if (this.src.indexOf('vimeo') > -1) {
        this.contentWindow.postMessage('{"method":"pause"}', '*');
      }
      else if (this.src.indexOf('youtube') > -1) {
        this.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    });
  },



  /**
   * IE8 seems to hold on to the jwplayers even though the element has been removed
   * this should remove them entirely
   *
   * @param arguments
   *    An array of player id's, otherwise it'll remove all players
   *    (unique strings are usually added to the end of the id, so only need to look for start of
   *    the id eg. 'multi-video-')
   */
  removePlayers : function() {

    var players = arguments,
        searching = players.length;

    $.each(jwplayer.getPlayers(), function(i, player) {
      if (player.ready) {
        //are we looking for particular players?
        if (searching) {
          //yes - find them all. and destroy them.
          for (var id in players) {
            if (String(player.id).indexOf(players[id]) > -1) {
              jwplayer.api.destroyPlayer(player.id);
            }
          }
        }
        else {
          //no - kill them all
          jwplayer.api.destroyPlayer(player.id);
        }
      }
    });

    //removeany vimeo or youtube iframes too
    _app.$content.find('iframe').each(function() {
      if (this.src.indexOf('vimeo') > -1 || this.src.indexOf('youtube') > -1) {
        $(this).html('');
      }
    });
  },



  /**
   * Turns debug mode on or off (persistent over sessions)
   */
  debugMode : function(debug) {
    if (console) {
      if (debug !== false) {
        this.debug = true;

        console.log('Debug mode: on');
        // load the platform script so we can get data about the browser and os
        $.loadScript('js/utilities/platform.js', function() {
          console.log('User environment:', $.platform().description);

          if (_app.currentPage.id) {
            console.log('User location:', _app.structure.course.id[0], '>', _app.currentPage.id);
          }
        });
        //save debug mode between sessions
        _app.session.setUserData(['DEBUG', 1]);
      }
      else {
        this.debug = false;
        _app.session.unsetUserData('DEBUG');
        console.log('Debug mode: off');
      }
    }
  }
});
