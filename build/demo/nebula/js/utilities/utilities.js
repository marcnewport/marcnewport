/**
 * Utility functions
 *
 * Additional methods to native objects in javascript with type augmentation.
 * Plus some other global functions I couldn't tie to an object.
 *
 * Custom jQuery plugins.
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2015
 */




/**
 * Type augmentation: adds a method to native data type objects
 */
Function.prototype.addMethod = function(p_name, p_function) {
  if (! this.prototype[p_name]) {
    this.prototype[p_name] = p_function;
    return this;
  }
};





/*
 * ---------------
 * Array Utilities
 * ---------------
 */



/**
 * Shuffles the order of an array
 */
Array.addMethod('shuffle', function() {

  var l_count = this.length,
      l_temporary,
      l_random;

  for(var i = 0; i < l_count; i++){
    l_temporary = this[i];
    l_random = Math.floor(Math.random() * l_count);
    this[i] = this[l_random];
    this[l_random] = l_temporary;
  }

  return this;
});



/**
 * Removes a specified range of indexes from an array
 */
Array.addMethod('remove', function(from, to) {

  var index = 0,
      range = from + (to || 1),
      newArray = [];

  for(var key in this) {
    index = parseInt(key);
    if(index < from || index >= range) {
      newArray.push(this[key]);
    }
  }

  return newArray;
});



/**
 * Alternative method if indexOf is unsupported
 */
if (! Array.indexOf) {
  Array.addMethod('indexOf', function(p_item) {

    var l_length = this.length;

    for(var i = 0; i < l_length; i++) {
      if(this[i] == p_item) {
        return i;
      }
    }

    return -1;
  });
}





/*
 * ----------------
 * Number utilities
 * ----------------
 */



/**
 * Returns a CMITimespan string from milliseconds
 * format = hh:mm:ss
 */
Number.addMethod('toScormTimeString', function() {

  var l_seconds = this / 1000,
      l_hrs = Math.floor(l_seconds / (60 * 60)),
      l_divisor_for_minutes = l_seconds % (60 * 60),
      l_mins = Math.floor(l_divisor_for_minutes / 60),
      l_divisor_for_seconds = l_divisor_for_minutes % 60,
      l_secs = Math.ceil(l_divisor_for_seconds);

  //prefix zeros if less than 10
  l_hrs = (l_hrs < 10) ? '0'+ l_hrs : l_hrs;
  l_mins = (l_mins < 10) ? '0'+ l_mins : l_mins;
  l_secs = (l_secs < 10) ? '0'+ l_secs : l_secs;

  return l_hrs +':'+ l_mins +':'+ l_secs;
});



/**
 * Alternative method if isInteger is unsupported
 */
if (! Number.isInteger) {
  Number.isInteger = function(n) {
    return Number(n) === n && n % 1 === 0;
  };
}





/*
 * ---------------
 * String utilities
 * ---------------
 */



/**
 * Finds and replaces carriage returns with html line breaks
 */
String.addMethod('uncarriage', function() {
  var text = this;
  text = text.replace(/\n\r|\r\n|\r|\n/g, '<br />');
  return text;
});



/**
 * Finds and replaces html line breaks with carriage returns
 */
String.addMethod('carriage', function() {
  var text = this;
  text = text.replace(/<br \/>/g, '\r\n');
  return text;
});



/**
 * Removes xhtml tags from the string
 * @todo pass parameters of allowed tags
 */
String.addMethod('stripTags', function() {
  var text = this;
  text = text.replace(/(<([^>]+)>)/ig, '');
  return text;
});



/**
 * Truncates a string, removes undescriptive words,
 * swaps spaces for underscores
 */
