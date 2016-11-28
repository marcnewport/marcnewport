/**
 * Builds and traverses the course structure
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 * @class Structure
 */
var Structure = Class.extend({



  /**
   * The constructor method
   */
  init : function() {
    this.course = {};
  },



  /*
   * Builds the course structure based on the /data/structure.xml file
   */
  build : function(p_callback) {

    var l_cacheBuster = '?cacheBuster='+ $.randomString(),
        l_xmlPath = './data/structure.xml'+ l_cacheBuster,
        scope = this;

    //ajax request (cache busting everytime)
    $.ajax({
      type: 'GET',
      url: l_xmlPath,
      dataType: 'xml',
      success: function(p_data) {
        var l_data = $.xml2json(p_data);

        //no need to modify
        scope.course = l_data.course;
        l_data = null;

        //done building
        if (p_callback != undefined) {
          setTimeout(p_callback, 1000);
        }

        return true;
      },
      error: function(p_response, p_status, p_error) {
        trace('Could not load "'+ l_xmlPath +"\"\r\n"+ p_status +': '+ p_error.name);
        return false;
      }
    });
  },



  /**
   * Checks if the page type is viewable as determined by structure.xml
   */
  viewable : function(p_id) {

    var l_id = p_id || _app.currentPage.id,
        l_item = this.find(l_id),
        l_viewables = this.course.settings.viewable.split(','),
        l_viewCount = l_viewables.length;

    if (typeof l_item === 'object') {
      for (var i = 0; i < l_viewCount; i++) {
        if (l_viewables[i] == l_item.type) {
          return true;
        }
      }
    }

    return false;
  },



  /**
   * Finds and returns an item's structure object
   */
  find : function(p_id, p_depth) {

    var l_id = p_id || _app.currentPage.id,
        l_items = $.makeArray(p_depth || this.course.tree.item),
        l_itemCount = l_items.length;

    //loop through items and match l_id
    for(var i = 0; i < l_itemCount; i++) {

      if (l_items[i].id == l_id) {
        //found current item
        return l_items[i];
      }
      else if (typeof l_items[i].children === 'object') {
        //item not found at this level
        var l_child = this.find(l_id, l_items[i].children.item);

        if (typeof l_child === 'object') {
          return l_child;
        }
      }
    }

    return false;
  },



  /**
   * Find the first occurance of a certain page type
   */
  findFirstOfType : function(p_type, p_depth) {

    var l_items = $.makeArray(p_depth || this.course.tree.item),
        l_itemCount = l_items.length;

    //loop through items and match l_id
    for(var i = 0; i < l_itemCount; i++) {

      if (l_items[i].type == p_type) {
        //found current item
        return l_items[i];
      }
      else if (typeof l_items[i].children === 'object') {
        //item not found at this level
        var l_child = this.findFirstOfType(p_type, l_items[i].children.item);

        if (typeof l_child === 'object') {
          return l_child;
        }
      }
    }

    return false;
  },



  /**
   * Returns the id of the first viewable page in the course
   */
  first : function(p_depth) {

    var l_items = $.makeArray(p_depth || this.course.tree.item),
        l_itemCount = l_items.length;

    for (var i = 0; i < l_itemCount; i++) {
      if (this.viewable(l_items[i].id)) {
        return l_items[i];
      }
      else if (typeof l_items[i].children === 'object') {
        //item not found at this level
        var l_child = this.first(l_items[i].children.item);

        if (typeof l_child === 'object') {
          return l_child;
        }
      }
    }

    return false;
  },



  /**
   * Returns the id of the last viewable page in the course
   */
  last : function() {

    var l_item = this.course.tree.item,
        l_itemCount = (l_item.length - 1);

    //look backwards from end
    for (var i = l_itemCount; i > -1; i--) {
      if (this.viewable(l_item[i].id)) {
        return l_item[i];
      }
    }

    return false;
  },



  /**
   * Finds the first childs id, assumes you mean of the current page unless you pass an id
   */
  firstViewableChild : function(p_id, p_depth) {

    var l_id = p_id || _app.currentPage.id,
        l_items = $.makeArray(p_depth || this.course.tree.item),
        l_itemCount = l_items.length;

    for (var i = 0; i < l_itemCount; i++) {
      if (l_items[i].id == l_id) {
        //found current item
        var l_childItem = l_items[i];

        //check for children
        if (typeof l_childItem.children === 'object') {
          var l_childItems = $.makeArray(l_childItem.children.item),
              l_childItemCount = l_childItems.length;

          //find first viewable item in children
          for (var j = 0; j < l_childItemCount; j++) {
            if (this.viewable(l_childItems[j].id)) {
              return l_childItems[j];
            }
          }
        }
      }
      else if (typeof l_items[i].children === 'object') {
        //item not found at this level
        var l_child = this.firstViewableChild(l_id, l_items[i].children.item);

        if (typeof l_child === 'object' || l_child == 'last') {
          return l_child;
        }
      }
    }

    return false;
  },



  /**
   * Finds the first childs id, assumes you mean of the current page unless you pass an id
   */
  lastViewableChild : function(p_id, p_depth) {

    var l_id = p_id || _app.currentPage.id,
        l_items = $.makeArray(p_depth || this.course.tree.item),
        l_itemCount = l_items.length,
        l_childItem = {},
        l_childItems = [],
        l_childItemCount = 0,
        l_child;

    for (var i = 0; i < l_itemCount; i++) {
      if (l_items[i].id == l_id) {
        //found current item
        l_childItem = l_items[i];

        //check for children
        if (typeof l_childItem.children === 'object') {
          l_childItems = $.makeArray(l_childItem.children.item);
          l_childItemCount = l_childItems.length - 1;

          //loop backwards from last item to find last viewable
          for (var j = l_childItemCount; j >= 0; j--) {
            if (this.viewable(l_childItems[j].id)) {
              return l_childItems[j];
            }
          }
        }
      }
      else if (typeof l_items[i].children === 'object') {
        //item not found at this level
        l_child = this.lastViewableChild(l_id, l_items[i].children.item);

        if (typeof l_child === 'object' || l_child == 'last') {
          return l_child;
        }
      }
    }

    return false;
  },



  /**
   * Finds the parent id, assumes you mean of the current page unless you pass an id
   */
  parent : function(p_id, p_depth, p_parent) {

    var l_id = p_id || _app.currentPage.id,
        l_items = $.makeArray(p_depth || this.course.tree.item),
        l_parent = p_parent || this.course,
        l_itemCount = l_items.length;

    for (var i = 0; i < l_itemCount; i++) {
      if (l_items[i].id == l_id) {
        return l_parent;
      }
      else if(typeof l_items[i].children === 'object') {
        //item not found at this level
        var l_child = this.parent(l_id, l_items[i].children.item, l_items[i]);

        if (typeof l_child === 'object' || l_child == 'last') {
          return l_child;
        }
      }
    }

    return false;
  },



  /**
   * Finds the next id, assumes you mean of the current page unless you pass an id
   */
  next : function(p_id) {

    var l_id = p_id || _app.currentPage.id,
        l_parent = this.parent(l_id),
        l_structure = l_parent.tree ? l_parent.tree : l_parent.children,
        l_siblings = $.makeArray(l_structure.item),
        l_siblingCount = l_siblings.length,
        l_next = {};

    //look for this id in the sibling pool
    for (var i = 0; i < l_siblingCount; i++) {
      if (l_siblings[i].id == l_id) {
        //is it the first in the pool
        if (i < l_siblingCount - 1) {
          l_next = l_siblings[i + 1];
          if (this.viewable(l_next.id)) {
            return l_next;
          }
          else {
            return this.next(l_next.id);
          }
        }
        else {
          return 'last';
        }
        break;
      }
    }

    return false;
  },



  /**
   * Finds the previous id, assumes you mean of the current page unless you pass an id
   */
  previous : function(p_id) {

    var l_id = p_id || _app.currentPage.id,
        l_parent = this.parent(l_id),
        l_structure = l_parent.tree ? l_parent.tree : l_parent.children,
        l_siblings = $.makeArray(l_structure.item),
        l_siblingCount = l_siblings.length,
        l_previous = {};

    //look for this id in the sibling pool
    for (var i = 0; i < l_siblingCount; i++) {
      if (l_siblings[i].id == l_id) {
        //is it the first in the pool
        if (i < 1) {
          return 'first';
        }
        else {
          l_previous = l_siblings[i - 1];

          if (this.viewable(l_previous.id)) {
            return l_previous;
          }
          else {
            return this.previous(l_previous.id);
          }
        }
        break;
      }
    }

    return false;
  },



  /**
   * return item's type
   */
  type : function(p_id) {

    var l_item = this.find(p_id);

    if (typeof l_item === 'object') {
      return l_item.type;
    }

    return false;
  },


  /**
   * return an array of child id's for an item
   */
  children : function(p_id, p_depth) {

    var l_id = p_id || _app.currentPage.id,
        l_items = $.makeArray(p_depth || this.course.tree.item),
        l_itemCount = l_items.length;

    //loop through items to match l_id
    for(var i = 0; i < l_itemCount; i++) {

      if (l_items[i].id == l_id) {
        //found current item

        if (typeof l_items[i].children === 'object') {
          var l_childs = [],
              l_children = l_items[i].children.item,
              l_childCount = l_children.length;

          for (var j = 0; j < l_childCount; j++) {
            l_childs[j] = l_children[j].id;
          }

          return l_childs;
        }
      }
      else if (typeof l_items[i].children === 'object') {
        //item not found at this level
        var l_child = this.children(l_id, l_items[i].children.item);

        if (l_child instanceof Array) {
          return l_child;
        }
      }
    }

    return false;
  },



  /**
   * Retrieves topics in the course structure.
   * Checks if the user has a role and is allowed access to topic.
   */
  getTopics : function() {

    var l_items = this.course.tree.item,
        l_itemCount = l_items.length,
        l_role = _app.session.getUserData('role')[1] || false,
        l_allowedRoles = [],
        l_topics = [];

    //topics can only be children of a course
    for (var i = 0; i < l_itemCount; i++) {
      //look for mp_topic
      if (l_items[i].type === 'mp_topic') {
        //has the user selected a role? does the topic have role access?
        if (l_role && l_items[i].roles) {
          l_allowedRoles = l_items[i].roles.split(',');
          //check the current role can access this topc
          if ($.inArray(l_role, l_allowedRoles) < 0) {
            //current role is not in allowed roles list - go to next loop iteration
            continue;
          }
        }

        l_topics.push(l_items[i]);
      }
    }

    return l_topics;
  },



  /**
   * Returns position of page within the course
   * @p_id assumes id of current page if not provided
   */
  getPosition : function(p_id) {

    var l_id = p_id || _app.currentPage.id,
        l_role = _app.session.getUserData('role')[1] || 'all',
        l_items = _app.structure.course.settings.page_list[l_role].replace(/\s/g, '').split(','),
        l_count = l_items.length,
        l_item = {},
        l_position = [];

    for (var i = 0; i < l_count; i++) {

      l_item = this.find(l_items[i]);

      switch (l_item.type) {
        case 'mp_splash':
          //remove splash page from list
          l_items.splice(i, 1);
          l_count--;
          break;
      }
    }

    //add current index
    l_position.push(l_items.indexOf(l_id) + 1);

    //page total
    l_position.push(l_items.length);

    return l_position;
  },



  /**
   * Returns the scenario within a topic structre
   */
  getCaseStudy : function() {

    var l_items = $.makeArray(this.course.tree.item),
        l_itemCount = l_items.length;

    for (var i = 0; i < l_itemCount; i++) {
      if (l_items[i].type == 'mp_case_study') {
        return l_items[i];
      }
    }

    return false;
  },



  /**
   * Returns id of next topic in course
   */
  getNextTopic: function() {

    var l_allTopics = this.getTopics(),
        l_topics = [],
        l_count = 0,
        l_currentTopic = this.parent().id,
        l_position = 0;

    //remove any topics that dont have children
    for (var a in l_allTopics) {
      if (l_allTopics[a].children) {
        l_topics.push(l_allTopics[a]);
      }
    }

    l_count = l_topics.length;

    for (var i = 0; i < l_count; i++) {
      if (l_topics[i].id == l_currentTopic) {
        //found current topic
        l_position = i + 1;
      }
    }

    if (l_position < l_topics.length) {
      return l_topics[l_position];
    }

   return false;
  },



  /**
   * Returns id of the previous topic in course
   */
  getPreviousTopic : function() {

    var l_topics = this.getTopics(),
        l_count = l_topics.length,
        l_currentTopic = this.parent().id,
        l_position = 0;

    for (var i = 0; i < l_count; i++) {
      if (l_topics[i].id == l_currentTopic) {
        //found current topic
        l_position = i - 1;
        break;
      }
    }

    if (l_position > -1) {
      return l_topics[l_position];
    }

   return false;
  }

});
