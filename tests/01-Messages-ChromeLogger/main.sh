#!/usr/bin/env bash.origin.script

depend {
    "php": "bash.origin.php # runner/v0"
}

echo "TEST_MATCH_IGNORE>>>"

CALL_php composer install


#local port="$(CALL_process free_port)"
# TODO: Get port dynamically and pass to 'pinf.it .'
echo "PHP server port: 3000"

CALL_php start "3000"

pinf.it .

echo "<<<TEST_MATCH_IGNORE"

echo "OK"

echo "TEST_MATCH_IGNORE>>>"

CALL_php stop "3000"
