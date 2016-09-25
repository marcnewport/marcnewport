module.exports = function() {

  var $projects = $('#projects');

  $('body').on('click.project', '.project-link', function(e) {
    // modalShowing = true;
    $(this.dataset.target).modal('show');
  });

  $('.project-modal').on('shown.bs.modal', function(e) {
    modalShowing = true;
  });

  $('.project-modal').on('hidden.bs.modal', function(e) {
    modalShowing = false;
  });
}
