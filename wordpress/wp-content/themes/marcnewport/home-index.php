<section id="home" style="background-image:linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0)), url('<?php print wp_get_attachment_url(get_post_thumbnail_id($post->ID)); ?>');">
  <!-- <video autoplay loop poster="media/melbourne-night.jpg" class="img-bg" >
    <source src="media/test-video.mp4" type="video/mp4">
  </video> -->

  <div class="container">
    <?php the_content(); ?>
  </div>
</section>
