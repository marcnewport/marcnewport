/**
 * The functionality for a transition page type
 *
 * @author celine.bonin@ninelanterns.com.au
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class mp_transition
 * @extends PageType
 */
var mp_transition = PageType.extend({


  setup : function() {

    this.html
      .append($$('div', 'transition-text')
        .append($$('div', '', 'transition-inner').html(this.data.main)));

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var $text = _app.$content.find('#transition-text'),
        $inner = _app.$content.find('.inner').eq(0);

    $text.fadeIn(2000, function() {
      $text.attr({ tabindex:'-1' }).focus();
    });

    if (this.data.background != undefined && this.data.background != '') {
      $inner.css({
        background: this.data.background
      });
    }

    var $textcss = '$text.css({';
    if (this.data.align != undefined && this.data.align != '') {
      $textcss += 'textAlign: this.data.align,'
    }

    if (this.data.fontcolor != undefined && this.data.fontcolor != '') {
      $textcss += 'color: this.data.fontcolor'
    }

    $textcss += '})';

    eval($textcss);

    setTimeout(this.resizePage, 100);
  },



  resizePage : function() {

    var $inner = _app.$content.find('.inner').eq(0),
        $text = $inner.find('.transition-inner'),
        l_maxHeight = $inner.height(),
        l_height = $text.height(),
        l_marginTop = (l_maxHeight - l_height) / 2;

    $text.css({
      marginTop: l_marginTop +'px'
    });
  }

});
