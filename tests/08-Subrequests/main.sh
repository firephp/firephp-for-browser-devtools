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
                                    "@layout": {
                                        "console": {
                                            "@console": {
                                                "@fireconsole": {
                                                }
                                            }
                                        },
                                        "menu": {
                                            "@menu": {}
                                        },
                                        "settings": {
                                            "@enabler": {}
                                        },
                                        "inspector": {
                                            "@inspector": {}
                                        },
                                        "manage": {
                                            "@manage": {
                                                "settings": {
                                                    "@settings": {}
                                                }
                                            }
                                        }
                                    }
                                },
                                "reps": {
                                    "layout": "$__DIRNAME__/../../src/layout.rep.js",
                                    "menu": "$__DIRNAME__/../../src/menu.rep.js",
                                    "settings": "$__DIRNAME__/../../src/settings.rep.js",
                                    "manage": "$__DIRNAME__/../../src/manage.rep.js",
                                    "inspector": "$__DIRNAME__/../../src/inspector.rep.js",
                                    "fireconsole": "$__DIRNAME__/../../node_modules/fireconsole.rep.js/src/fireconsole.rep.js",
                                    "console": "$__DIRNAME__/../../src/console.rep.js",
                                    "enabler": "$__DIRNAME__/../../src/enabler.rep.js"
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

echo "<<<TEST_MATCH_IGNORE"

echo "OK"

echo "TEST_MATCH_IGNORE>>>"

CALL_php stop "${port}"
