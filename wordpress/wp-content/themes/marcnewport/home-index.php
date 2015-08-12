<?php
//trace($post);
?>

<section id="home">
  <?php the_post_thumbnail('full', array('class' => 'img-responsive img-bg')); ?>
  <!-- <video autoplay loop poster="media/melbourne-night.jpg" class="img-bg" >
    <source src="media/test-video.mp4" type="video/mp4">
  </video> -->

  <div class="container">

    <?php the_content(); ?>


  </div>
</section>
