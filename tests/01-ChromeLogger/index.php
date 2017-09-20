<?php

require_once 'vendor/ccampbell/chromephp/ChromePhp.php';

ChromePhp::log('Hello console!');
ChromePhp::log($_SERVER);
ChromePhp::warn('something went wrong!');

echo("Chrome Logger formatted messages sent in HTTP headers.");
