module.exports = function() {
  /*
   * Custom methods added to underscore
   */
  _.mixin({
    randomFloat: function(min, max) {
      return Math.max((Math.random() * max), min).toFixed(1);
    }
  });
}
