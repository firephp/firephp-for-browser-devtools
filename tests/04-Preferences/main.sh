#!/usr/bin/env bash.origin.script

depend {
    "webext": "@com.github/pinf-to/to.pinf.org.mozilla.web-ext#s1"
}

CALL_webext run {
    "manifest": {
        "permissions": [
            "tabs",
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
                    "background.js": {
                        "@it.pinf.org.browserify#s1": {
                            "src": "$__DIRNAME__/../../src/background.js",
                            "prime": true,
                            "format": "pinf"
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
                                    "@panels": {
                                        "@settings": {},
                                        "@fireconsole": {
                                            "plugins": {
                                                "@message-listener": {}
                                            }
                                        }
                                    }
                                },
                                "reps": {
                                    "panels": "$__DIRNAME__/../../src/panels.rep.js",
                                    "settings": "$__DIRNAME__/../../src/settings.rep.js",
                                    "fireconsole": "$__DIRNAME__/../../node_modules/fireconsole.rep.js/src/fireconsole.rep.js",
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
        "^/$": (javascript () >>>

            return function (req, res, next) {

                if (
                    req.headers["x-firephp-version"] ||
                    /\sFirePHP\/([\.|\d]*)\s?/.test(req.headers["user-agent"])
                ) {

                    res.writeHead(200, {
                        'X-Wf-Protocol-1': 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2',
                        'X-Wf-1-Plugin-1': 'http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.0.0master1106021548',
                        'X-Wf-1-Structure-1': 'http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1',
                        'X-Wf-1-1-1-1': '63|[{"Type":"LOG","File":"/path/to/file","Line":10},"Hello World"]|',
                        'X-Wf-1-Index': '1'
                    });

                    res.end("FirePHP Core formatted messages sent in HTTP response headers.");
                } else {

                    res.end("No FirePHP HTTP request headers found.");
                }
            };
        <<<)
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
