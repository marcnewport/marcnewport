/**
 * The functionality for a branching menu page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2015
 * @version 2.0
 * @class mp_branching_menu
 * @extends PageType
 */
var mp_branching_menu = PageType.extend({



  /**
   * Build page markup
   */
  setup : function() {

    this.topicCount = 0;

    var $main = $$('div', 'main-text'),
        $img = [],
        $links = $$('div', 'links'),
        l_links = $.makeArray(this.data.links.item),
        l_count = l_links.length,
        l_topic = {},
        l_role = _app.session.getUserData('role')[1] || false,
        l_allowedRoles = [];

    for (var i = 0; i < l_count; i++) {
      //we need to check if the user has selected a role
      if (l_role) {
        l_topic = _app.structure.find(l_links[i].link);
        //does the topic have a list of allowed roles?
        if (l_topic.roles) {
          l_allowedRoles = l_topic.roles.split(',');
          //is the selected role allowed to access this topic?
          if ($.inArray(l_role, l_allowedRoles) < 0) {
            //no. start next loop
            continue;
          }
        }
      }

      //if we made it here, there is no role selected or the current role can access this topic
      this.topicCount++;

      $img = $$('img').attr({
        src: 'files/'+ l_links[i].image.item.content,
        alt: l_links[i].image.item.alt_text,
        width: l_links[i].image.item.width,
        height: l_links[i].image.item.height
      });

      //the link item markup...
      $links
        .append($$('div', l_links[i].link, 'link-item')
          .append($$('h3').html(l_links[i].title))
          .append($$('a').attr({ href:'#', title:l_links[i].title })
            .append($img))
            .append($$('span', '', 'icon icon-circle-tick')));
    }

    $main.html($$('div').html(this.data.main));

    if (this.data.summary_link) {
      $main.append($$('a', this.data.summary_link, 'summary-link').attr({ href:'#'}).html(this.data.summary_title));
    }

    this.html
      .append($main)
      .append($links);

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var scope = this,
        $main = _app.$content.find('#main-text'),
        $summary = $main.find('.summary-link'),
        $links = _app.$content.find('#links'),
        l_links = $.makeArray(this.data.links.item),
        l_count = l_links.length,
        l_complete = true;

    //handle summary link clink
    $summary.bind('click', function(p_event) {
      var l_id = this.id,
          l_page = _app.structure.firstViewableChild(l_id);

      //check if we have a page to go to
      if (l_page.id) _app.sequence.goTo(l_page.id);
      p_event.preventDefault();
    });

    //handle link click
    $links.bind('click', function(p_event) {
      //get the topic id from the link id attr
      var $target = $(p_event.target),
          $link = $target.parents('.link-item'),
          l_id = $link.attr('id'),
          l_page = _app.structure.firstViewableChild(l_id);

      //check if we have a page to go to
      if (l_page.id) _app.sequence.goTo(l_page.id);
      p_event.preventDefault();
    });

    //loop through the links
    $links.find('.link-item').each(function(index) {
      var $this = $(this),
          l_link = $this.attr('id'),
          l_description;

      if (_app.session.getTopicCompletion(l_link)) {
        $this.addClass('complete');
      }
      else {
        l_complete = false;
        //do we hide the summery link until completion?
        if (! Number(scope.data.summary_link_show)) {
          $summary.hide();
        }
      }

      //look for link description and add hover event for tooltip
      for (var i = 0; i < l_count; i++) {
        if (i === index) {
          l_description = l_links[i].description;
          break;
        }
      }

      if (l_description) {
        $this.hover(function() {
          $this.tooltip(l_description);
        },
        function() {
          $('.tooltip').remove();
        });
      }
    });
  },



  /**
   * Resize elements on the page (called once elements are available)
   */
  resizePage : function() {

    var l_count = this.topicCount,
        $inner = _app.$content.find('.inner').eq(0),
        $pageTitle = $inner.find('.page-title'),
        $main = $inner.find('#main-text'),
        $links = $inner.find('#links'),
        l_width = $inner.width(),
        l_height = $inner.height() - $pageTitle.height(),
        l_margin = 8,
        l_mainWidth = 0,
        l_linksWidth = 0,
        l_imageWidth = 0,
        l_imageHeight = 0;

    //check the number of links
    if (l_count < 4) {
      //3 or less links will display side by side
      l_mainWidth = l_width / (l_count + 1);
      l_linksWidth = l_width - l_mainWidth;
      l_imageWidth = (l_linksWidth / l_count) - l_margin;
      l_imageHeight = l_height;
    }
    else {
      //4 or more links will get displayed in 2 rows
      l_mainWidth = l_width / (Math.ceil(l_count / 2) + 1);
      l_linksWidth = l_width - l_mainWidth;
      l_imageWidth = Math.floor(l_linksWidth / Math.ceil(l_count / 2)) - l_margin;
      l_imageHeight = Math.floor(l_height / 2) - l_margin;
    }

    $main.css({
      width: l_mainWidth,
      maxHeight: l_height
    });

    $links.css({
      width: l_linksWidth,
      height: l_height
    })
    .find('.link-item').css({
      width: l_imageWidth,
      height: l_imageHeight,
      marginBottom: l_margin +'px'
    })
    .find('img').scaleDimensions({
      width: l_imageWidth,
      height: l_imageHeight,
      fill: true
    });
  }

});
