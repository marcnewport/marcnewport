var assert = require("assert");
var $home = require("../assets/scripts/main.js").$home;

describe('Main', function() {
  it('should have home', function() {
    //var $home = { length:1 };
    assert.equal('object', typeof $home);
  });
});
