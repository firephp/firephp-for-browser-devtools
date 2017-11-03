#!/usr/bin/env bash.origin.script

depend {
    "webext": "@com.github/pinf-to/to.pinf.org.mozilla.web-ext#s1",
    "php": "@com.github/bash-origin/bash.origin.php#s1",
    "process": "@com.github/bash-origin/bash.origin.process#s1"
}

echo "TEST_MATCH_IGNORE>>>"

CALL_php composer install


local port="$(CALL_process free_port)"
echo "PHP server port: ${port}"

CALL_php start "${port}"


CALL_webext run {
    "homepage": ":${port}/",
    "manifest": {
        "permissions": [
            "storage",
            "webRequest",
            "webRequestBlocking",            
            "<all_urls>"
        ],
        "background": {
            "scripts": [
                {
                    "worker.js": {
                        "@it.pinf.org.mochajs#s1": {
                            "suite": "worker",
                            "apiBaseUrl": "/tests",
                            "tests": {
                                "01-HelloWorld": function /* CodeBlock */ () {

                                    var WILDFIRE = require("$__DIRNAME__/../../src/wildfire");
                                    WILDFIRE.forcedEnable(true);

                                    describe('Wait for messages', function () {
                                        this.timeout(5 * 1000);

                                        it('received', function (done) {

                                            WILDFIRE.on("message.chromelogger", function (message) {

                                                chai.assert.equal(message.rows.length, 3);
                                                chai.assert.equal(message.rows[0][0][0], "Hello console!");
                                                chai.assert.equal(message.rows[2][0][0], "something went wrong!");
                                                chai.assert.equal(message.rows[2][2], "warn");

                                                done();
                                            });

                                            browser.tabs.reload();
                                        });
                                    });
                                }
                            }
                        }
                    }
                }
            ]
        }
    },
    "routes": {
        "^/tests": {
            "@it.pinf.org.mochajs#s1": {}
        }
    },
    "expect": {
        "exit": true,
        "conditions": [
            {
                "@it.pinf.org.mochajs#s1": {
                    "suites": [
                        "worker"
                    ]
                }
            }        
        ]
    }
}

echo "<<<TEST_MATCH_IGNORE"

echo "OK"

echo "TEST_MATCH_IGNORE>>>"

CALL_php stop "${port}"
