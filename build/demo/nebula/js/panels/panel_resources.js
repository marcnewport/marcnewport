/**
 * Functionality for the resources panel
 *
 * @author marc.newport@ninelanterns.com.au
 * @author celine.bonin@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class PanelResources
 * @extends Panel
 */
var PanelResources = Panel.extend({



  /**
   * The constructor method
   */
  init : function() {
    this.id = 'resources';
    this._super();
  },



  /**
   * Build the HTML markup for this panel
   */
  setup : function(p_data) {

    var scope = this,
        l_groups = $.makeArray(p_data),
        g_count = l_groups.length,
        $panel = $('#panel-resources'),
        $content = $panel.find('.panel-content'),
        $inner = $$('div', '', 'inner'),
        $panelTabs = $panel.find('.panel-tabs').empty(),
        l_firstTab = '';

    //html references
    this.$essential = $$('div', 'essential-content');
    this.$links = $$('div', 'links-content');
    this.$glossary = $$('div', 'glossary-content');
    this.$faq = $$('div', 'faq-content');

    //unbind the click listeners
    this.$panel.off('click');

    // remove class to buttons for essential info icon
    this.$button.removeClass('has_essential');

    //loop through resource groups
    for (var i = 0; i < g_count; i++) {

      switch (l_groups[i].type) {
        case 'essential':
          this.setupEssentialInfo(l_groups[i]);
          break;

        case 'review':
          this.setupReviewLinks(l_groups[i]);
          break;

        case 'other':
          this.setupOtherLinks(l_groups[i]);
          break;

        case 'mp_glossary':
          this.setupGlossary(l_groups[i]);
          break;

        case 'mp_faq':
          this.setupFAQ(l_groups[i]);
          break;
      }
    }

    //add tabs, and find first content to show
    if (this.$essential.html().length > 0) {
      $panelTabs.append($$('a', 'tab-essential', 'tab', { href:'#' }).html('Essential Information'));
      l_firstTab = 'tab-essential';
    }

    if (this.$links.html().length > 0) {
      $panelTabs.append($$('a', 'tab-links', 'tab', { href:'#' }).html('Links'));
      if(empty(l_firstTab)) l_firstTab = 'tab-links';
    }

    if (this.$glossary.html().length > 0) {
      $panelTabs.append($$('a', 'tab-glossary', 'tab', { href:'#' }).html('Glossary'));
      if(empty(l_firstTab)) l_firstTab = 'tab-glossary';
    }

    if (this.$faq.html().length > 0) {
      $panelTabs.append($$('a', 'tab-faq', 'tab', { href:'#' }).html('FAQs'));
      if(empty(l_firstTab)) l_firstTab = 'tab-faq';
    }

    //listen for tab click
    $panel.find('.tab').bind('click', function(p_event) {

      $inner.empty();
      //unselect tabs
      $panel.find('.tab').removeClass('selected');

      //find the tab clicked
      switch (p_event.target.id) {
        case 'tab-essential':
          $inner.html(scope.$essential);
          $(p_event.target).addClass('selected');
          break;

        case 'tab-links':
          $inner.html(scope.$links);
          $(p_event.target).addClass('selected');
          break;

        case 'tab-glossary':
          $inner.html(scope.$glossary);
          $(p_event.target).addClass('selected');
          break;

        case 'tab-faq':
          $inner.html(scope.$faq);
          $(p_event.target).addClass('selected');
          break;
      }
      //add the content
      $content.html($inner);

      return false;
    });

    //show the first tab
    $('#'+ l_firstTab).trigger('click');

    this._super();
  },



  /**
   * Gather html for essential information
   */
  setupEssentialInfo : function(p_data) {

    var scope = this,
        l_resources = $.makeArray(p_data.item),
        l_count = l_resources.length,
        $resource = [],
        l_link = '',
        l_description = '',
        l_iconName = '';

    //loop through reviewable links and build the html
    for (var i = 0; i < l_count; i++) {

      switch (l_resources[i].type) {
        case 'essential':
          l_link = '';
          l_description = l_resources[i].content;
          l_iconName = 'icon-alert';
          break;

        case 'mp_resource_image':
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].alt_text;
          l_iconName = 'icon-image';
          break;

        case 'mp_resource_video':
          if (Number(l_resources[i].streaming)) {
            l_link = l_resources[i].address;
          }
          else {
            l_link = 'files/'+ l_resources[i].content;
          }
          l_description = l_resources[i].description;
          l_iconName = 'icon-video';
          break;

        case 'mp_resource_web':
          l_link = l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-earth';
          break;

        case 'mp_resource_audio':
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-audio';
          break;

        default:
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-file-text';
          break;
      }

      $resource = $$('div', 'essential-'+ i, 'resource '+ l_resources[i].ext)
        .append($$('div', '', 'icon '+ l_iconName))
        .append($$('div', '', 'info')
            .append($$('div', '', 'title').html(l_resources[i].title))
            .append($$('div', '', 'description').html(l_description))
            .append($$('a', '', 'url', { href: l_link, target: '_blank' }).html(l_link)));

      this.$essential.append($resource);
    }

    //handle resource link clicks
    this.$panel.on('click', '#essential-content', function(p_event) {

      var $target = $(p_event.target),
          l_file = '',
          l_type = '',
          $resource = [],
          l_id = '';

      //only handle an anchor click
      if ($target.is('a')) {
        l_file = $target.attr('href');
        l_type = l_file.split('.').pop();

        //check if the href is to youtube or vimeo and screen it here
        if (l_file.indexOf('vimeo') || l_file.indexOf('youtube')) {
          l_type = 'mp4';
        }

        //certain files we have to open in page
        switch (l_type) {
          case 'mp3':
          case 'mp4':
            $resource = $target.parents('.resource');
            l_id = $resource.attr('id').split('-').pop();
            scope.openResource(l_resources[l_id]);
            p_event.preventDefault();
            break;
        }
      }
    });

    // add class to buttons for icon
    this.$button.addClass('has_essential');
  },



  /**
   * Gather html for links (review)
   */
  setupReviewLinks : function(p_data) {

    var scope = this,
        l_resources = $.makeArray(p_data.item),
        l_count = l_resources.length,
        $review = $$('div', 'resources-review'),
        $resource = [],
        l_link = '',
        l_description = '',
        l_iconName = '';

    //loop through reviewable links and build the html
    for (var i = 0; i < l_count; i++) {
      l_iconName = '';

      switch (l_resources[i].type) {

        case 'mp_resource_image':
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].alt_text;
          l_iconName = 'icon-image';
          break;

        case 'mp_resource_video':
          if (Number(l_resources[i].streaming)) {
            l_link = l_resources[i].address;
          }
          else {
            l_link = 'files/'+ l_resources[i].content;
          }
          l_description = l_resources[i].description;
          l_iconName = 'icon-video';
          break;

        case 'mp_resource_web':
          l_link = l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-earth';
          break;

        case 'mp_resource_audio':
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-audio';
          break;

        default:
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-file-text';
          break;
      }

      $resource = $$('div', 'review-'+ i, 'resource '+ l_resources[i].ext)
          .append($$('span', '', 'icon '+ l_iconName))
          .append($$('div', '', 'info')
              .append($$('h4', '', 'title').html(l_resources[i].title))
              .append($$('div', '', 'description').html(l_description))
              .append($$('a', '', 'url', { href: l_link, target: '_blank' }).html(l_link)));

      $review.append($resource);
    }

    //add the html
    this.$links.append($review);

    //handle resource link clicks
    this.$panel.on('click', '#resources-review', function(p_event) {

      var $target = $(p_event.target),
          l_file = '',
          l_type = '',
          $resource = [],
          l_id = '';

      //only handle an anchor click
      if ($target.is('a')) {
        l_file = $target.attr('href');
        l_type = l_file.split('.').pop();

        //check if the href is to youtube or vimeo and screen it here
        if (l_file.indexOf('vimeo') || l_file.indexOf('youtube')) {
          l_type = 'mp4';
        }

        //certain files we have to open in page
        switch (l_type) {
          case 'mp3':
          case 'mp4':
            $resource = $target.parents('.resource');
            l_id = $resource.attr('id').split('-').pop();
            scope.openResource(l_resources[l_id]);
            p_event.preventDefault();
            break;
        }
      }
    });
  },



  /**
   * Gather html for links (other)
   */
  setupOtherLinks : function(p_data) {

    var scope = this,
        l_resources = $.makeArray(p_data.item),
        l_count = l_resources.length,
        $other = $$('div', 'resources-other').append($$('h2').html('You might also be interested in...')),
        $resource = [],
        l_link = '',
        l_description = '',
        l_iconName = '';

    //loop through reviewable links and build the html
    for (var i = 0; i < l_count; i++) {

      switch (l_resources[i].type) {

        case 'mp_resource_image':
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].alt_text;
          l_iconName = 'icon-image';
          break;

        case 'mp_resource_video':
          if (l_resources[i].streaming == 1) {
            l_link = l_resources[i].address;
          }
          else {
            l_link = 'files/'+ l_resources[i].content;
          }
          l_description = l_resources[i].description;
          l_iconName = 'icon-video';
          break;

        case 'mp_resource_web':
          l_link = l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-earth';
          break;

        case 'mp_resource_audio':
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-audio';
          break;

        default:
          l_link = 'files/'+ l_resources[i].content;
          l_description = l_resources[i].description;
          l_iconName = 'icon-file-text';
          break;
      }

      $resource = $$('div', 'other-'+ i, 'resource '+ l_resources[i].ext)
          .append($$('div', '', 'icon '+ l_iconName))
          .append($$('div', '', 'info')
              .append($$('h4', '', 'title').html(l_resources[i].title))
              .append($$('div', '', 'description').html(l_description))
              .append($$('a', '', 'url', { href: l_link, target: '_blank' }).html(l_link)));

      $other.append($resource);
    }

    //add the html
    this.$links.append($other);

    //handle resource link clicks
    this.$panel.on('click', '#resources-other', function(p_event) {

      var $target = $(p_event.target),
          l_file = '',
          l_type = '',
          $resource = [],
          l_id = '';

      //only handle an anchor click
      if ($target.is('a')) {
        l_file = $target.attr('href');
        l_type = l_file.split('.').pop();

        //check if the href is to youtube or vimeo and screen it here
        if (l_file.indexOf('vimeo') || l_file.indexOf('youtube')) {
          l_type = 'mp4';
        }

        //certain files we have to open in page
        switch (l_type) {
          case 'mp3':
          case 'mp4':
            $resource = $target.parents('.resource');
            l_id = $resource.attr('id').split('-').pop();
            scope.openResource(l_resources[l_id]);
            p_event.preventDefault();
            break;
        }
      }
    });
  },



  /**
   * Gather html for glossary
   */
  setupGlossary : function(p_data) {

    var l_items = $.makeArray(p_data.item),
        l_count = l_items.length,
        $item = [];

    //loop through glossary items, build the html
    for (var i = 0; i < l_count; i++) {
      $item = $$('div', '', 'item');
      $item.append($$('h4').html(l_items[i].term))
          .append(l_items[i].definition);

      this.$glossary.append($item);
    }
  },



  /**
   * Gather html for FAQ
   */
  setupFAQ : function(p_data) {

    var l_items = $.makeArray(p_data.item),
        l_count = l_items.length,
        $content = $$('ul');

    //loop through glossary items, build the html
    for (var i = 0; i < l_count; i++) {
      //insert item
      $content
        .append($$('li', '', 'item')
          .append($$('a', '', 'question').attr({ href:'#', 'aria-expanded':'false' })
            .append(l_items[i].question))
          .append($$('div', '', 'answer hidden').html(l_items[i].answer)));
    }

    //insert the built items
    this.$faq.append($content);

    //TODO : find a better way of handling clicks here
    $('#panel-resources').on('click', '#faq-content', function(p_event) {

      var $target = $(p_event.target),
          $parent = [];

      //was it an anchor clicked
      if ($target.hasClass('question')) {
        //get parent item
        $parent = $target.parent();

        if ($parent.hasClass('open')) {
          //close it
          $parent.find('.answer').slideUp();
          $parent.removeClass('open');
          $target.attr('aria-expanded', 'false');
        }
        else {
          //open it up
          $parent.find('.answer').slideDown();
          $parent.addClass('open');
          $target.attr('aria-expanded', 'true');
        }

        p_event.preventDefault();
      }

    });
  },



  /**
   * Opens a resource from the resource panel
   */
  openResource : function(p_resource) {

    var $content = [],
        l_dimensions = {},
        l_description = '',
        l_media = {},
        l_playerId = 'resource-media-'+ $.randomString(6);

    switch (p_resource.type) {
      case 'mp_resource_audio':
        $content = $$('div', '', 'resource')
          .append($$('div', l_playerId, 'resource-player'));

        if (p_resource.image) {
          //add the transcript
          l_dimensions = { width:200, height:273 };
          l_description = p_resource.description || '';

          if (! empty(l_description)) {
            $content.append($$('div').html(l_description).transcript('right', l_dimensions, l_playerId));
          }
          //show the overlay
          _app.modalOverlay(p_resource.title, $content).addClass('audio-resource');

          //insert the player
          l_media = p_resource;
          l_media.width = 485;
          l_media.height = 273;
          _app.setupAudioPlayer(l_playerId, l_media, l_media.image);
        }
        else {
          //add the transcript
          l_dimensions = { width:485, height:240 };
          l_description = p_resource.description || '';

          if (! empty(l_description)) {
            $content.append($$('div').html(l_description).transcript('down', l_dimensions, l_playerId));
          }
          //show the overlay
          _app.modalOverlay(p_resource.title, $content).addClass('audio-resource');

          //insert the player
          l_media = p_resource;
          l_media.width = 485;
          l_media.height = 24;
          _app.setupAudioPlayer(l_playerId, l_media);
        }
        break;

      case 'mp_resource_document':
        window.open('files/'+ p_resource.content, '_blank');
        break;

      case 'mp_resource_image':
        //check width
        if (Number(p_resource.width) > 690) {
          l_ratio = 690 / p_resource.width;
          l_dimensions.width = p_resource.width * l_ratio;
          l_dimensions.height = p_resource.height * l_ratio;
        }

        //check height
        if (Number(p_resource.height) > 340) {
          l_ratio = 340 / p_resource.height;
          l_dimensions.width = p_resource.width * l_ratio;
          l_dimensions.height = p_resource.height * l_ratio;
        }

        $content = $$('a').attr({ href:'files/'+ p_resource.content, target:'_blank' })
          .html($$('img').attr({
            src: 'files/'+ p_resource.content,
            alt: p_resource.alt_text,
            width: l_dimensions.width,
            height: l_dimensions.height
          }));

        _app.modalOverlay(p_resource.title, $content);
        break;

      case 'mp_resource_video':
        $content = $$('div', '', 'resource')
          .append($$('div', l_playerId, 'resource-player'));

        //add the transcript
        l_dimensions = { width:200, height:273 };
        l_description = p_resource.description || '';
        if(! empty(l_description)) {
          $content.append($$('div').html(l_description).transcript('right', l_dimensions, l_playerId));
        }
        //show the overlay
        _app.modalOverlay(p_resource.title, $content).addClass('video-resource');

        //insert the player
        l_media = p_resource;
        l_media.width = 485;
        l_media.height = 273;
        _app.setupVideoPlayer(l_playerId, l_media);
        break;

      case 'mp_resource_web':
        window.open(p_resource.content, '_blank');
        break;
    }
  }

});
