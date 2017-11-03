<?php

// Only log once worker reloads page
if ($_SERVER["HTTP_CACHE_CONTROL"] == "max-age=0") {

    require_once 'vendor/firephp/firephp-core/lib/FirePHPCore/FirePHP.class.php';

    /* NOTE: You must have Output Buffering enabled via
            ob_start() or output_buffering ini directive. */
    $firephp = FirePHP::getInstance(true);
    $firephp->fb('Hello World'); /* Defaults to FirePHP::LOG */
    $firephp->fb('Log message'  ,FirePHP::LOG);
    $firephp->fb('Info message' ,FirePHP::INFO);
    $firephp->fb('Warn message' ,FirePHP::WARN);
    $firephp->fb('Error message',FirePHP::ERROR);
    $firephp->fb('Message with label','Label',FirePHP::LOG);

    $arr = array('key1'=>'val1',
    'key2'=>array(array('v1','v2'),'v3'));

    $firephp->fb($arr,'TestArray',FirePHP::LOG);
    $firephp->fb(array('2 SQL queries took 0.06 seconds',array(
    array('SQL Statement','Time','Result'),
    array('SELECT * FROM Foo','0.02',array('row1','row2')),
    array('SELECT * FROM Bar','0.04',array('row1','row2'))
    )),FirePHP::TABLE);

    $firephp->group('Group 1');
        $firephp->fb('Hello World');
        $firephp->group('Group 1');
            $firephp->fb('Hello World');
        $firephp->groupEnd();
    $firephp->groupEnd();

    $firephp->fb($arr,'RequestHeaders',FirePHP::DUMP);
    
    echo("FirePHP formatted messages sent in HTTP response headers.");

}
