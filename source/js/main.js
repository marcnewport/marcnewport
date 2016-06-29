var utils = require('./utils');
// var home = require('./home');

var footer = require('./footer');

utils();

(function($) {

  global.$document = $(document);

  $document.ready(function() {

    'use strict';

    // home();

    footer();
  });
}(jQuery));
