/**
 * The functionality for a role choice page type
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2015
 * @version 2.0
 * @class mp_role_choice
 * @extends PageType
 */
var mp_role_choice = PageType.extend({



  /**
   * Build page markup
   */
  setup : function() {

    var $main = $$('div', 'main-text'),
        $img = [],
        $roles = $$('div', 'roles'),
        l_roles = $.makeArray(this.data.roles.item),
        l_count = l_roles.length,
        l_role = _app.session.getUserData('role')[1] || false,
        l_classes = '';

    for (var i = 0; i < l_count; i++) {
      l_classes = 'role-item';
      //check if a role is in session
      if (l_roles[i].id === l_role) {
        l_classes += ' selected';
        _app.$footer.find('#btn-page-navigation-next').enable();
      }

      $img = $$('img').attr({
        src: 'files/'+ l_roles[i].image.item.content,
        alt: l_roles[i].image.item.alt_text,
        width: l_roles[i].image.item.width,
        height: l_roles[i].image.item.height
      });

      //the role item markup...
      $roles
        .append($$('div', l_roles[i].id, l_classes)
          .append($$('a').attr({ href:'#', title:l_roles[i].name })
            .append($img))
          .append($$('h3').html(l_roles[i].name)));
    }

    $main.html(this.data.main);

    this.html
      .append($main)
      .append($roles);

    this._super();
  },



  /**
   * Calls methods that have javascript reliant on html elements printed out in setup()
   */
  pageReady : function() {

    this._super();

    var scope = this,
        $roles = _app.$content.find('#roles'),
        l_roles = $.makeArray(this.data.roles.item),
        l_count = l_roles.length;

    //handle role click
    $roles.bind('click', function(p_event) {

      var $target = $(p_event.target).parents('.role-item'),
          l_role = _app.session.getUserData('role'),
          l_selected = $target.attr('id'),
          l_position = [];

      //reset the completion status so the learner can continue looking at the module
      if (l_role && l_role !== l_selected) {
        _app.session.set('cmi.core.lesson_status', 'incomplete');
        _app.scorm.save();
      }

      //remove all selected classes
      $roles.find('.role-item').removeClass('selected');
      //show the selected item
      $target.addClass('selected');
      //add role to session
      _app.session.setUserData(['role', l_selected]);

      //update page navigation in footer
      l_position = _app.structure.getPosition(scope.id);
      _app.$footer.find('.page-navigation-position').html(l_position[0] +'/'+ l_position[1]);

      //update menu panel
      _app.panels.menu.setup();
      //page is nextable
      _app.$footer.find('#btn-page-navigation-next').enable();
      p_event.preventDefault();
    });

    //loop through the roles and add hover event for tooltip
    $roles.find('.role-item').each(function(index) {
      var $this = $(this),
          l_description;

      //match the indices
      for (var i = 0; i < l_count; i++) {
        if (i === index) {
          l_description = l_roles[i].description;
          break;
        }
      }

      //is description provided?
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

    var l_count = $.makeArray(this.data.roles.item).length,
        $inner = _app.$content.find('.inner').eq(0),
        $pageTitle = $inner.find('.page-title'),
        $main = $inner.find('#main-text'),
        $roles = $inner.find('#roles'),
        l_width = $inner.width(),
        l_height = $inner.height() - $pageTitle.height(),
        l_margin = 0,
        l_mainWidth = 0,
        l_rolesWidth = 0,
        l_imageWidth = 0,
        //l_imageHeight = 0,
        l_rolesMargin = 0;

    //check the number of roles
    if (l_count < 4) {
      //3 or less roles will display side by side
      if (this.data.main) l_mainWidth = l_width / (l_count + 1);
      l_rolesWidth = l_width - l_mainWidth;
      l_imageWidth = (l_rolesWidth / l_count) - l_margin;
      //l_imageHeight = l_height;
    }
    else {
      //4 or more roles will get displayed in 2 rows
      if (this.data.main) l_mainWidth = l_width / (Math.ceil(l_count / 2) + 1);
      l_rolesWidth = l_width - l_mainWidth;
      l_imageWidth = Math.floor(l_rolesWidth / Math.ceil(l_count / 2)) - l_margin;
      //l_imageHeight = Math.floor(l_height / 2) - l_margin;
      l_rolesMargin = '-30px';
    }

    $main.css({
      width: l_mainWidth,
      maxHeight: l_height
    });

    $roles.css({
      width: l_rolesWidth,
      //height: l_height,
      marginTop: l_rolesMargin
    })
    .find('.role-item').css({
      width: l_imageWidth
    })
      .find('a').css({
        width: l_imageWidth - 50,
        height: l_imageWidth - 50,
        marginLeft: '15px'
      })
    .end()
      .find('img').scaleDimensions({
        width: l_imageWidth - 50,
        height: l_imageWidth - 50,
        fill: true
      });
  }

});
