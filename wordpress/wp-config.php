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
define('AUTH_KEY',         ':&N9)Z7o643KVe%DVCGV-|jt|SF0t,~8O%:hmSKt^,%&:M*ft1,l<?.~DqEEv_o5');
define('SECURE_AUTH_KEY',  '%dtjm(*Y<u>L(3!+59C~RyhYb- mELqs;}w&|pb?C_ENuu7+i;Us6,<BwWLzqi>H');
define('LOGGED_IN_KEY',    'ow?+jP^,{j:A4`6`0-i%7cOwd]z:3&ncb+)LD.!w0b(nOrr07Lb[03R3:B>#}L3^');
define('NONCE_KEY',        '9e|m0tIc6}+w_l-+J[C[DYmUzXONtDFbqqaW,02&S7%KW1sVKzJ-m%&h6H|%-Bv[');
define('AUTH_SALT',        '_7B@}J%.r1j9ytOlT^;XTc]5G6W1kMZm-O,@@U$f/5*LQYVCJf6R,?wh4pdv@sQ ');
define('SECURE_AUTH_SALT', 'Dp(;p#K;_4Y$X&vYpEf^xQ#-)(`&,%s&)!{cnJ!l?;@W#*%~-_I{,f)>nghn[|QR');
define('LOGGED_IN_SALT',   ']m]nfgfAy8|HQ;`vTnGc&wFJ;!D+,:P<Segz<8P+Pmw|83Eg#}HI&(Pz~G]B2e.N');
define('NONCE_SALT',       '{1s~-d&Ez2)]2Nll~Q:61P XDL:SWt}k:V+cH]@EA+&%H%d;kM?|[Ie>d-Udz}P)');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wpmn_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', true);

/**
 * Increase file upload limit
 */
@ini_set('upload_max_filesize', '32M');
@ini_set('post_max_size', '32M');
@ini_set('memory_limit', '64M');
@ini_set('max_execution_time', '300');

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
