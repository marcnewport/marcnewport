/**
 * The functionality for a true false page type
 *
 * @author john.phoon@ninelanterns.com.au
 * @copyright Nine Lanterns 2015
 * @version 1.0
 * @class mp_table_activity
 * @extends PageType
 */
var mp_table_activity = PageType.extend({

  /**
   * @todo table construction should use api (not string)
   * @todo eval should not be used here
   */
  setup : function() {

    var rows = $.makeArray(this.data.rows.row),
      table_html = '<tr>',
      scope = this;

    // response structure is setup differently from other activities here
    // cloning the data into normal structure so why feedback has access to why data
    this.data.responses = {item:[]};
    for (var i in rows) {
      this.data.responses.item.push(rows[i]);
    }

    // construct table header
    table_html += '<th style="width:50%; padding-left:4px;">'+this.data.headers.question_column+'</th>';

    if (this.data.headers.answer_column_1) {
      table_html += '<th class="answer">'+this.data.headers.answer_column_1+'</th>';
    }

    if (this.data.headers.answer_column_2) {
      table_html += '<th class="answer">'+this.data.headers.answer_column_2+'</th>';
    }

    if (this.data.headers.answer_column_3) {
      table_html += '<th class="answer">'+this.data.headers.answer_column_3+'</th>';
    }

    table_html += '</tr>';

    // construct html for table rows
    for (var i = 0; i < rows.length; i++) {
      var $why = '';

      if (rows[i].why != undefined) {
        // html for why feedback
        $why = '<a href="#" class="btn-why r-'+i+'" title="Find out why you got this answer wrong.">?</a>';
        scope.whyFeedback = true;
      }

      var rowClass = i % 2 ? 'odd' : 'even';
      table_html += '<tr class="'+rowClass+'">';

      if (rows[i] && rows[i].statement) {
        var answers = $.makeArray(rows[i].answers.answer),
          // determine if row should use radio or checkbox
          inputType = answers.length == 1 ? (this.data.inputtype != undefined ? this.data.inputtype : 'radio') : 'checkbox';

        table_html += '<td id="r-'+i+'" class="row_'+(i+1)+' statement">'+rows[i].statement+$why+'</td>';

        for (var j = 1; j <= 3; j++) {
          // construct html for the columns for input
          if (eval("this.data.headers.answer_column_"+j)) {
            var firstrow = '';
            if (j == 1) {
              firstrow += 'id="row_'+(i+1)+'"';
            }
            table_html += '<td class="answer"><div class="input-overlay '+inputType+'"><input '+firstrow+' class="custom-input" title="'+eval("this.data.headers.answer_column_"+j)+'" type="'+inputType+'" name="row_'+(i+1)+'" value="row_'+(i+1)+'_answer_'+j+'" /></div></td>';
          }
        }
      }
      table_html += '</tr>';
    }

    // append html to page
    this.html
      .append($$('div', '', 'question').html(this.data.question))
      .append($$('div', 'truefalsetable_div')
        .append($$('table', '', 'truefalsetable').attr({cellspacing:0}).html(table_html)))
      .append($$('a', 'btn-submit').attr({ href:'#', role:'button' }).html('Submit'));

    this._super();
  },


  /**
  * Calls methods that have javascript reliant on html elements printed out in setup()
  */
  pageReady : function() {
    var l_userData = _app.session.getUserData(this.id);

    if (l_userData != undefined && l_userData[2] != undefined) {
      for (var i = 0; i < 8; i++) {
        if (l_userData[2][i] != undefined) {

          for (var j = 0; j < 3; j++) {
            if (l_userData[2][i][j] != undefined) {
              $checked = $('[value=row_'+(i+1)+'_answer_'+(l_userData[2][i][j])+']');
              $checked.prop('checked', true);
              $checked.parents('.input-overlay').addClass('selected');
            }
          }
        }
      }
    }

    this._super();
    this.setupActivity();
  },



  resizePage : function() {

    var $inner = _app.$content.find('.inner').eq(0),
        $pageTitle = _app.$content.find('.page-title').eq(0),
        $question = _app.$content.find('.question').eq(0),
        $table = _app.$content.find('#truefalsetable_div').eq(0),
        l_maxHeight = $inner.height() - $pageTitle.height() - 5;

    $question.css({
      height: l_maxHeight
    });
    $table.css({
      height: l_maxHeight - 40
    });
  },

  /*
  * Assesses the activity & logs user data
  */
  submitAnswers : function() {
    var $table = $('.truefalsetable'),
      $subanswers = $table.find('input'),
      rows = $.makeArray(this.data.rows.row),
      answers = {},
      answercomp = {},
      final_round = (this.attempts == this.data.max_attempts - 1)? true : false,
      submitted = {},
      save = [];

    // increase attempt count
    this.attempts++;

    // remove all tick icons if exist
    $(".marking.icon.icon-tick").remove();

    // disable the submit button
    $('#btn-submit').disable();

    // lock the inputs
    $subanswers.attr('disabled', 'true');

    // construct the answer matrix
    for (var i = 1; i <= rows.length; i++) {
      var rowanswers = $.makeArray(rows[i-1].answers.answer);
      for (var j = 1; j <= rowanswers.length; j++) {
        var key = "row_"+i+"_"+rowanswers[j-1];
        answers[key] = "row_"+i;
      }
    }

    // construct the submitted answer matrix
    $.each($subanswers, function(i) {
      var $this = $(this);

      if ($this.prop('checked')) {
        answercomp[$this.val()] = $this.attr('name');
        var tokens = $this.val().split("_");
        if (submitted[tokens[1]] == undefined) {
          submitted[tokens[1]] = [tokens[3]];
        } else {
          submitted[tokens[1]].push(tokens[3]);
        }

      }
    });

    var wrongs = {},
      allcorrect = true;

    // diff the 2 matrix to find false answers that were answered true
    var diff1 = $(Object.keys(answercomp)).not(Object.keys(answers)).get();
    for (var i = 0; i < diff1.length; i++) {
      wrongs[eval("answercomp."+diff1[i])] = 1;
      allcorrect = false;
    }

    // diff the 2 matrix to find true answers that were answered false
    var diff2 = $(Object.keys(answers)).not(Object.keys(answercomp)).get();
    for (var i = 0; i < diff2.length; i++) {
      wrongs[eval("answers."+diff2[i])] = 1;
      allcorrect = false;
    }


    if (allcorrect || final_round) {
      // mark correct answers
      var query = "$table.find('.statement')";
      wrongs = Object.keys(wrongs);

      for (var i = 0; i < wrongs.length; i++) {
        query += ".not('." + wrongs[i] + "')";
      }

      var $correct = eval(query);
      $correct.append($$('span', '', 'marking icon icon-tick'));

      var query = $table.find('.input-overlay');
      var notquery = "$table.find('.input-overlay')";

      answers = Object.keys(answers);

      var $correct = $('input').filter(function() { return answers.indexOf($(this).val()) >=0 });
      $correct.parent().addClass('correct');
    }

    // compact submission data
    for (var i = 1; i <= 8; i++) {
      if (submitted[i] == undefined) {
        save.push([]);
      } else {
        save.push(submitted[i]);
      }
    }

    this.updatePageData([Number(allcorrect), save, this.attempts]);
  },

  /*
   * Reset the activity
   */
  resetActivity : function(){
    this._super();
    var $table = $('.truefalsetable'),
      $subanswers = $table.find('input');

    $subanswers.removeClass('final disable');

    $subanswers.parent().removeClass('selected correct');

    $subanswers.removeClass('true correct')
      .removeAttr('disabled')
      .prop('checked', false)
      .unbind('click');

    $(".marking.icon.icon-tick").remove();

    this.setupActivity();
  },


  /**
   * Shows a why feedback popup
   */
  launchWhy : function (p_index) {
    //fire super method
    this._super(p_index);

    var $table = _app.$content.find('#truefalsetable_div');
    //when the user scrolls, hide the popup so we dont get unexpected behaviours
    $table.bind('scroll', function() {
      $('#why-popup').remove();
      $table.find('#r-'+ p_index).attr('tabindex', '-1').focus();
      $table.unbind('scroll');
    });
  },



  setupActivity : function() {

    var $table = _app.$content.find('#truefalsetable_div'),
        $activityRadio = $table.find('div.radio'),
        $activityCheck = $table.find('div.checkbox'),
        l_responses = $.makeArray(this.data.rows.row),
        l_responseCount = l_responses.length,
        $submit = $('#btn-submit');

    $submit.disable();

    //click handler for radio button responses
    $activityRadio.find('input').click(function(p_event) {

      var $this = $(p_event.target),
          $response = $this.parents('tr');

      //put selected class on item clicked
      $response.find('.input-overlay').removeClass('selected');
      $this.parent().addClass('selected');

      //enable submit if all rows have been selected
      if (($('tr').has('.input-overlay.selected')).length == l_responseCount) {
        $submit.enable();
      }

    });

    $activityCheck.find('input').click(function(p_event) {

      var $this = $(p_event.target),
        $response = $this.parents('.input-overlay');

      $response.toggleClass('selected');

      //enable submit if all rows have been selected
      if (($('tr').has('.input-overlay.selected')).length == l_responseCount) {
        $submit.enable();
      }
      else {
        $submit.disable();
      }
    });

    //psuedo focusing...
    $table.find('input').focus(function() {
      $(this).parent().addClass('focus');
    })
    .blur(function() {
      $(this).parent().removeClass('focus');
    });

  }
});
