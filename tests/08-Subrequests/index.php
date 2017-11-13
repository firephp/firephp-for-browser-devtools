<?php

require_once 'vendor/firephp/firephp-core/lib/FirePHPCore/FirePHP.class.php';

/* NOTE: You must have Output Buffering enabled via
        ob_start() or output_buffering ini directive. */
$firephp = FirePHP::getInstance(true);


if ($_GET['context'] === 'ajax') {

    $firephp->fb('Hello from ajax');

} else
if ($_GET['context'] === 'iframe-ajax') {

    $firephp->fb('Hello from iframe-ajax');

} else
if ($_GET['context'] === 'iframe') {

    $firephp->fb('Hello from iframe');

    echo('<script>window.fetch("?context=iframe-ajax");</script>');
    echo('<img src="?context=iframe-img"></img>');

} else
if ($_GET['context'] === 'img') {

    $firephp->fb('Hello from img');

} else
if ($_GET['context'] === 'iframe-img') {

    $firephp->fb('Hello from iframe-img');
        
} else {

    $firephp->fb('Hello from page');

    echo('<script>window.fetch("?context=ajax");</script>');
    echo('<iframe src="?context=iframe"></iframe>');
    echo('<img src="?context=img"></img>');
    
    echo("FirePHP formatted messages sent in HTTP response headers.");
}
