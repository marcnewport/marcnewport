/**
 * When the page has loaded, start up the application
 *
 * @author marc.newport@ninelanterns.com.au
 * @copyright Nine Lanterns 2013
 * @version 2.0
 */
var _app = new Application();

//overwrite properties here
//_app.dimensions.layout = 'fluid';
//_app.navigation = 'top';

$(document).ready(function() {
  _app.start();
});
