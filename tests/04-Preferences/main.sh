#!/usr/bin/env bash.origin.script

depend {
    "webext": "@com.github/pinf-to/to.pinf.org.mozilla.web-ext#s1"
}

CALL_webext run {
    "manifest": {
        "permissions": [
            "webRequest",
            "<all_urls>"
        ],
        "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'; img-src 'self'",
        "devtools": {
            "panels": [
                {
                    "devtools.js": {
                        "label": "FirePHP",
                        "icon": "$__DIRNAME__/../../src/skin/Logo.png",
                        "code": {
                            "@github.com~jsonrep~jsonrep#s1": {
                                "page": {
                                    "@announcer": {
                                        "message": "Hello World!"
                                    }
                                },
                                "reps": {
                                    "announcer": function /* CodeBlock */ () {

                                        exports.main = function (JSONREP, node) {

                                            setTimeout(function () {

                                                console.log("Check DOM and report /stop status to test runner server.");

                                            }, 500);

                                            return JSONREP.markupNode(node);
                                        };
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
        "^/": {
            "@github.com~jsonrep~jsonrep#s1": {
                "page": {
                    "@announcer": {
                        "message": "Hello World!"
                    }
                },
                "reps": {
                    "announcer": function /* CodeBlock */ () {

                        exports.main = function (JSONREP, node) {

                            setTimeout(function () {

                                console.log("Check DOM and report /stop status to test runner server.");

                            }, 500);

                            return JSONREP.markupNode(node);
                        };
                    }
                }
            }
        }
    },
    "expect": {
        "exit": true,
        "conditions": [
            {
                "@it.pinf.org.mochajs#s1": {
                    "suites": [
                        "devtools",
                        "page"
                    ]
                }
            }        
        ]
    }
}

echo "OK"
