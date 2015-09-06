<?php

add_theme_support('post-thumbnails', array('post', 'page', 'project'));
add_theme_support('title-tag');



/**
 *
 */
function mn_post_types() {

  $labels = array(
		'name' => 'Projects',
		'singular_name' => 'Project',
		'menu_name' => 'Projects',
		'name_admin_bar' => 'Projects',
		'parent_item_colon' => '',
		'all_items' => 'All Projects',
		'add_new_item' => 'Add New Project',
		'add_new' => 'Add New',
		'new_item' => 'New Project',
		'edit_item' => 'Edit Project',
		'update_item' => 'Update Project',
		'view_item' => 'View Project',
		'search_items' => 'Search Project',
		'not_found' => 'Not found',
		'not_found_in_trash' => 'Not found in Trash',
	);

	$args = array(
		'label' => 'Project',
		'labels' => $labels,
		'supports' => array('title', 'editor', 'author', 'thumbnail', 'revisions', 'custom-fields', 'page-attributes', 'post-formats'),
		'taxonomies' => array('category', 'post_tag'),
		'hierarchical' => false,
		'public' => true,
		'show_ui' => true,
		'show_in_menu' => true,
		'menu_position' => 5,
		'menu_icon' => 'dashicons-book',
		'show_in_admin_bar' => true,
		'show_in_nav_menus' => true,
		'can_export' => true,
		'has_archive' => true,
		'exclude_from_search' => false,
		'publicly_queryable' => true,
		'rewrite' => array('slug' => 'product', 'with_front' => true, 'pages' => true, 'feeds' => true),
		'capability_type' => 'post',
	);

	register_post_type('project', $args);
}
add_action('init', 'mn_post_types');



/**
 *
 */
function mn_scripts() {
  //add stylesheets to header
  wp_enqueue_style('bootstrap', 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/css/bootstrap.min.css', false, '3.3.4');
  wp_enqueue_style('lato', 'http://fonts.googleapis.com/css?family=Lato:900', false, '1.0');
  wp_enqueue_style('opensans', 'http://fonts.googleapis.com/css?family=Open+Sans:700,400', false, '1.0');
  wp_enqueue_style('fontawesome', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css', false, '4.4.4');
  wp_enqueue_style('devicon', 'https://cdn.rawgit.com/konpa/devicon/89f2f44ba07ea3fff7e561c2142813b278c2d6c6/devicon.min.css', false, '1.0');
  wp_enqueue_style('main', get_stylesheet_uri(), array('bootstrap', 'lato', 'opensans', 'fontawesome', 'devicon'), '1.0');

  //add scripts to header
  wp_enqueue_script('modernizr', '//cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js', false, '2.8.3');
  wp_enqueue_script('typekit', '//use.typekit.net/fsl5mgj.js', false, '1.0');
  wp_enqueue_script('typekit-init', get_template_directory_uri() .'/js/typekit-init.js', array('typekit'), '1.0');

  //add scripts to footer
  wp_enqueue_script('bootstrap', 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.4/js/bootstrap.min.js', false, '3.3.4', true);
  wp_enqueue_script('googlemaps', 'https://maps.googleapis.com/maps/api/js?v=3.exp', false, '3.0', true);
  wp_enqueue_script('main', get_template_directory_uri() .'/js/main.js', array('jquery-core', 'bootstrap', 'googlemaps'), '1.0', true);
}
add_action('wp_enqueue_scripts', 'mn_scripts');



/**
 *
 */
function trace($log) {
  if (is_object($log) || is_array($log)) {
    print '<pre>'. print_r($log, 1) .'</pre>';
  }
  else {
    print '<pre>'. $log .'</pre>';
  }
}
