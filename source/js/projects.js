module.exports = function() {

  var $projects = $('#projects');

  $('body').on('click.project', function(e) {
    $projects.addClass('no-hover');
  });

  $('.project-modal').on('hidden.bs.modal', function(e) {
    $projects.removeClass('no-hover');
  });
}
