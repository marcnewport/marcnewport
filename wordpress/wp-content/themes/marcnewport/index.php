<?php

get_header();
$pages = get_pages(array('sort_column' => 'menu_order'));

?>
<nav class="navbar navbar-inverse navbar-fixed-top">
  <div class="container">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
        <span class="sr-only">Toggle navigation</span>
        <span class="glyphicon glyphicon-menu-hamburger"></span>
      </button>
      <a class="navbar-brand" href="#"><img src="media/logo-tiny-stylized.png" alt="" /></a>
    </div>

    <div id="navbar" class="navbar-collapse collapse">
      <ul class="nav navbar-nav">
        <?php
        foreach ($pages as $page) {
          print '<li><a href="#'. $page->post_name .'">'. $page->post_title .'</a></li>';
        }
        ?>
      </ul>
    </div>
  </div>
</nav>

<?php query_posts(array('post_type' => 'page')); ?>

<?php

while (have_posts()) {
  the_post();

  get_template_part($post->post_name, 'index');
}




// global $wp_query;
// print '<pre>';
// print print_r($wp_query->query_vars, 1);
//
// print '</pre>';
// foreach ($pages as $page) {
//   // print '<section id="'. $page->post_name .'">';
//   $template_path = get_template_directory() .'/page-'. $page->post_name .'.php';
//   get_template_part('page', $page->post_name);
//   // if (file_exists($template_path)) {
//   //   include get_template_directory() .'/page-'. $page->post_name .'.php';
//   // }
//   // print '</section>';
// }
