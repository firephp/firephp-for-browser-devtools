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
            "webNavigation",
            "webRequestBlocking",            
            "<all_urls>"
        ],
        "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'; img-src 'self'",
        "background": {
            "scripts": [
                {
                    "worker.js": {
                        "@it.pinf.org.mochajs#s1": {
                            "suite": "worker",
                            "apiBaseUrl": "/tests",
                            "tests": {
                                "01-HelloWorld": function /* CodeBlock */ () {

                                    const BACKGROUND = require("$__DIRNAME__/../../src/background");

                                    BACKGROUND.WILDFIRE.forcedEnable(true);

                                    return;

                                    var WILDFIRE = require("$__DIRNAME__/../../src/wildfire");
                                    WILDFIRE.forcedEnable(true);

                                    describe('Wait for messages', function () {
                                        this.timeout(5 * 1000);

                                        it('received', function (done) {

                                            WILDFIRE.once("error", done);

                                            var messages = {
                                                expected: [
                                                    "\"Hello World\"",
                                                    "\"Log message\"",
                                                    "\"Info message\"",
                                                    "\"Warn message\"",
                                                    "\"Error message\"",
                                                    "\"Message with label\"",
                                                    "{\"key1\":\"val1\",\"key2\":[[\"v1\",\"v2\"],\"v3\"]}",
                                                    "{\"data\":[[\"SELECT * FROM Foo\",\"0.02\",[\"row1\",\"row2\"]],[\"SELECT * FROM Bar\",\"0.04\",[\"row1\",\"row2\"]]],\"header\":[\"SQL Statement\",\"Time\",\"Result\"],\"title\":\"2 SQL queries took 0.06 seconds\"}",
                                                    "{\"msg.preprocessor\":\"FirePHPCoreCompatibility\",\"target\":\"console\",\"lang.id\":\"registry.pinf.org/cadorn.org/github/renderers/packages/php/master\",\"group.start\":true,\"group\":\"group-1\",\"file\":\"/03-Messages-FirePHPCore/index.php\",\"line\":28,\"group.title\":\"Group 1\",\"group.expand\":\"group-1\"}",
                                                    "\"Hello World\"",
                                                    "{\"msg.preprocessor\":\"FirePHPCoreCompatibility\",\"target\":\"console\",\"lang.id\":\"registry.pinf.org/cadorn.org/github/renderers/packages/php/master\",\"group\":\"group-2\",\"group.start\":true,\"file\":\"/03-Messages-FirePHPCore/index.php\",\"line\":30,\"group.title\":\"Group 1\",\"group.expand\":\"group-2\"}",
                                                    "\"Hello World\"",
                                                    "{\"msg.preprocessor\":\"FirePHPCoreCompatibility\",\"target\":\"console\",\"lang.id\":\"registry.pinf.org/cadorn.org/github/renderers/packages/php/master\",\"group\":\"group-2\",\"group.end\":true,\"file\":\"/03-Messages-FirePHPCore/index.php\",\"line\":32}",
                                                    "{\"msg.preprocessor\":\"FirePHPCoreCompatibility\",\"target\":\"console\",\"lang.id\":\"registry.pinf.org/cadorn.org/github/renderers/packages/php/master\",\"group\":\"group-1\",\"group.end\":true,\"file\":\"/03-Messages-FirePHPCore/index.php\",\"line\":33}",
                                                    "{\"RequestHeaders\":{\"key1\":\"val1\",\"key2\":[[\"v1\",\"v2\"],\"v3\"]}}"
                                                ],
                                                actual: []
                                            }

                                            WILDFIRE.on("message.firephp", function (message) {

                                                chai.assert.equal(message.sender, "http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.3");

                                                if (message.data === "null") {
                                                    messages.actual.push(message.meta.replace(/"[^"]+\/tests\//g, '"/'));
                                                } else {
                                                    messages.actual.push(message.data);
                                                }

                                                if (messages.actual.length === messages.expected.length) {

                                                    chai.assert.equal(message.receiver, "http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1");
                                                    
                                                    messages.expected.forEach(function (expected, i) {

                                                        chai.assert.equal(messages.actual[i], expected);
                                                    });

                                                    done();

                                                } else {
                                                    chai.assert.equal(message.receiver, "http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1");
                                                }
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
        },
        "devtools": {
            "panels": [
                {
                    "devtools.js": {
                        "label": "FirePHP",
                        "icon": "$__DIRNAME__/../../src/skin/Logo.png",
                        "code": {
                            "@github.com~jsonrep~jsonrep#s1": {
                                "page": {
                                    "@fireconsole": {
                                        "plugins": {
                                            "@message-listener": {}
                                        }
                                    }
                                },
                                "reps": {
                                    "fireconsole": "/dl/source/github.com~fireconsole~fireconsole.rep.js/src/fireconsole.rep.js",
                                    "message-listener": "$__DIRNAME__/../../src/message-listener.rep.js"
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
    "files": {
        "/dist/resources/insight.renderers.default/*": "/dl/source/github.com~fireconsole~fireconsole.rep.js/node_modules/insight.renderers.default/resources"
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