String.addMethod('truncate', function(p_length, p_prefix) {

  var l_words = this.split(' '),
      l_count = l_words.length,
      l_length = p_length || 250,
      l_title = p_prefix || '',
      l_ignore = [
        'a', 'an', 'as', 'at', 'before', 'but', 'by', 'for', 'from', 'is',
        'in', 'into', 'like', 'of', 'off', 'on', 'onto', 'per', 'since',
        'than', 'the', 'this', 'that', 'to', 'up', 'via', 'with'
      ];

  //check for ignore words
  for (var i = 0; i < l_count; i++) {
    if (l_ignore.indexOf(l_words[i]) < 0) {
      l_title += '_'+ l_words[i];
    }
  }

  //remove underscroe from start if there was no prefix
  if (p_prefix === undefined) {
    l_title = l_title.substr(1);
  }
  //cut it to size
  l_title = l_title.substring(0, l_length);

  return l_title;
});





/*
 * ---------------
 * Other utilities
 * ---------------
 */



/**
 * Alternative method if Date.now is not supported in this browser
 */
if (! Date.now) {
  Date.now = function() {
    var l_date = new Date();
    return l_date.getTime();
  };
}



/**
 * Logs a message to the console
 *
 * @todo should this go into jquery extensions?
 */
function trace(data, depth) {

  var error = new Error(),
      stack = '',
      info = '',
      file ='',
      line = '',
      readable = null;

  //makes an object readable only to first level
  readable = function(data) {
    var output = '';
    if (typeof data == 'object') {
      output += "Object\n";
      for (var a in data) {
        if (typeof data[a] != 'function') output += '  '+ a +' : '+ data[a] +";\n";
      }
    }
    else {
      output = data;
    }
    return output;
  };

  //look for a console first
  if (console) {
    //some browsers dont have a stack trace here
    if (error.stack) {
      stack = error.stack.split("\n")[depth || 1];
      info = stack.split('/').pop().split(':');
      file = info[0].replace(/\?.+/g, '');
      line = info.pop();

      console.group(file +' (line '+ line +')');
      console.log(data);
      console.groupEnd();
    }
    else {
      console.log(readable(data));
    }
  }
  else {
    alert(readable(data));
  }
}



/**
 * Like the php method, checks for empty data
 *
 * @todo should this go into jquery extensions?
 */
