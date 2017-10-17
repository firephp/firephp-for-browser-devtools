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
                                    "@panels": {
                                        "@fireconsole": {
                                            "messages": [
                                                "Hello World!"
                                            ]
                                        },
                                        "@settings": {}
                                    }
                                },
                                "reps": {
                                    "panels": "$__DIRNAME__/../../src/panels.rep.js",
                                    "settings": "$__DIRNAME__/../../src/settings.rep.js",
                                    "fireconsole": "/dl/source/github.com~fireconsole~fireconsole.rep.js/src/fireconsole.rep.js"
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
                    "@panels": {
                        "@fireconsole": {
                            "messages": [
                                "Hello World!"
                            ]
                        },
                        "@settings": {}
                    }
                },
                "reps": {
                    "panels": "$__DIRNAME__/../../src/panels.rep.js",
                    "settings": "$__DIRNAME__/../../src/settings.rep.js",
                    "fireconsole": "/dl/source/github.com~fireconsole~fireconsole.rep.js/src/fireconsole.rep.js"
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
