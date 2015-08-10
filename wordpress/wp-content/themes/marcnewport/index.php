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
