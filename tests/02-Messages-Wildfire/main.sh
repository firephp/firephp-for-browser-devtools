#!/usr/bin/env bash.origin.script

depend {
    "webext": "@com.github/pinf-to/to.pinf.org.mozilla.web-ext#s1"
}

echo "TEST_MATCH_IGNORE>>>"

CALL_webext run {
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

                                            WILDFIRE.once("error", done);

                                            WILDFIRE.on("message.firephp", function (message) {

                                                chai.assert.equal(message.meta, "{\"msg.preprocessor\":\"FirePHPCoreCompatibility\",\"target\":\"console\",\"lang.id\":\"registry.pinf.org/cadorn.org/github/renderers/packages/php/master\",\"priority\":\"log\",\"file\":\"/path/to/file\",\"line\":10}");
                                                chai.assert.equal(message.data, "\"Hello World\"");
                                                chai.assert.equal(message.receiver, "http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1");
                                                chai.assert.equal(message.sender, "http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.0.0master1106021548");

                                                done();
                                            });

                                            browser.tabs.reload();
                                        });
                                    });
                                }
                            },
                            "babel": {
                                "presets": {
                                    "@babel/preset-env": {
                                        "targets": "last 1 Firefox versions"
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        }
    },
    "routes": {
        "^/$": (javascript () >>>

            return function (req, res, next) {

                res.writeHead(200, {
                    'X-Wf-Protocol-1': 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2',
                    'X-Wf-1-Plugin-1': 'http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.0.0master1106021548',
                    'X-Wf-1-Structure-1': 'http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1',
                    'X-Wf-1-1-1-1': '63|[{"Type":"LOG","File":"/path/to/file","Line":10},"Hello World"]|',
                    'X-Wf-1-Index': '1'
                });

                res.end("FirePHP Core formatted messages sent in HTTP response headers.");
            };
        <<<),
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
