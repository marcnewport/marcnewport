/**
 * The functionality for a transition page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_reflect_and_review
 * @extends PageType
 */

var mp_reflect_and_review = PageType.extend({



  /**
   * Build markup
   */
  setup : function() {

    this.tabIndex = 0;
    this.statementIndex = 0;
    this.initialized = false;

    var l_tabs = $.makeArray(this.data.tabs.tab),
        l_count = l_tabs.length,
        $tabs = $$('div', 'tab-container').attr({ role:'tablist' }),
        $contents = $$('div', 'tab-content-container');

    //build a tab and content box for each tab item
    for (var i = 0; i < l_count; i++) {
      $tabs.append($$('a', 'tab-'+ l_tabs[i].type, 'tab', { href:'#', 'data-index':i, role:'tab', 'aria-controls': 'tab-content-'+ l_tabs[i].type }).html(l_tabs[i].title));
      $contents.append(this.setupTabContent(l_tabs[i]));
    }

    this.html
      .append($tabs)
      .append($contents);

    this._super();
  },



  /**
   * Build markup for tab contents
   */
  setupTabContent : function(p_tab) {

    var $content = $$('div', 'tab-content-'+ p_tab.type, 'tab-content'),
        $inner = $$('div', '', 'tab-content-inner'),
        l_statements = {},
        l_count = 0,
        l_options = this.data.options.option,
        l_optionCount = l_options.length,
        $options = [],
        $statements = [],
        $statementButton = [];

    $content.attr({ role:'tabpanel', 'aria-labelledby': 'tab-'+ p_tab.type, 'aria-disabled':'true' });

    //each tab will be built slightly different
    switch (p_tab.type) {
      case 'intro':
        $inner.append(p_tab.content);
        $content.append($inner);
        $content.append($$('a', '', 'btn btn-continue', { href:'#', role:'button' }).html('Continue'));
        break;

      case 'reflect':
        $statements = $$('div', '', 'statement-btns', { role:'tablist' });
        l_statements = $.makeArray(p_tab.statement);
        l_count = l_statements.length;

        //build a "page" for each statement
        for (var i = 0; i < l_count; i++) {
          $statementButton = $$('a', '', 'statement-btn').html(i + 1);
          $statementButton.attr({ href:'#', 'data-index':i, role:'tab', 'aria-controls':'statement-'+ i, 'aria-label':'Statement '+ (i + 1) });
          $statements.append($statementButton);

          $options = $$('fieldset', 'activity', 'options');

          //Legend needs to be present for WCAG testers, although it doesnt need to show
          $options.append($$('legend', '', 'hidden').html('Activity'));

          //the radio button options
          for (var j = 0; j < l_optionCount; j++) {
            $options
              .append($$('div', '', 'response option')
                .append($$('label').attr({ 'for':'s-'+ i +'o-'+ j })
                  .append(l_options[j]))
                .append($$('radio', 's-'+ i +'o-'+ j, '', { name:'so-'+ i, 'data-option':j }))
                .append($$('span', '', 'custom-input'))
                );
          }

          //the statement pages
          $inner.append($$('div', 'statement-'+ i, 'statement', { 'data-index':i, 'aria-labelledby':'statement-button-'+ i, 'aria-disabled':'true' })
            .append($$('div', '', 'question').html(l_statements[i].question))
            .append($$('div', '', 'options-container').html($options))
            .append($$('div', '', 'statement-feedback')));
        }

        $content.append($inner);
        $content.append($statements);
        $content.append($$('a', '', 'btn btn-continue', { href:'#', role:'button' }).html('Continue'));
        break;

      case 'review':
        $inner.append($$('label').attr({ 'for':'review' }).html(p_tab.question));
        $inner.append($$('textarea', 'review').attr({ maxlength:4000 }));
        $content.append($inner);
        $content.append($$('a', '', 'btn btn-save', { href:'#', role:'button' }).html('Save to My notes'));
        break;
    }

    return $content;
  },



  /**
   * Add listeners and modifications to page markup
   *
   * user data is stored as array eg. [1, 2, [1, 4, 2]]
   *    0 => the tab the user was on
   *    1 => the statement page the user was on
   *    2 => the selected option indexes
   */
  pageReady : function() {

    var scope = this,
        l_userData = _app.session.getUserData(this.id),
        l_optionData = l_userData ? l_userData[2][2] : false,
        $inner = _app.$content.find('.inner').eq(0),
        $tabs = $inner.find('.tab'),
        l_tabs = $.makeArray(this.data.tabs.tab),
        l_statements = l_tabs[1].statement,
        $textarea = $inner.find('textarea'),
        l_comments = _app.session.getComments(this.id),
        $save = $inner.find('.btn-save');

    //look for saved data and retain state
    if (l_userData) {
      scope.tabIndex = l_userData[2][0];
      scope.statementIndex = l_userData[2][1];
    }

    //re-insert saved comments
    if (l_comments.length) {
      $textarea.val(l_comments[0].carriage());
      $save.html('Notes saved');
    }

    this.showTab(scope.tabIndex);

    //listen for tab button clicks
    $tabs.bind('click', function(e) {
      scope.showTab($(this).data('index'));
      e.preventDefault();
    });

    //listen for statement button clicks
    $inner.find('.statement-btn').bind('click', function(e) {
      scope.showStatement($(this).data('index'));
      e.preventDefault();
    });

    //listen for options selected on each statement page
    $inner.find('.statement').each(function(i) {

      var $statement = $(this),
          $options = $statement.find('.option'),
          $input = [];

      //radio button listener
      $options.find('input').bind('change', function() {
        //update selected item
        $options.find('.input-overlay').removeClass('selected');
        $(this).parent().addClass('selected');
        //show the feedback
        $statement.find('.statement-feedback').html(l_tabs[1].statement[i].feedback);
        scope.updateUserData();
      });

      //select the option saved in session
      if (l_optionData[i] > -1) {
          $input = $statement.find('input').eq(l_optionData[i]);
          //select the radio button if it aint already
          if ($input.length && ! $input.is(':checked')) {
            $input.prop('checked', true).trigger('change');
          }
        }
    });

    //handle a continue btn click
    $inner.find('.btn-continue').bind('click', function(e) {
      //the reflect tab will jump through statements
      if (scope.tabIndex === 1 && scope.statementIndex < l_statements.length - 1) {
        scope.statementIndex++;
        scope.showStatement(scope.statementIndex);
      }
      else {
        //otherwise we'll jump through tabs
        scope.tabIndex++;
        scope.showTab(scope.tabIndex);
      }
      e.preventDefault();
    });

    //disable the save btn by default and listen for a click
    $save.disable().bind('click', function(e) {
      //store the comments in the session
      var l_text = $textarea.val();
      l_comments[0] = l_text.uncarriage();
      _app.session.setComments(scope.id, l_comments);
      //disable the save btn
      $save.html('Notes saved').disable();
      e.preventDefault();
    });

    //listen for keyboard press in textarea
    $textarea.bind('keyup', function() {

      var l_text = $textarea.val();
      //decide if we can enable the save button
      if (l_text.uncarriage() !== l_comments[0]) {
        $save.html('Save to My notes').enable();
      }
      else {
        $save.html('Notes saved').disable();
      }
    });

    this._super();
  },



  /**
   * Shows a tab
   */
  showTab : function(p_index) {

    var scope = this,
        $inner = _app.$content.find('.inner').eq(0),
        $tabs = $inner.find('.tab'),
        $contents = $inner.find('.tab-content'),
        $content = [];

    //update selected tab button
    $tabs.each(function(i) {
      var $this = $(this);

      $this.removeClass('selected').removeAttr('aria-selected');
      if (i === p_index) {
        $this.addClass('selected').attr('aria-selected', 'true');
      }
    });

    //update selected tab content
    $contents.each(function(i) {
      var $this = $(this);

      $this.removeClass('selected').attr('aria-disabled', 'true');
      if (i === p_index) {
        $content = $this.addClass('selected').removeAttr('aria-disabled');
      }
    });

    //the reflect tab - select the statement in session memory
    if (p_index === 1) {
      scope.showStatement(scope.statementIndex);
    }
    else {
      //focus on the content
      if (this.initialized) {
        setTimeout(function() {
          $content.find('p, textarea').eq(0).attr('tabindex', -1).focus();
        }, 200);
      }
      else {
        this.initialized = true;
      }
    }

    this.tabIndex = p_index;
    this.updateUserData();
  },



  /**
   * Shows a statement panel inside the reflect tab
   */
  showStatement : function(p_index) {

    var $inner = _app.$content.find('.inner').eq(0),
        $tab = $inner.find('#tab-content-reflect'),
        $statements = $tab.find('.statement'),
        $statement = [],
        $btns = $tab.find('.statement-btn');

    //update class name on statement wrap div
    $statements.each(function(i) {
      var $this = $(this);

      $this.removeClass('selected').attr('aria-disabled', 'true');
      if (i === p_index) {
        $statement = $this.addClass('selected').removeAttr('aria-disabled');
      }
    });

    //update class name on statement number button
    $btns.each(function(i) {
      var $this = $(this);

      $this.removeClass('selected').removeAttr('aria-selected');
      if (i === p_index) {
        $this.addClass('selected').attr('aria-selected', 'true');
      }
    });

    //focus on the content
    if (this.initialized) {
      setTimeout(function() {
        $statement.findFirstText().attr('tabindex', -1).focus();
      }, 200);
    }
    else {
      this.initialized = true;
    }


    this.statementIndex = p_index;
    this.updateUserData();
  },



  /**
   * Gather all the user input and save it
   */
  updateUserData : function() {
    //set tab and statement indices
    var l_userData = [this.tabIndex, this.statementIndex],
        l_statements = [],
        $statements = _app.$content.find('.statement'),
        $checked = [],
        l_checked = -1;

    //get the index of the radio btn selected
    $statements.each(function() {
      $checked = $(this).find('input:checked');
      l_checked = -1;

      if ($checked.length) l_checked = $checked.data('option');
      l_statements.push(l_checked);
    });

    l_userData.push(l_statements);
    this.updatePageData([-1, l_userData]);
  },



  /**
   * Size elements on screen
   */
  resizePage : function() {

    var $inner = _app.$content.find('.inner').eq(0),
        $title = $inner.find('.page-title'),
        $tabs = $inner.find('#tab-container'),
        $contents = $inner.find('#tab-content-container');

    $contents.height($inner.height() - $title.height() - $tabs.height());
  }

});
