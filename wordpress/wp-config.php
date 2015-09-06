<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, and ABSPATH. You can find more information by visiting
 * {@link https://codex.wordpress.org/Editing_wp-config.php Editing wp-config.php}
 * Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress_marcnewport_local');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', 'mysql');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'F0;rx%ka_3qz83):&|jA+F2_-.yT+I7Bpy6i,-<GIuq<)|$D$t5e]IsL)b_z#flc');
define('SECURE_AUTH_KEY',  '-X>6Vp]BB26L_L[+PcmZjza|!h_sh]4aLb4/md>%Tzwik5 C{Him44XogP!B#E1^');
define('LOGGED_IN_KEY',    '{$;&{h:008~IlZw/z9:[C|0q*-R!TWkqA]3cg`|f!D 9oqb<MHS9aZrH<Wn1{yH|');
define('NONCE_KEY',        'P|8V`T6CKhi^-2qLc/VXjlNcl5.==HX6~ cd~_pP/YOL8<cAi{!2v.9Roz@GF1.P');
define('AUTH_SALT',        '_tkPO|>?QJ<I1j?Heb*&-m/&zHuSJibm-mh[NTm[WePFseZ6@?KmKmW&9~]vZ^CO');
define('SECURE_AUTH_SALT', 'So2PW7H(dx7+y=G4,Bc)XNGd9aKb>4W)NYrh VijnRDoZ>Dzdt#6}ta4&I,w]r31');
define('LOGGED_IN_SALT',   '?n<3:ToS:o$w-Grh>]&!F-^olUY~PX^@0Uu4_,KemNR@LN1p0X|RA<?Ut<*]yuWR');
define('NONCE_SALT',       '?5{)]lm=!JYufjx)T-b6_y[m%T@9&[nB|s 1`VIUOZK)VY0<-0Kou%xeO?u,|Psz');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
