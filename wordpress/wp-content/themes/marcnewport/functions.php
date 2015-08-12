<?php

function mn_scripts() {
  wp_enqueue_style('bootstrap', 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.min.css', false, '3.3.4');
  wp_enqueue_style('lato', 'http://fonts.googleapis.com/css?family=Lato:900', false, '1.0');
  wp_enqueue_style('opensans', 'http://fonts.googleapis.com/css?family=Open+Sans:700,400', false, '1.0');
  wp_enqueue_style('devicon', 'https://cdn.rawgit.com/konpa/devicon/89f2f44ba07ea3fff7e561c2142813b278c2d6c6/devicon.min.css', false, '1.0');

  wp_enqueue_script('modernizr', '//cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js', false, '2.8.3');
  wp_enqueue_script('typekit', '//use.typekit.net/fsl5mgj.js', false, '1.0');
  wp_enqueue_script('typekit-init', get_template_directory_uri() .'/js/typekit-init.js', array('typekit'), '1.0');
}
add_action('wp_enqueue_scripts', 'mn_scripts');


function trace($log) {
  if (is_object($log) || is_array($log)) {
    print '<pre>'. print_r($log, 1) .'</pre>';
  }
  else {
    print '<pre>'. $log .'</pre>';
  }
}
