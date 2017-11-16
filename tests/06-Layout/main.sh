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
        "devtools": {
            "panels": [
                {
                    "devtools.js": {
                        "label": "FirePHP",
                        "icon": "$__DIRNAME__/../../src/skin/Logo.png",
                        "code": {
                            "@github.com~jsonrep~jsonrep#s1": {
                                "page": {
                                    "@layout": {
                                        "menu": {
                                            "@menu": {}
                                        },
                                        "console": "Console<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line",
                                        "settings": {
                                            "@settings": {}
                                        },
                                        "inspector": "Inspector",
                                        "manage": "Manage"
                                    }
                                },
                                "reps": {
                                    "layout": "$__DIRNAME__/../../src/layout.rep.js",
                                    "menu": "$__DIRNAME__/../../src/menu.rep.js",
                                    "settings": "$__DIRNAME__/../../src/settings.rep.js"
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
                    "@layout": {
                        "menu": {
                            "@menu": {}
                        },
                        "console": "Console<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line<br/>Line",
                        "settings": {
                            "@settings": {}
                        },
                        "inspector": "Inspector",
                        "manage": "Manage"
                    }
                },
                "reps": {
                    "layout": "$__DIRNAME__/../../src/layout.rep.js",
                    "menu": "$__DIRNAME__/../../src/menu.rep.js",
                    "settings": "$__DIRNAME__/../../src/settings.rep.js"
                }
            }
        }
    },
    "files": {
        "/dist/resources/insight.renderers.default/*": "$__DIRNAME__/../../node_modules/fireconsole.rep.js/node_modules/insight.renderers.default/resources"
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

echo "OK"
