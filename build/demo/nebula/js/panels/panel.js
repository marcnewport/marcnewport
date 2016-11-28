/**
 * The base class for a panel
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class Panel
 */
var Panel = Class.extend({



  /**
   * Constructor method
   */
  init : function() {

    this.opened = false;
    this.enabled = false;
    this.active = '';
    this.$panels = $('#panels');
    this.$panel = this.$panels.find('#panel-'+ this.id);
    this.$button = $('#btn-'+ this.id);
    this.disable();
    this.speed = 200;

    var scope = this;

    //panel button click listener
    this.$button.click(function(p_event) {
      //decide wether to open or close
      if (scope.enabled) {
        if (scope.opened) {
          switch (_app.navigation) {
            case 'hamburger':
              //do nothing
              break;
            default:
              scope.close();
              break;
          }
        }
        else {
          scope.open();
        }
      }
      p_event.preventDefault();
    });

    //panel button hover listener
    this.$button.hover(function() {
      if (scope.enabled) $(this).addClass('hover');
    },
    function() {
      if (scope.enabled) $(this).removeClass('hover');
    });
  },



  /**
   * Enables the panel
   */
  enable : function() {

    this.$button.removeClass('disabled');
    this.$panel.removeClass('disabled');

    this.enabled = true;
  },



  /**
   * Disables the panel
   */
  disable : function() {

    this.$button.addClass('disabled');
    this.$panel.addClass('disabled');

    this.enabled = false;
  },



  /**
   * Slides open the panel
   */
  open : function() {

    var scope = this,
        slideOpen = function() {},
        l_activePanel = '',
        l_animation = { height:'toggle' };


    /**
     * Animate the panel open
     */
    slideOpen = function() {

      //remove tabindex from page content
      _app.$page.disableFocus();

      scope.$panels.css('display', 'block');
      scope.$panel.addClass('animating');

      //remove the closed class on button
      scope.$button
        .removeClass('btn-closed')
        .addClass('btn-open')
        .attr('title', scope.$button.attr('title').replace('Show', 'Hide'));

      switch (_app.navigation) {
        case 'left':
          //animate the button with the panel
          scope.$button.animate({ left: _app.$page.width() - 120 }, scope.speed);
          //change the animation type
          l_animation = { width:'toggle' };
          break;

        case 'hamburger':
          // l_animation = { opacity:'toggle' };
          // l_animation = {};
          scope.speed = 0;
          break;
      }

      //block page bg
      _app.$blocker.addClass('panel').fadeIn();

      //animate that panel
      scope.$panel.animate(l_animation, scope.speed, function() {

        var $selected = scope.$panel.find('.tab.selected');

        scope.opened = true;
        _app.panels.active = scope.id;

        scope.$panel.addClass('opened').removeAttr('style');
        scope.$panel.removeClass('closed animating');

        //give focus to this panel
        if (scope.id == 'menu') {
          //give focus to the page item or just the topic if its collapsed
          var $current = $('#'+ _app.currentPage.id),
              $topic = $current.parents('.topic');

          if ($topic.hasClass('open')) {
            $current.focus();
          }
          else {
            $topic.find('.btn-topic').focus();
          }
        }
        else if ($selected.length) {
          //focus on previously selected tab
          $selected.focus();
        }
        else {
          //just find the first focusable element
          scope.$panel.findFirstFocusable().focus();
        }
      });
    };

    //check for active panel
    if (empty(_app.panels.active)) {
      slideOpen();
    }
    else {
      //need to use underscore for objects property
      l_activePanel = _app.panels.active.replace(/-/g, '_');
      _app.panels[l_activePanel].close(slideOpen);
    }

    //pause all media
    _app.pausePlayers();
  },



  /**
   * Shows the current panel
   */
  show : function() {
    //hide all panels
    this.$panels.find('.panel').hide();
    //show this one
    this.$panel.show();
  },



  /**
   * Slides closed the panel
   */
  close : function(p_callback) {

    var scope = this,
        l_animation = { height:'toggle' };

    this.$panel.addClass('animating');

    //update button classes
    scope.$button
      .removeClass('btn-open')
      .addClass('btn-closed')
      .attr('title', scope.$button.attr('title').replace('Hide', 'Show'));

    switch (_app.navigation) {
      case 'left':
        //animate button with panel
        scope.$button.animate({ left: 0 }, scope.speed);
        //change the animation type
        l_animation = { width:'toggle' };
        break;

      case 'hamburger':
        // l_animation = { opacity:'toggle' };
        // l_animation = {};
        scope.speed = 0;
        break;
    }

    //unblock page
    _app.$blocker.removeClass('panel').fadeOut();

    //animate panel
    this.$panel.animate(l_animation, scope.speed, function() {

      scope.$panels.hide((scope.speed / 4), function() {

        scope.$panel
          .removeClass('opened animating')
          .addClass('closed')
          .removeAttr('style');

        //reset props
        scope.opened = false;
        _app.panels.active = '';

        //run the callback function
        if (p_callback) p_callback();
      });
    });

    //pause all media
    _app.pausePlayers();

    //give tabindex back to page content
    _app.$page.enableFocus();
  },



  /**
   * closes the panel without animation
   */
  hide : function(p_callback) {

    var $btnImage;

    this.$panel.css('display', 'none');
    this.$panels.css('display', 'none');

    this.$button
      .removeClass('btn-open')
      .addClass('btn-closed');

    //update the button text
    $btnImage = scope.$button.find('img');
    $btnImage.attr('title', $btnImage.attr('title').replace('Hide', 'Show'));

    this.$panel
      .removeClass('opened')
      .addClass('closed')
      .removeAttr('style');

    //reset props
    this.opened = false;
    _app.panels.active = '';

    //give tabindex back to page content
    _app.$page.enableFocus();

    //pause all media
    _app.pausePlayers();

    //holla at callback function if available
    if (p_callback != undefined) {
      p_callback();
    }
  },



  /**
   * Add markup to panel
   */
  setup : function(p_data) {

  }

});
