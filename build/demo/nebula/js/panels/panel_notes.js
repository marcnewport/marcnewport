/**
 * Functionality for the notes panel
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class PanelNotes
 * @extends Panel
 */
var PanelNotes = Panel.extend({



  /**
   * The constructor method
   */
  init : function() {
    this.id = 'notes';
    this._super();
  },



  /**
   * The panel has been requested to open
   */
  open : function() {

    // this.setup();
    this._super();
  },



  /**
   * Build the HTML for this panel
   */
  setup : function() {

    this.data = _app.structure.course.panels.my_notes;

    var scope = this;
    var $tabs = this.$panel.find('.panel-tabs');
    var $firstTab = [];

    $.each(this.data.tabs.tab, function(i, tab) {
      if (Number(tab.display)) {
        var $tab = $$('a').html(tab.label).attr({
          href: '#',
          id: tab.id +'-notes',
          class: 'tab'
        });

        if (! $firstTab.length) {
          $firstTab = $tab;
        }

        $tabs.append($tab);
      }
    });

    // handle tab clicks
    $tabs.on('click', '.tab', function(e) {
      switch (e.target.id) {
        case 'my-notes':
          scope.showMyNotes();
          break;

        case 'action-notes':
          scope.showActionNotes();
          break;

        case 'other-notes':
          scope.showOtherNotes();
          break;
      }

      e.preventDefault();
    });

    //add print button
    if ($('#btn-print').length <= 0) {
      this.$panel
        .append($$('a', 'btn-print', 'button', { href: '#' })
          .html('Print')
          .click(this.printNotes));
    }

    //show first tab by default
    if ($firstTab.length) {
      $firstTab.trigger('click');
    }
    else {
      this.showMyNotes();
    }

    this._super();
  },



  /**
   * Shows the users notes entered into free text fields
   */
  showMyNotes : function() {

    var l_role = _app.session.getUserData('role')[1] || 'all',
        l_pages = _app.structure.course.settings.page_list[l_role].replace(/\s/g, '').split(','),
        l_pageCount = l_pages.length,
        l_pageId = '',
        l_pageType = '',
        l_comments = [],
        l_notes = _app.session.get('comments') || [],
        l_count = l_notes.length,
        l_foundNotes = false,
        l_topic = '',
        l_nextTopic = '',
        l_pageData = {},
        $html = $$('div', '', 'inner'),
        $section = [],
        l_questions = [],
        l_questionCount = 0,
        l_message = '';

    //select tab
    $('#panel-notes').find('.tab').each(function() {
      var $this = $(this);
      $this.removeClass('selected');

      if ($this.attr('id') == 'my-notes') {
        $this.addClass('selected');
      }
    });

    //do we have comments?
    if (l_count) {
      //loop through pages and determine if theyre free texts
      for (var i = 0; i < l_pageCount; i++) {
        l_pageId = l_pages[i];
        l_pageType = _app.structure.type(l_pages[i]);

        //we only care for free text and audio story pages
        if (['mp_free_text', 'mp_audio_stories', 'mp_reflect_and_review'].indexOf(l_pageType) >= 0) {
          l_comments = _app.session.getComments(l_pageId);

          //were there comments for this page?
          if (l_comments.length) {
            //insert topic title
            l_nextTopic = _app.structure.parent(l_pageId).title;

            if (l_nextTopic !== l_topic) {
              $html.append($$('h2').html(l_nextTopic));
              l_topic = l_nextTopic;
            }

            //get page data so we can put in question content
            if (l_pageId === _app.currentPage.id) {
              l_pageData = _app.currentPage.data;
            }
            else {
              l_pageData =  _app.sequence.getData(l_pageId);
            }

            $section = $$('div', 'note-'+ l_pageId, 'note-section');
            l_questions = l_pageData.questions ? $.makeArray(l_pageData.questions.question) : $.makeArray(l_pageData.question);
            l_questionCount = l_questions.length;

            //add page title and scenario text
            $section
              .append($$('h5').html(l_pageData.title))
              .append($$('div', '', 'scenario').html(l_pageData.scenario));

            //loop through questions / responses
            for (var j = 0; j < l_questionCount; j++) {
              //add question and response text
              $section
                .append($$('div', '', 'question').html(l_questions[j].text[0]))
                .append($$('div', '', 'response').html(l_comments[j] || 'No comment.'));
            }

            //reflect and review is different...
            if (l_pageType === 'mp_reflect_and_review') {
              var tabs = $.makeArray(l_pageData.tabs.tab),
                  tabCount = tabs.length;
              //look for question text
              for (var k = 0; k < tabCount; k++) {
                if (tabs[k].question) {
                  $section
                    .append($$('div', '', 'question').html(tabs[k].question))
                    .append($$('div', '', 'response').html(l_comments[0] || 'No comment.'));
                }
              }
            }

            $html.append($section);
          }
        }
      }
    }

    $html.prepend(this.data.tabs.tab[0].description);
    $('#panel-notes').find('.panel-content').html($html);
  },



  /**
   *
   */
  showActionNotes : function() {

    var $label = $$('label').attr('for', 'action-notes-field'),
        $textarea = $$('textarea', 'action-notes-field', 'notes-field', { name:'action-notes-field' }),
        l_comments = _app.session.getComments('actions'),
        l_comment = l_comments[0] || 'Enter text here',
        l_limit = 4000;

    // Check if there is custom text
    if (_app.structure.course.action_notes_text) {
      l_message = _app.structure.course.action_notes_text;
    }

    //select tab
    $('#panel-notes').find('.tab').each(function() {
      var $this = $(this);
      $this.removeClass('selected');

      if ($this.attr('id') == 'action-notes') {
        $this.addClass('selected');
      }
    });

    //add textarea
    $('#panel-notes').find('.panel-content')
      .html($$('div', '', 'inner')
        .append($label.html(this.data.tabs.tab[1].description))
        .append($textarea.val(l_comment.carriage())));

    //limit the text input
    $textarea.bind('keyup', function() {
      var $this = $(this),
          l_text = $this.val();

      if (l_text.length > l_limit) {
        $this.val(l_text.substr(0, l_limit));
      }
    })
    .bind('focus', function() {
      if ($textarea.val() === 'Enter text here') {
        $textarea.val('');
      }
    })
    .bind('blur', function() {
      //gather notes when learner leaves textarea
      var l_input = $textarea.val();

      if (l_input === '') {
        $textarea.val('Enter text here');
      }

      if (l_input.length > l_limit) {
        l_input = l_input.substr(0, l_limit);
      }

      //normalise line endings and save
      _app.session.setComments('actions', l_input.uncarriage());
    });

  },



  /**
   *
   */
  showOtherNotes : function() {

    var $label = $$('label').attr('for', 'other-notes-field'),
        $textarea = $$('textarea', 'other-notes-field', 'notes-field', { name:'other-notes-field' }),
        l_comments = _app.session.getComments('other'),
        l_comment = l_comments[0] || 'Enter text here',
        l_limit = 4000;

    //select tab
    $('#panel-notes').find('.tab').each(function() {
      var $this = $(this);
      $this.removeClass('selected');

      if ($this.attr('id') == 'other-notes') {
        $this.addClass('selected');
      }
    });

    //add textarea
    $('#panel-notes').find('.panel-content')
      .html($$('div', '', 'inner')
        .append($label.html(this.data.tabs.tab[2].description))
        .append($textarea.val(l_comment.carriage())));

    //limit the text input
    $textarea.bind('keyup', function() {
      var $this = $(this),
          l_text = $this.val();

      if (l_text.length > l_limit) {
        $this.val(l_text.substr(0, l_limit));
      }
    })
    .bind('focus', function() {
      if ($textarea.val() == 'Enter text here') {
        $textarea.val('');
      }
    })
    .bind('blur', function() {
      //gather notes when learner leaves textarea
      var l_input = $textarea.val();

      if (l_input === '') {
        $textarea.val('Enter text here');
      }

      if (l_input.length > l_limit) {
        l_input = l_input.substr(0, l_limit);
      }

      //normalise line endings and save
      _app.session.setComments('other', l_input.uncarriage());
    });
  },



  /**
   *
   */
  printNotes : function(p_event) {

    var l_window = {},
        l_notes = _app.session.get('comments') || [],
        l_count = l_notes.length,
        l_topic = '',
        l_pageData = {},
        l_actionNotes = 'There are no notes entered for this section',
        l_otherNotes = 'There are no notes entered for this section',
        $html = $$('div', 'printable-notes');

    //loop through comments
    for (var i = 0; i < l_count; i++) {

      switch (l_notes[i][0]) {
        case 'actions':
          l_actionNotes = l_notes[i][1];
          break;

        case 'other':
          l_otherNotes = l_notes[i][1];
          break;

        default:
          //add topic info
          if (l_topic != _app.structure.parent(l_notes[i][0]).title) {
            l_topic = _app.structure.parent(l_notes[i][0]).title;
            $html.append($$('h1').html(l_topic));
          }

          //add page specific info
          if (l_notes[i][0] == _app.currentPage.id) {
            l_pageData = _app.currentPage.data;
          }
          else {
            l_pageData =  _app.sequence.getData(l_notes[i][0]);
          }

          var $noteSection = $$('div', 'note-'+ l_notes[i][0], 'note-section'),
              l_questions = l_pageData.questions ? $.makeArray(l_pageData.questions.question) : $.makeArray(l_pageData.question),
              l_questionCount = l_questions.length,
              l_noteText = '';

          $noteSection
              .append($$('h3').html(l_pageData.title))
              .append($$('div', '', 'scenario').html(l_pageData.scenario));

          //loop through questions / responses
          for (var j = 0; j < l_questionCount; j++) {
            l_noteText = l_notes[i][1][j];
            l_noteText = '<em>'+ l_noteText +'</em>';

            $noteSection
                .append($$('div', '', 'question').html(l_questions[j].text[0]))
                .append('<div style="font-style:italic;padding-left:20px;border-left: 3px solid #d2d2d2;margin:15px 0;">'+ l_noteText +'</div>');
          }

          //reflect and review is different...
          if (l_pageData.type === 'mp_reflect_and_review') {
            var tabs = $.makeArray(l_pageData.tabs.tab),
                tabCount = tabs.length;
            //look for question text
            for (var k = 0; k < tabCount; k++) {
              if (tabs[k].question) {
                l_noteText = l_notes[i][1];
                l_noteText = '<em>'+ l_noteText +'</em>';

                $noteSection
                  .append($$('div', '', 'question').html(tabs[k].question))
                  .append('<div style="font-style:italic;padding-left:20px;border-left: 3px solid #d2d2d2;margin:15px 0;">'+ l_noteText +'</div>');
              }
            }
          }

          $html.append($noteSection);
          break;
        }
    }


    if (l_count < 1) {
      $html.append('<h1>My notes</h1><div style="font-style:italic;padding-left:20px;border-left: 3px solid #d2d2d2;margin:15px 0;">There are no notes entered for this section</div>');
    }

    //now add actions / other notes
    $html
      .append('<h1>Actions</h1><div style="font-style:italic;padding-left:20px;border-left: 3px solid #d2d2d2;margin:15px 0;">'+ l_actionNotes +'</div>')
      .append('<h1>Other notes</h1><div style="font-style:italic;padding-left:20px;border-left: 3px solid #d2d2d2;margin:15px 0;">'+ l_otherNotes +'</div>');

    // Add style
    $html.wrapInner($$('div', 'printable').css('font-family', 'Arial, Sans-serif'));

    //open new window
    l_window = window.open('/notes.html');
    l_window.document.write($html.html());
    l_window.focus();

    //needed for IEs
    l_window.location.reload();
    l_window.print();
    l_window.close();

    p_event.preventDefault();
  }
});
