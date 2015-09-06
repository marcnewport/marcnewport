<section id="projects" class="container-fluid">
  <div class="container">

    <?php the_content(); ?>

    <div class="row">

      <div class="window">
        <div class="window-header">
          <span class="window-button window-button-red"></span>
          <span class="window-button window-button-orange"></span>
          <span class="window-button window-button-green"></span>
        </div>
        <div class="window-view">

          <div id="projects-carousel" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner" role="listbox">
              <?php
              $query = array(
                'post_type' => 'project',
                'order_by' => 'menu_order'
              );

              $projects = new WP_Query($query);
              $projects2 = new WP_Query($query);
              $indicators = array();
              $i = 0;

              if ($projects->have_posts()) {

                while ($projects->have_posts()) {
                  $projects->the_post();
                  $active = $i < 1 ? 'active' : '';

                  //print out carousel items
                  print '<div class="item '. $active .'">';
                  print '<a href="#" data-toggle="modal" data-target="#project-'. $post->ID .'-modal">';
                  the_post_thumbnail('large', array('class' => 'img-responsive'));
                  print '</a></div>';

                  //gather indicator html to print out later
                  $indicators[] = '<li data-target="#projects-carousel" data-slide-to="'. $i .'" class="'. $active .'"></li>';
                  $i++;
                }
              }
              ?>
            </div>

            <ol class="carousel-indicators">
              <?php print implode('', $indicators); ?>
            </ol>

            <!-- Controls -->
            <!-- <a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">
              <span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next">
              <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a> -->
          </div>
        </div>
      </div>

      <?php
      //print out modal windows
      //@TODO put in own template
      ?>

      <?php if ($projects2->have_posts()) : ?>
        <?php while ($projects2->have_posts()) : ?>
          <?php $projects2->the_post(); ?>

          <div id="project-<?php print $post->ID; ?>-modal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class="modal-body">
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>

                  <?php the_post_thumbnail('large', array('class' => 'img-responsive')); ?>
                  <h4><?php the_title(); ?></h4>
                  <?php the_content(); ?>

                </div>
              </div>
            </div>
          </div>

        <?php endwhile; ?>
      <?php endif; ?>

    </div>
  </div>

</section>