function empty(p_data) {
  //is it an object or array
  if (typeof p_data === 'object') {
    for (var key in p_data) {
      if (p_data.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
  //is it undefined
  else if (typeof p_data === 'undefined') {
    return true;
  }
  //does it have a falsey value
  else {
    switch (p_data) {
      case false:
      case null:
      case '':
      case 0:
        return true;
    }
  }
  return false;
}



/**
 * Change style of ordered list numbers
 * @todo make this a jquery plugin
 */
//function styleLists(p_styles) {
//  var $lists = $('ul, ol'),
//      $li = $lists.find('li'),
//      new_styles = {
//        'font-weight' : 'bold',
//        'font-style'  : 'italic',
//        'font-size'   : '16px',
//        'color'       : '#999999'
//      },
//      l_styles = (p_styles != undefined) ? p_styles : new_styles,
//      old_styles = {
//        'font-weight' : $lists.css('font-weight'),
//        'font-style'  : $lists.css('font-style'),
//        'font-size'   : $lists.css('font-size'),
//        'color'       : $lists.css('color')
//      };
//  //add new styles to ol tag
//  $lists.css(l_styles);
//  //add p tags inside li tags
//  $li.wrapInner('<span/>');
//  //add old styles back to li tags
//  $li.find('span').css(old_styles);
//}





/**
 * Creates a dom element
 *
 * @todo should this go into jquery extensions?
 *
 * @param p_element
 *    The type of element (eg. div, h1), This can also be an input type
 * @param p_id
 *    Optional - Add an id attribute (and name attribute on an input element)
 * @param p_classes
 *    Optional - Add some classes to the element
 * @param p_attributes
 *    Optional -
 * @return
 *    A jQuery wrapped element
 */
function $$(p_element, p_id, p_classes, p_attributes) {
  //p_element can also be a form input type, check that first
  var $element,
      l_formElements = ['checkbox', 'file', 'hidden', 'image',
                      'password', 'radio', 'reset', 'submit', 'text'];

  if (l_formElements.indexOf(p_element) > -1) {
    $element = $(document.createElement('input')).attr('type', p_element);
    if (p_id) {
      $element.attr({ id:p_id, name:p_id });
    }
  }
  else {
    $element = $(document.createElement(p_element));
    if (p_id) {
      $element.attr('id', p_id);
    }
  }
  //add the class name(s) to the element
  if (p_classes) {
    $element.attr('class', p_classes);
  }
  //add any extra attributes if passed through
  if (p_attributes) {
    $element.attr(p_attributes);
  }

  return $element;
}





/*
 * --------------------------------
 * Custom jQuery library extensions
 * --------------------------------
 */
jQuery.extend({

  /**
   * Generates a random alphanumeric string
   */
  randomString: function(p_length) {

    var l_length = p_length || 10,
        l_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
        l_count = l_chars.length,
        l_string = '';

    for (var i = 0; i < l_length; i++) {
      l_string += l_chars.charAt(Math.floor(Math.random() * l_count));
    }

    return l_string;
  },



  /**
   * Loads a javascript file (from the cache if it's available)
   */
  loadScript: function(file, callback) {
    $.ajax({
      dataType: 'script',
      cache: true,
      url: file +'?cacheBuster='+ _app.structure.course.settings.cache_buster,
      complete: callback
    });
  }
});





/*
 * ---------------------
 * Custom jQuery plugins
 * ---------------------
 */
(function($) {

  /**
   * Turns a div into a hide-able panel
   */
  $.fn.transcript = function(direction, dimensions, id, open) {

    return this.each(function() {

      var $this = $(this),
          $content = $(document.createElement('div')).addClass('transcript-content').attr('id', id +'-description'),
          $button = $(document.createElement('a')).attr('href', '#').addClass('transcript-button'),
          showing = true,
          l_showText = '<span>Show Transcript</span>',
          l_hideText = '<span>Hide Transcript</span>',
          l_contentHeight = 0,
          l_animate = 0,
          l_open = open === false ? false : true;

      //add class name
      $this.addClass('transcript open '+ direction);

      //styles
      $this.css({
        width: dimensions.width +'px',
        height: dimensions.height +'px',
        float: 'left',
        position: 'relative',
        overflow: 'hidden'
      });

      if (dimensions.top !== undefined && dimensions.left !== undefined) {
        $this.css({
          position: 'absolute',
          top: dimensions.top +'px',
          left: dimensions.left +'px'
        });
      }

      $content.css({
        float: 'left',
        padding: '10px',
        overflow: 'auto',
        backgroundColor: '#E6E6E6',
        color: '#000000'
      });

      $button.css({
        display: 'block',
        overflow: 'hidden',
        float: 'left',
        backgroundColor: '#404040',
        color: '#FFFFFF'
      });

      switch (direction) {
        //open down
        case 'down':
          $this.css({
            maxHeight: dimensions.height +'px'
          });

          $content.css({
            width: (dimensions.width - 20) +'px',
            maxHeight: (dimensions.height - 20 - 33) +'px'
          });

          $button.html(l_hideText).css({
            width: '100%',
            height: '28px'
          });

          //insert content and button
          $this.wrapInner($content).append($button);
          l_contentHeight = $content.height();
          l_animate = dimensions.height - 33;

          //hide the panel if selected so in course settings
          if (_app.structure.course.description_panel === '0' || ! l_open) {
            $button.html(l_showText);
            $content = $this.find('.transcript-content');

            //clone the content to get the height
            var $clone = $content.clone();
            _app.$page.append($clone);
            l_contentHeight = $clone.height();
            $clone.remove();

            $content.css({
              height: 0,
              paddingTop: 0,
              paddingBottom: 0
            });
            $this.removeClass('open');
            showing = false;
          }

          //click listener
          $button.click(function() {
            $content = $this.find('.transcript-content');
            if (showing) {
              //swap out button
              $button.html(l_showText);
              //capture content height as it may be less than max height
              //and need to open back up to that height
              l_contentHeight = $content.height();
              //hide the panel
              $content.animate({
                height: 0,
                paddingTop: 0,
                paddingBottom: 0
              },
              200,
              function() {
                $this.removeClass('open');
              });
              showing = false;
            }
            else {
              //swap out button
              $button.html(l_hideText);
              //slide down panel
              $content.animate({
                height: l_contentHeight +'px',
                paddingTop: '10px',
                paddingBottom: '10px'
              },
              200,
              function() {
                //focus on content
                $this
                  .addClass('open')
                  .find('.transcript-content').attr('tabindex', '-1').focus();
              });
              showing = true;
            }
            return false;
          });
          break;

        //open right
        case 'right':
          $content.css({
            width: (dimensions.width - 20 - 33) +'px',
            height: (dimensions.height - 20) +'px'
          });

          $button.html(l_hideText).css({
            width: '28px',
            height: '100%'
          });

          //insert content and button
          $this.wrapInner($content).append($button);
          l_animate = dimensions.width - 33;

          //hide the panel if selected so in course settings
          if (_app.structure.course.description_panel == '0') {
            $button.html(l_showText);
            $this.css('left', l_animate * -1).removeClass('open');
            showing = false;
          }

          //click listener
          $button.click(function() {
            if (showing) {
              //swap out the button
              $button.html(l_showText);

              //hide the panel
              $this.animate({ left: '-='+ l_animate +'px' },
              200,
              function() {
                $this.removeClass('open');
              });
              showing = false;
            }
            else {
              //swap out the button
              $button.html(l_hideText);

              //show the panel
              $this.animate({ left: '+='+ l_animate +'px' },
              200,
              function() {
                //focus on content
                $this
                  .addClass('open')
                  .find('.transcript-content').attr('tabindex', '-1').focus();
              });
              showing = true;
            }
            return false;
          });
          break;
      }
    });
  };



  /**
   * Creates a tooltip that will display above the attached element on click
   */
  $.fn.tooltip = function(text, classes) {
    return this.each(function() {

      var $this = $(this),
          offset = $this.offset(),
          $body = $('body'),
          $document = $(document),
          bodyLeft = parseInt($body.css('margin-left'), 10),
          bodyTop = parseInt($body.css('margin-top'), 10),
          position = {},
          classNames = classes ? classes +' tooltip' : 'tooltip',
          $tooltip = $(document.createElement('div')).addClass(classNames).attr({ role:'dialog' }),
          $box = $(document.createElement('div')).addClass('box'),
          $content = $(document.createElement('div')).addClass('content').attr({ tabindex:'-1' }),
          $point = $(document.createElement('div')).addClass('point');

      //remove any tooltips on the page
      $body.find('.tooltip').remove();

      if ($body.data('tooltip-showing')) {
        $body.data('tooltip-showing', false);
      }
      else {
        //build tooltip html...
        $tooltip.append($box.html($content.html(text))).append($point);
        $body.append($tooltip);

        //calculate position
        position.top = offset.top - bodyTop - $tooltip.height();
        position.left = offset.left - bodyLeft - ($tooltip.width() / 2) + ($this.width() / 2);

        //check top boundary
        if (position.top < -5) {
          position.top = -5;
        }
        //check right boundry
        if (position.left + $tooltip.width() > $body.width()){
          position.newLeft = $body.width() - $tooltip.width();
          position.difference = position.left - position.newLeft;
          //reposition point
          $point.css('left', parseInt($point.css('left'), 10) + position.difference);
          position.left = position.newLeft;
        }

        //position it
        $tooltip.css({
          left: Math.round(position.left),
          top: Math.round(position.top),
          outline: 'none',
          display: 'none'
        })
        .fadeIn(100, function() {
          //focus screen reader on tooltip
          $content.focus();

          //close the box on page click
          $body.bind('click.tooltip', function() {
            $tooltip.trigger('close');
          });

          //close the tooltip when tab, enter or esc is pressed
          $document.bind('keydown.tooltip', function(e) {
            switch (e.keyCode) {
              case 9:
              case 13:
              case 27:
                $tooltip.trigger('close');
                break;
            }
          });

          //turn on showing switch
          $body.data('tooltip-showing', true);
        });

        //close listener
        $tooltip.bind('close', function() {
          $tooltip.fadeOut(100);
          setTimeout(function() {
            $this.focus();
            $body.data('tooltip-showing', false).unbind('click.tooltip');
            $document.unbind('keydown.tooltip');
          }, 100);
        });
      }
    });
  };



  /**
   * Looks for focusable elements and removes them from the tabindex
   */
  $.fn.disableFocus = function() {
    return this.each(function() {

      var $this = $(this),
          focusable = 'a[href], area[href], input, select, textarea, button, iframe, [tabindex], [contentEditable]',
          $focusable = $this.find(focusable).filter(':visible');

      // Add the given element to the list if need be
      if ($this.is(focusable)) {
        $focusable.add(this);
      }

      // Now that we have our list we can set some data attributes
      // to retrieve on enablement and of course unset the tabindex
      $focusable.each(function(i) {
        this.setAttribute('data-disabled-focus', true);
        this.setAttribute('data-original-focus', this.getAttribute('tabindex'));
        this.setAttribute('tabindex', -1);
      });
    });
  };



  /**
   * Looks for previously disabled focusable elements and returns them to their original state
   */
  $.fn.enableFocus = function() {
    return this.each(function() {

      var $this = $(this),
          disabled = '[data-disabled-focus]',
          $disabled = $this.find(disabled);

      // Add the given element to the list if need be
      if ($this.is(disabled)) {
        $disabled.add(this);
      }

      // Replace original tabindex if there was one and remove our other attributes we added
      $disabled.each(function() {
        if (this.dataset) {
          if (this.dataset.originalFocus === 'null') {
            this.removeAttribute('tabindex');
          }
          else {
            this.setAttribute('tabindex', this.dataset.originalFocus);
          }
        }
        this.removeAttribute('data-disabled-focus');
        this.removeAttribute('data-original-focus');
      });
    });
  };




  /**
   * Disables an element
   */
  $.fn.disable = function(customStyles) {
    return this.each(function() {

      var $this = $(this),
          store = {},
          newStyles = $.extend({ opacity:0.5 }, customStyles),
          events = $._data(this, 'events'),
          stopEvents = function(e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            return false;
          };

      //check if this element is already disabled
      if ($this.data('mp-disabled')) return;

      //animate the visual disabling
      this.style.transition = 'all 0.3s';

      //store references
      store = {
        title: $this.attr('title'),
        tabindex: $this.attr('tabindex'),
        styles: $this.attr('style')
      };

      //remove focus and add disabled look etc.
      $this
        .data('mp-disabled', store)
        .attr( 'tabindex', '-1')
        .prop('disabled', true)
        .removeAttr('title')
        .addClass('disabled')
        .css(newStyles);

      // The following rule could replace event detaching
      // but it lacks support in IE<11/Opera and it can't be feature detected
      this.style.pointerEvents = 'none';

      //remove and save a reference to any attached events
      if (events) {
        $.each(events, function(type, definition) {
          $.each(definition, function(index, event) {
            if (event.handler.toString() !== stopEvents.toString()) {
              if (! $._mpDisabled) $._mpDisabled = {};
              $._mpDisabled[event.guid] = event.handler;
              event.handler = stopEvents;
            }
          });
        });
      }

      // //disable all child elements too
      // $this.children().each(function() {
      //   $(this).disable({ opacity:newStyles.opacity });
      // });
    });
  };



  /**
   * Enables a disabled element
   */
  $.fn.enable = function(customStyles) {
    return this.each(function() {

      var $this = $(this),
          stored = $this.data('mp-disabled') || {},
          events = $._data(this, 'events'),
          stopEvents = function(e) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            return false;
          };

      //restore former attributes
      if (stored.title) {
        $this.attr('title', stored.title);
      }
      if (stored.tabindex) {
        $this.attr('tabindex', stored.tabindex);
      }
      else {
        $this.removeAttr('tabindex');
      }
      if (stored.styles) {
        $this.attr('style', stored.styles);
      }
      else {
        $this.removeAttr('style');
      }
      $this.removeData('mp-disabled').removeProp('disabled').removeClass('disabled');

      // The following rule could replace event detaching
      // but it lacks support in IE<11/Opera and it can't be feature detected
      this.style.pointerEvents = 'auto';

      //restore any attached events
      if (events) {
        $.each(events, function(type, definition) {
          $.each(definition, function(index, event) {
            if (event.handler.toString() === stopEvents.toString()) {
              event.handler = $._mpDisabled[event.guid];
              delete $._mpDisabled[event.guid];
            }
          });
        });
      }

      // //enable all child elements too
      // $.each($this.children(), function() {
      //   $(this).enable({ opacity:newStyles.opacity });
      // });
    });
  };



  /**
   * Scales an image element to given dimensions
   */
  $.fn.scaleDimensions = function(p_dimensions) {

    return this.each(function() {

      var $this = $(this),
          l_originalWidth = $this.width(),
          l_originalHeight = $this.height(),
          l_maxWidth = p_dimensions.width || 0,
          l_maxHeight = p_dimensions.height || 0,
          l_scale = Math.max(l_maxWidth / l_originalWidth, l_maxHeight / l_originalHeight),
          l_scaledWidth = Math.round(l_originalWidth * l_scale),
          l_scaledHeight = Math.round(l_originalHeight * l_scale),
          l_fill = p_dimensions.fill || false,
          l_marginLeft = 0,
          l_marginTop = 0;

      //update the elements dimensions
      $this.width(l_scaledWidth).height(l_scaledHeight);
      //check fill property
      if (l_fill) {
        //update margins as to center it within dimensions given
        //(presuming your wrapping element has hidden overflow and same max dimensions)
        l_marginLeft = Math.round((l_maxWidth - l_scaledWidth) / 2);
        l_marginTop = Math.round((l_maxHeight - l_scaledHeight) / 2);
        $this.css({
          marginLeft: l_marginLeft,
          marginTop: l_marginTop
        });
      }
    });
  };



  /**
   * Detects if the element has a vertical scroll bar showing
   */
  $.fn.hasVerticalScroll = function() {
    var element = this.get(0);
    return element.clientHeight < element.scrollHeight;
  };



  /**
   * Looks down the DOM branch to find an element with raw text inside it
   */
  $.fn.findFirstText = function() {

    var children = this.children(),
        count = children.length,
        $child = [],
        childHTML = '',
        $search = [];

    //loop through each child element
    for (var i = 0; i < count; i++) {
      $child = $(children[i]);

      if ($child.is(':visible')) {
        childHTML = $child.html();

        //check if the inner html doesnt have an opening tag
        if (childHTML !== '' && childHTML[0] !== '<') {
          return $child;
        }
        else {
          //nothing found at this level - go deeper. like inception
          $search = $child.findFirstText();

          //make sure the search didnt return itself
          if ($search.get(0) !== $child.get(0)) {
            return $search;
          }
        }
      }
    }

    //nothing found
    return this;
  };



  /**
   * Searches for an element that can recieve focus within the given DOM branch
   *
   * @todo should we search for elements with tabindex attr?
   */
  $.fn.findFirstFocusable = function() {
    return this.find('a, input, select, textarea').filter(':visible').eq(0);
  };

})(jQuery);
