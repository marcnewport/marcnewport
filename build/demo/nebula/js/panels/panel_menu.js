/**
 * Functionality for the case study panel
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class PanelMenu
 * @extends Panel
 */
var PanelMenu = Panel.extend({



  /**
   * Constructor method
   */
  init : function() {
    this.id = 'menu';
    this._super();
  },



  /**
   * Gathers html for the panel
   */
  setup : function() {

    var $content = $$('ul', '', 'content', { role:'tree' }),
        l_items = $.makeArray(_app.structure.course.tree.item),
        l_count = l_items.length,
        l_children = [],
        l_childCount = 0,
        $topic = [],
        l_role = _app.session.getUserData('role')[1] || false,
        l_allowedRoles = [],
        $pages = [],
        l_pageClasses = '',
        l_pageAttr = {};

    //loop through top level items
    for (var i = 0; i < l_count; i++) {

      switch (l_items[i].type) {
        case 'mp_introduction':
          $content
            .append($$('li').attr({ role:'treeitem' })
              .append($$('a', l_items[i].id, 'btn-page', { href:'#' }).html(l_items[i].title)));
          break;

        case 'mp_topic':
          //has the user selected a role? does the topic have role access?
          if (l_role && l_items[i].roles) {
            l_allowedRoles = l_items[i].roles.split(',');
            //check the current role can access this topc
            if ($.inArray(l_role, l_allowedRoles) < 0) {
              //current role is not in allowed roles list - go to next loop iteration
              continue;
            }
          }

          l_children = l_items[i].children ? $.makeArray(l_items[i].children.item) : [];
          l_childCount = l_children.length;

          $topic = $$('li', 'topic-'+ l_items[i].id, 'topic', { role:'treeitem' })
            .append($$('a', l_items[i].id, 'btn-topic', { href:'#', 'aria-expanded':'false' })
              .append(l_items[i].title));

          if (_app.structure.course.force_topics == 'true') {
            $topic.addClass('disabled').find('.btn-topic').attr('tabindex', '-1');
          }

          $pages = $$('ul', '', 'pages', { role:'group' });

          //loop through pages of the topic
          for (var j = 0; j < l_childCount; j++) {

            l_pageClasses = 'page';
            l_pageAttr = { role:'treeitem' };

            //is the item viewable?
            if (_app.structure.viewable(l_children[j].id)) {
              //is the item a transition page? do we want to view it?
              if (! Number(_app.structure.course.settings.transition_page) && l_children[j].type == 'mp_transition') {
                continue;
              }

              // Add classes to the markup
              var l_userData = _app.session.getUserData(l_children[j].id);
              // Has the user been here before?
              if (l_userData) {
                  switch (l_userData[1]) {
                    case -2:
                      l_pageClasses += ' enabled';
                      break;
                    default:
                      l_pageClasses += ' enabled complete';
                      break;
                  }
              }
              // Is the order forced?
              else if (l_items[i].force_order == 'true') {
                l_pageClasses += ' disabled';
                l_pageAttr['aria-disabled'] = 'true';
              }

              $pages
                .append($$('li', '', l_pageClasses).attr(l_pageAttr)
                  .append($$('a', l_children[j].id, 'btn-page', { href:'#' })
                    .append($$('span', '', 'icon-dot').html('\u25CF'))
                    .append(l_children[j].title)));
            }
          }

          $content.append($topic.append($pages));
          break;
      }
    }

    this.$panel.find('.panel-content').html($content);

    this._super();

    this.ready();
  },



  /**
   * Called after setup has inserted the markup
   */
  ready : function() {

    var scope = this;

    this.$panel
      .unbind('click.panelmenu')
      .bind('click.panelmenu', function(p_event) {

      var $target = $(p_event.target),
          $parent = $target.parent(),
          l_pageId = $target.attr('id');

      p_event.preventDefault();

      if ($target.hasClass('btn-topic')) {

        //topic was clicked, open or close it
        if ($parent.hasClass('disabled')) {
          //do nuffin
        }
        else if ($parent.hasClass('open')) {
          $target.attr('aria-expanded', 'false')
            .siblings('.pages').slideUp(function() {
              $parent.removeClass('open');
            });
        }
        else {
          $target.attr('aria-expanded', 'true')
            .siblings('.pages').slideDown(function() {
              $parent.addClass('open');
            });
        }
      }
      else if ($target.hasClass('btn-page') && ! $target.parent().hasClass('disabled')) {

        switch (_app.navigation) {
          case 'hamburger':
            _app.currentPage.togglePanels();
            break;
          default:
            scope.close();
            break;
        }
          //page was clicked, move app to that page
          _app.sequence.goTo(l_pageId);
      }
    });

  },



  /**
   * Super method slides open the panel
   * Add any other functionality for this specific panel here
   * (called once html has been inserted into panel)
   */
  open : function() {

    this._super();

    //loop through topic elements
    this.$panel.find('.topic').each(function() {

      var $topic = $(this),
          $page = [],
          l_complete = true,
          l_started = false;

      //loop through page elements
      $topic.find('.page').each(function() {
        $page = $(this);

        //if they all don't have a class of complete, the topic isn't complete
        if (! $page.hasClass('complete')) {
          l_complete = false;
        }
        else {
          l_started = true;
        }
      });

      //add complete class if needed
      if (l_complete) {
        $topic.addClass('complete').removeClass('disabled')
          .find('.btn-topic').removeAttr('tabindex', '-1');
      }
      else {
        $topic.removeClass('complete');
      }

      //enable topic if started
      if (l_started) {
        $topic.removeClass('disabled')
          .find('.btn-topic').removeAttr('tabindex', '-1');
      }
    });
  },



  /**
   * Marks page in menu list as complete
   *
   * @var p_id
   *    current page id & id of menu item
   */
  pageComplete : function(p_id){

    var l_id = p_id;

    $('#'+l_id).parent().addClass('complete');
  },



  /**
   * Called from page_type class to update items in menu
   */
  update : function() {

    //remove "current" class of all page items
    this.$panel.find('.page').removeClass('current');

    //enable the page we are on in the menu
    this.$panel.find('#'+ _app.currentPage.id)
      .removeAttr('tabindex')
      .parent()
        .removeClass('disabled')
        .removeAttr('aria-disabled')
        .addClass('current enabled');

//    //Check if new topic & active
//    if (_app.structure.course.force_topics == 'true') {
//      $('#'+ _app.structure.parent().id)
//        .removeAttr('tabindex')
//        .parent()
//          .removeClass('disabled');
//    }
  }


});
