/**
 * Functionality for the case study panel
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class PanelCaseStudy
 * @extends Panel
 *
 */
var PanelCaseStudy = Panel.extend({


  init : function() {
    this.id = 'case-study';
    this.tab = 0;
    this._super();
  },



  /**
   * Gathers html for the panel
   */
  setup : function(p_data) {

    this.data = _app.sequence.getData(p_data.id);
    this.structure = _app.structure.find(this.data.id);
    this.userData = {};
    this.currentContentId = '';

    //check if data exists (might be a preview)
    if (empty(this.data)) return;

    var $panel = this.$panel,
        $tabs = $panel.find('.panel-tabs'),
        $panelContent = $panel.find('.panel-content'),
        $contentPanel = [],
        $buttons = [],
        $tabContent = [],
        l_data = this.structure,
        l_tabChildren = (l_data.children) ? $.makeArray(l_data.children.item) : {},
        l_tabCount = l_tabChildren.length,
        l_tabData = {},
        l_buttonEnabled = false,
        l_buttonUserData = false,
        l_buttons = {},
        l_buttonCount = 0,
        l_buttonWidth = 0,
        l_buttonClass = '',
        l_buttonMargin = 30,
        l_tabClass = 'tab selected',
        l_contentClass = 'tab-content',
        l_firstContent = {},
        l_firstContentData = {},
        l_userData = _app.session.getUserData(this.data.id);


    // * this is used to stop it breaking when the old CS structure is present
    // ** can be removed once nodes/content has been restructured
    if (! l_data.children) return;

    // set default object if no user data exists
    if (!l_userData) l_userData = [this.data.id,{}];

    // loop through tabs
    for (var i = 0; i < l_tabCount; i++) {
      l_tabData = l_tabChildren[i];
      // create session data object if none exists
      if (!l_userData[1][l_tabData.id]) l_userData[1][l_tabData.id] = {};

      // change our tab classes after the first one
      if (i !== 0){
        l_tabClass = 'tab';
        l_contentClass = 'tab-content hidden';
      }

      // create a sub panel for each tab
      $contentPanel = $$('div', 'tab-content-'+ l_tabData.id, l_contentClass);
      l_buttons = $.makeArray(l_tabData.children.item);
      l_buttonCount = l_buttons.length;
      $buttons = [];
      $tabContent = $$('div', '','tab-sub-content');
      l_buttonWidth = 0;

      // each sub panal has buttons, only add if there is more than one
      if (l_buttonCount > 1) {
        $contentPanel.addClass('has-buttons');
        $buttons = $$('div', '', 'tab-buttons');

        for (var b = 0; b < l_buttonCount; b++) {
          l_buttonEnabled = 1;
          l_buttonUserData = l_userData[1][l_tabData.id][l_buttons[b].id];
          // check for session data
          if (l_buttonUserData) {
            // read the session data to determine if button is enabled/disabled
            l_buttonEnabled = Number(l_buttonUserData);
          }
          else{
            // first buttons are always enabled so don't bother checking
            if (b !== 0) {
              l_buttonEnabled = Number(l_buttons[b].enabled);
            }
            // set session data for button as enabled/disabled
            l_userData[1][l_tabData.id][l_buttons[b].id] = Number(l_buttonEnabled);
          }
          // set our classes
          l_buttonClass = Boolean(l_buttonEnabled) ? 'button' : 'button disabled';
          if (i === 0 && b === 0) l_buttonClass += ' selected';

          $buttons.append($$('a', 'button-'+ l_buttons[b].children.item.id, l_buttonClass, { href:'#' }).html(l_buttons[b].title));
        }
      }
      else {
        // set session data for button as enabled
        l_userData[1][l_tabData.id][l_buttons[0].id] = 1;
      }

      //add the tabs along the top
      $tabs.append($$('a', 'tab-'+ l_tabData.id, l_tabClass, { href:'#' }).html(l_tabData.title));

      // insert the content
      $panel.find('.panel-content')
        .append($contentPanel
          .append($buttons)
          .append($tabContent));

      // set widths if buttons exist
      if (l_buttonCount > 1){
        l_buttonWidth = $contentPanel.find('.tab-buttons').actual('width') + 10;
        $contentPanel.find('.tab-buttons').css({
          width: (l_buttonWidth > 150) ? 150 : l_buttonWidth + 'px'
        });

        $contentPanel.find('.tab-sub-content').css({
          width: $panelContent.actual('width') - l_buttonWidth - l_buttonMargin + 'px',
          float: 'right'
        });
      }

      // only create the content for the first button in the first tab
      if (i === 0){
        this.tab = l_tabData.id;
        l_firstContent = l_buttons[0].children.item;
        l_firstContentData = _app.sequence.getData(l_firstContent.id);
        // insert a new screen into case study content
        this.newContent(l_firstContentData);
        // update user data with currently showing for the CS and also for the individual tab
        // eg CS is showing... & tab(X) is showing ...
        l_userData[1].showing = l_userData[1][this.tab].showing = l_firstContent.id;
      }
    }

    // set our userData property
    this.userData = l_userData;
    _app.session.setUserData(l_userData);

    this._super();

    this.ready();
  },



  /**
   * Called after markup is inserted to add interaction
   */
  ready : function () {

    var scope = this,
        $panel = this.$panel,
        $tabs = $panel.find('.panel-tabs'),
        l_tabId = '',
        $tabContent = $panel.find('.tab-content'),
        $buttons = $panel.find('.tab-buttons'),
        $showTab = [],
        $showTabContent = [],
        l_id = '',
        l_button = {},
        l_data = {};

    //click handler for panel tabs
    $tabs.click(function(p_event) {
      var $target = $(p_event.target);

      if ($target.hasClass('tab')) {
        //find id
        l_tabId = $target.attr('id').split('-').pop();
        $showTab = $panel.find('#tab-content-'+ l_tabId);
        $showTabContent = $showTab.find('.tab-sub-content');

        $panel.find('.button').removeClass('active');

        //show selected tab
        $tabs.find('.tab').removeClass('selected');
        $target.addClass('selected');

        //show selected tabs content
        $tabContent.addClass('hidden');
        $showTab.removeClass('hidden');

        scope.tab = l_tabId;

        // check if there is any content in the panel
        if($showTabContent.html() === ''){
          l_button = $.makeArray(_app.structure.find(l_tabId).children.item)[0];
          if(Boolean(scope.userData[1][l_tabId][l_button.id])){
            // find the first button's content for this tab
            l_id = l_button.children.item.id;
            l_data = _app.sequence.getData(l_id);
            $showTab.find('#button-' + l_id).addClass('selected');
            // insert a new screen into case study content
            scope.newContent(l_data);
            // update user data with which button the tab is showing
            scope.userData[1][scope.tab].showing = l_id;
          }
        }
        // update user data with current content
        scope.userData[1].showing = scope.userData[1][scope.tab].showing;

        // resize our page in case width has changed since it was loaded - only applies in fluid layout
        if (_app.dimensions.layout == 'fluid'){
          scope['caseStudyChild_'+scope.userData.showing].resizePage();
        }

        p_event.preventDefault();
      }
    });

    //click handler for buttons
    $buttons.click(function(p_event) {
      var $target = $(p_event.target),
          l_classes = $target[0].className;

      // check for button calss & not disabled or selected
      if (l_classes.indexOf('button') >= 0 &&
              l_classes.indexOf('disabled') < 0 &&
              l_classes.indexOf('selected') < 0) {
        //find id
        l_id = $target.attr('id').split('button-')[1];
        l_data = _app.sequence.getData(l_id);
        $buttons.find('.button').removeClass('selected');
        $target.addClass('selected');
        // insert a new screen into case study content
        scope.newContent(l_data);
        // update user data with which button the tab is showing
        scope.userData[1][scope.tab].showing = l_id;
        // update user data with current content
        scope.userData[1].showing = l_id;
      }
      p_event.preventDefault();
    });

    this._super();

    if (_app.dimensions.layout == 'fluid'){
      $(window).resize(function() {
        // resize the panel using the page type class
        scope['caseStudyChild_'+scope.userData[1].showing].resizePage();
      });
      setTimeout(function() {
        $(window).trigger('resize');
      }, 500);
    }
  },



  /**
   * adds or replaces the media player on panel
   */
  updateMediaPlayer : function(p_id) {

    //setup a new player with a different id
    var l_playerId = 'case-study-'+ $.randomString(6),
        $player = this.$panel.find('#case-study-player'),
        l_tabs = $.makeArray(this.data.tabs.item),
        l_media = l_tabs[p_id].media.item,
        $rightColumn = this.$panel.find('.panel-column-right'),
        $transcript = $rightColumn.find('.transcript');

    //check if there is media to insert
    if (empty(l_media)) return;

    $player.find('.jwplayer-wrap').remove();
    $player.prepend($$('div', l_playerId, 'case-study-player'));

    l_media.width = 372;
    l_media.height = 210;

    //setup the player
    switch (l_media.type) {
      case 'mp_resource_video':
        _app.setupVideoPlayer(l_playerId, l_media);
        break;
    }

    //remove the current transcript
    if ($transcript.length > 0) {
      $transcript.remove();
    }

    if (! empty(l_media.description)) {

      //add the transcript
      $rightColumn
        .append($$('div').html(l_media.description).transcript('down', { width:372, height:130 }, l_playerId));
    }
  },



  /**
   * Panel specific things to do on open
   */
  open : function() {

    this._super();

    var scope = this,
        l_tab = 0,
        l_tabs = $.makeArray(this.structure.children.item),
        l_btn = 0;

    //open the tab that this page is associated with
    if (_app.currentPage.data.enable_cs_tab) {
      if (_app.currentPage.data.enable_cs_tab !== 'all') {
        l_tab = Number(_app.currentPage.data.enable_cs_tab);
      }
    }

    if (l_tabs[l_tab]) {
      this.$panel.find('#tab-'+ l_tabs[l_tab].id).trigger('click');

      //wait a half sec and open the button
      setTimeout(function() {
        if (_app.currentPage.data.enable_cs_button) {
          if (_app.currentPage.data.enable_cs_button !== 'all') {
            l_btn = Number(_app.currentPage.data.enable_cs_button);
          }
        }
        scope.$panel.find('#tab-content-'+ l_tabs[l_tab].id).find('.button').eq(l_btn).trigger('click');
      }, 500);
    }

    if (scope['caseStudyChild_'+scope.userData[1].showing]) {
      scope['caseStudyChild_'+scope.userData[1].showing].resizePage();
    }
  },



  /**
   * Panel specific things to do on close
   */
  close : function(p_callback) {

    _app.removePlayers('case-study');

    this._super(p_callback);
    //remove any popups on screen
    this.$panel.find('#cs-popup').remove();
  },

  /**
   * Inserts a new panel into case study content.
   * Uses the same method as default pages.
   *
   * @param Object p_data The JSON data for the new panel
   * @returns A new panel
   */
  newContent : function (p_data) {
    if (p_data) {
      var scope = this,
          l_data = p_data,
          l_type = l_data.type +'_case_study';
      //load in the case study type script and instantiate it
      $.loadScript('js/page_types/'+ l_type +'.js', function() {
        scope['caseStudyChild_'+ l_data.id] = new window[l_type](l_data);
      });
    }
  },

  /*
   * Enables buttons in the case study panels and updates session data
   * @param p_data  Array Inlcudes which button to enable [tabIndex, buttonIndex]
   */
  enableButton : function (p_data){

    //check if data exists (might be a preview)
    if(empty(this.data)) return;

    var l_data = p_data||[],
        l_tabIndex = l_data[0],
        l_btnIndex = l_data[1],
        l_btnNumber = Number(l_btnIndex),
        $tab = [],
        l_userData = _app.session.getUserData(this.data.id),
        l_structure = this.structure,
        l_tabChildren = (l_structure.children) ? $.makeArray(l_structure.children.item) : [],
        l_tabCount = l_tabChildren.length,
        l_buttonChildren = [],
        l_buttonCount = 0,
        l_tabId = '',
        l_btnId = '';

    //enable everything?
    if (l_tabIndex == 'all'){
      // enable all tabs & buttons
      _app.panels.case_study.$panel.find('.button').removeClass('disabled');
    }
    // enable specific buttons
    else{
      // find our tab element
      $tab = _app.panels.case_study.$panel.find('.tab-content:nth-child(' + (Number(l_tabIndex) + 1) + ')');
      // enable whole tab?
      if (l_btnIndex == 'all'){
      // enable all the buttons in one tab
        $tab.find('.button').removeClass('disabled');
      }
      // enable specific button in tab
      else{
        // loop through & enable all buttons up to and including our index
        for (var i=0;i<=l_btnNumber;i++){
          $tab.find('.button:nth-child(' + (i + 1 )+ ')').removeClass('disabled');
        }
      }
    }

    // now update the user data & set button properties to enabled
    if (l_userData[1]){
      // loop through our object
      for (var t =0;t<l_tabCount;t++) {
        l_tabId = l_tabChildren[t].id;
        l_buttonChildren = $.makeArray(l_tabChildren[t].children.item);
        l_buttonCount = l_buttonChildren.length;
        // match our tabs up
        if (Number(l_tabIndex) == t || l_tabIndex == 'all'){
          //now loop through buttons in each tab
          for (var b =0;b<l_buttonCount;b++) {
            l_btnId = l_buttonChildren[b].id;
            // match up our buttons
            if (l_btnNumber == b || l_btnIndex == 'all'){
              // set our button as enabled
              l_userData[1][l_tabId][l_btnId] = 1;
            }
          }
        }
      }
    }
  }

});
