/**
 * The functionality for a decision tree page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns
 * @class mp_decision_tree
 * @extends PageType
 */
var mp_decision_tree = PageType.extend({


  setup : function() {

    this._super();
    this.linkClicked = '';
    this.decisionPoint = '';

    this.html
      .append($$('div', 'activity'))
      .append($$('div', 'decision-navigation')
        .append($$('a').attr({ 'class':'btn-restart', title:'Start from the first decision point' }).html('Restart'))
        .append($$('a').attr({ 'class':'btn-previous', title:'Go back to the last decision point' }).html('Previous'))
        .append($$('a').attr({ 'class':'btn-more', title:'View the resource' }).html('More')));

  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    var l_decisionPoints = $.makeArray(_app.currentPage.data.decision_points.item),
        l_lastId = '',
        l_lastData = {};

    this.userData = _app.session.getUserData(this.id)[2] || [];

    //check if user has been to this page
    if (this.userData.length) {
      //find their bookmark
      l_lastId = this.userData[this.userData.length - 1];
      l_lastData = this.getDecisionPointData(l_lastId);
      this.showDecisionPoint(l_lastData);
    }
    else {
      //otherwise just go to the first
      this.showDecisionPoint(l_decisionPoints[0]);
    }

    this._super();
  },



  /**
   * Builds the html and interactivity of a decision point
   */
  showDecisionPoint : function(p_data) {

    var scope = this,
        $image = $$('div', 'background-image'),
        l_hotspots = $.makeArray(p_data.hotspots.item),
        l_count = l_hotspots.length,
        l_hotspot = {},
        $hotspot = [],
        l_image = new Image();

    this.decisionPoint = p_data.id;
    this.linkClicked = '';

    this.hideDecisionButtons();

    //build bg image
    $image.append($$('img').attr({
      src: 'files/'+ p_data.background_image.item.content,
      alt: '',
      width: p_data.background_image.item.width,
      height: p_data.background_image.item.height
    }));

    //we wanna fade this in
    $image.hide();

    //build hotspot points
    for (var i = 0; i < l_count; i++) {
      $hotspot = $$('a', l_hotspots[i].id, 'hotspot', { href:'', title:l_hotspots[i].title })
        .css({ top:l_hotspots[i].top +'px', left:l_hotspots[i].left +'px' })
        .html($$('span', '', 'icon icon-compass'));
      //add to image
      $image.append($hotspot);
    }

    //wait for the image to load before we show it
    l_image.src = 'files/'+ p_data.background_image.item.content;
    l_image.onload = function() {
      _app.$content.find('#activity').html($image);
      $image.fadeIn(600);
      scope.showIntroText(p_data);
    };

    //click handler for hotspot
    $image.find('.hotspot').click(function(p_event) {

      //find the hotspot data
      for (var i = 0; i < l_count; i++) {
        if (this.id == l_hotspots[i].id) {
          l_hotspot = l_hotspots[i];
          break;
        }
      }

      //show some kind of transition
      if (_app.$feedback.hasClass('closed')) {
        //if the panel is closed, slide it open
        _app.$feedback.trigger('hide');
        scope.showFeedback(l_hotspot);
        _app.$feedback.find('.tab').trigger('click');
      }
      else {
        //if it's open, fade it out, stick in the content, then fade it back in
        _app.$feedback.fadeOut(600, function() {
          _app.$feedback.trigger('hide');
          scope.showFeedback(l_hotspot);
        });
      }

      $(this).addClass('selected');

      p_event.preventDefault();
    });

    //add this decision point to the userdata
    if (p_data.id != this.userData[this.userData.length - 1]) {
      this.userData.push(p_data.id);
      _app.session.setUserData([this.id, -1, this.userData]);
    }
  },



  /**
   * Shows a panel of text and buttons when user lands on a new decision point
   */
  showIntroText : function(p_data) {

    var scope = this,
        $feedbackText = _app.$feedback.find('#feedback-txt');

    //check if theres any text to show
    if (p_data.introduction_text) {
      //remove all listeners from previous feedback
      _app.$feedback.find('.feedback-button').unbind('click');
      //insert the text
      $feedbackText.html('<h4>'+ p_data.title +'</h4>'+ p_data.introduction_text);

      //check if user is part way through the tree
      if (this.userData.length > 1) {
        _app.$feedback.find('.btn-feedback-restart').show().click(scope.restartDecision);
        _app.$feedback.find('.btn-feedback-previous').show().click(scope.previousDecision);
      }

      //check if there is a resource
      if (p_data.resource) {
        var l_param = { resource:p_data.resource };
        _app.$feedback.find('.btn-feedback-more').show().click(l_param, scope.showResource);
      }

      //check if we're at an end point
      if ($.makeArray(p_data.hotspots.item).length < 1) {
        this.decisionsComplete();
      }

      _app.$feedback.find('.btn-feedback-hide').show().click(function(e) {
        _app.$feedback.trigger('minimise');
        e.preventDefault();
      });

      //display feedback if there's text
      _app.$feedback.fadeIn();
    }
    else {
      this.showDecisionButtons(p_data);
    }
  },



  /**
   * Adds navigation button to page when there is no intro or feedback text
   */
  showDecisionButtons : function(p_data) {

    var scope = this,
        $navigation = $('#decision-navigation');

    $navigation.find('.btn-restart').show().click(scope.restartDecision);
    $navigation.find('.btn-previous').show().click(scope.previousDecision);

    //check if there is a resource
    if (p_data.resource) {
      var l_param = { resource:p_data.resource };
      $navigation.find('.btn-more').show().click(l_param, scope.showResource);
    }

    //check if we're at an end point
    if ($.makeArray(p_data.hotspots.item).length < 1) {
      this.decisionsComplete();
    }
  },



  /**
   * Hides in-page navigation
   */
  hideDecisionButtons : function() {
    $('#decision-navigation').find('a').unbind('click').hide();
  },



  /**
   * Shows a feedback type panel when a user clicks on a hot spot
   */
  showFeedback : function(p_hotspot) {

    var scope = this;

    //remove all listeners from previous feedback
    _app.$feedback.find('.feedback-button').unbind('click');

    //is there feedback?
    if (p_hotspot.feedback) {
      //show disabled hot spot buttons
      $('#background-image').addClass('disabled');

      //insert the text
      _app.$feedback.find('#feedback-txt').html('<h4>'+ p_hotspot.title +'</h4>'+ p_hotspot.feedback);

      //show restart and undo buttons
      _app.$feedback.find('.btn-feedback-restart').show().click(scope.restartDecision);
      _app.$feedback.find('.btn-feedback-undo').show().click(scope.undoDecision);

      //is there a resource?
      if (p_hotspot.resource) {
        var l_param = { resource:p_hotspot.resource };
        _app.$feedback.find('.btn-feedback-more').show().click(l_param, scope.showResource);
      }

      //where does this hotspot want to take us?
      if (p_hotspot.link) {
        this.linkClicked = p_hotspot.link;
        //show th econtinue button and go to next decision point
        _app.$feedback.find('.btn-feedback-continue').show().click(scope.continueDecision);
      }
      else {
        //we're at an end point
        this.decisionsComplete();
      }

      _app.$feedback.find('#feedback-content').removeAttr('style');

      //display feedback
      _app.$feedback.fadeIn(function() {
        _app.$feedback.findFirstText().attr({ tabindex:'-1' }).focus();
      });
      _app.$blocker.fadeIn();
    }
    else if (p_hotspot.link) {
      this.linkClicked = p_hotspot.link;
      var l_fakeEvent = { preventDefault:function(){} }
      scope.continueDecision(l_fakeEvent);
    }
  },



  /**
   * Finds the data for the decision point with the same id as passed in parameter
   */
  getDecisionPointData : function(p_id) {

    var l_decisionPoints = $.makeArray(_app.currentPage.data.decision_points.item),
        l_count = l_decisionPoints.length;

    for (var i = 0; i < l_count; i++) {
      if (p_id == l_decisionPoints[i].id) {
        return l_decisionPoints[i];
      }
    }

    return false;
  },



  /**
   * Empties user data and refreshes the page type
   */
  restartDecision : function(p_event) {
    //empty user data
    _app.session.setUserData([_app.currentPage.id]);
    _app.sequence.goTo(_app.currentPage.id);
    p_event.preventDefault();
  },



  /**
   * Go back to the last decision point
   */
  previousDecision : function(p_event) {

    var l_previous = '',
        l_decisionPoint = {};

    //pop this decision point off the end
    _app.currentPage.userData.pop();
    l_previous = _app.currentPage.userData[_app.currentPage.userData.length - 1];
    l_decisionPoint = _app.currentPage.getDecisionPointData(l_previous);

    _app.$feedback.trigger('hide');
    //fadeout image then go to the previous decision point
    _app.$content.find('#background-image').fadeOut(600, function() {
      _app.currentPage.showDecisionPoint(l_decisionPoint);
    });
    p_event.preventDefault();
  },



  /**
   * Go to the next decision point
   */
  undoDecision : function(p_event) {

    var l_decisionPoint = _app.currentPage.getDecisionPointData(_app.currentPage.decisionPoint),
        $image = _app.$content.find('#background-image');

    _app.$feedback.trigger('hide');
    $image.removeClass('disabled');
    $image.find('.selected').removeClass('selected');

    //fadeout image then show next decision point
    _app.currentPage.showIntroText(l_decisionPoint);
    p_event.preventDefault();

  },



  /**
   * Go to the next decision point
   */
  continueDecision : function(p_event) {

    var l_decisionPoint = _app.currentPage.getDecisionPointData(_app.currentPage.linkClicked);

    _app.$feedback.trigger('hide');
    //fadeout image then show next decision point
    _app.$content.find('#background-image').fadeOut(600, function() {
      _app.currentPage.showDecisionPoint(l_decisionPoint);
    });
    p_event.preventDefault();

  },



  /**
   * Shows the resource
   */
  showResource : function(p_event) {
    //open resource in new window
    window.open('files/'+ p_event.data.resource.item.content, '_blank');
    p_event.preventDefault();
  },



  /**
   * Complete handler
   */
  decisionsComplete : function() {

    //enable next and record data
    $('#btn-page-navigation-next').enable();

    //go to the next page
    _app.$feedback.find('.interactivity-dt .btn-feedback-next').show().click(function(p_event) {
      _app.sequence.next();
      p_event.preventDefault();
    });

    this.updatePageData([-1, this.userData, 1]);

  }

});
