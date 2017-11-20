#!/usr/bin/env bash.origin.script

depend {
    "webext": "@com.github/pinf-to/to.pinf.org.mozilla.web-ext#s1"
}


CALL_webext run {
    "manifest": {
        "name": "FirePHP",
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
        "content": {
            "scripts": [
                {
                    "matches": [
                        "<all_urls>"
                    ],
                    "js": {
                        "content-script.js": {
                            "@it.pinf.org.browserify#s1": {
                                "src": "$__DIRNAME__/../../src/adapters/page-content-script.js",
                                "prime": true,
                                "format": "pinf"
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
                                    "fireconsole": "$__DIRNAME__/../../node_modules/fireconsole.rep.js/dist/fireconsole.rep.js",
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
        "^/": {
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
                    "fireconsole": "$__DIRNAME__/../../node_modules/fireconsole.rep.js/dist/fireconsole.rep.js",
                    "console": "$__DIRNAME__/../../src/console.rep.js",
                    "enabler": "$__DIRNAME__/../../src/enabler.rep.js"
                }
            }
        },
        "/messages.js": {
            "@it.pinf.org.browserify#s1": {
                "code": function /* CodeBlock */ () {

                    FC.log([
                        "Hello World"
                    ]);
                    FC.log({
                        "Hello": "World"
                    });

                    FC.log({
                        "sender": "http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.3",
                        "receiver": "http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1",
                        "meta": "{\"msg.preprocessor\":\"FirePHPCoreCompatibility\",\"target\":\"console\",\"lang.id\":\"registry.pinf.org/cadorn.org/github/renderers/packages/php/master\",\"priority\":\"log\",\"file\":\"/dl/source/github.com~firephp~firephp-for-firefox-devtools/tests/03-Messages-FirePHPCore/index.php\",\"line\":11}",
                        "data": "\"Hello World\""
                    });

                    FC.log({
                        "sender": "http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.3",
                        "receiver": "http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1",
                        "meta": "{\"msg.preprocessor\":\"FirePHPCoreCompatibility\",\"target\":\"console\",\"lang.id\":\"registry.pinf.org/cadorn.org/github/renderers/packages/php/master\",\"priority\":\"log\",\"label\":\"TestArray\",\"file\":\"/dl/source/github.com~firephp~firephp-for-firefox-devtools/tests/03-Messages-FirePHPCore/index.php\",\"line\":21}",
                        "data": "{\"key1\":\"val1\",\"key2\":[[\"v1\",\"v2\"],\"v3\"]}"
                    });


                    function ensureInspectorPanel () {
                        var el = document.querySelector('BODY > DIV.viewer');
                        if (!el) {
                            el = document.createElement('DIV');
                            el.setAttribute("class", "viewer");
                            document.body.appendChild(el);
                        }
                        return el;
                    }
                    FC.on("inspectMessage", function (info) {
                        FC.renderMessageInto(ensureInspectorPanel(), info.message);
                    });
                    FC.on("inspectNode", function (info) {
                        FC.renderMessageInto(ensureInspectorPanel(), info.message);
                    });


                    var count = 0;

                    function prependLength (msg) {
                        count += 1;
                        return msg.length + "|" + msg;
                    }

                    FC.send([
                        'X-Wf-1-1-1-1: ' + prependLength('[{"Type":"LOG","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"11"},"Hello World"]') + '|',
                        'X-Wf-1-1-1-2: ' + prependLength('[{"Type":"LOG","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"12"},"Log message"]') + '|',
                        'X-Wf-1-1-1-3: ' + prependLength('[{"Type":"INFO","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"13"},"Info message"]') + '|',
                        'X-Wf-1-1-1-4: ' + prependLength('[{"Type":"WARN","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"14"},"Warn message"]') + '|',
                        'X-Wf-1-1-1-5: ' + prependLength('[{"Type":"ERROR","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"15"},"Error message"]') + '|',
                        'X-Wf-1-1-1-6: ' + prependLength('[{"Type":"LOG","Label":"Label","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"16"},"Message with label"]') + '|',
                        'X-Wf-1-1-1-7: ' + prependLength('[{"Type":"LOG","Label":"TestArray","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"21"},{"key1":"val1","key2":[["v1","v2"],"v3"]}]') + '|',

                        'X-Wf-1-1-1-8: ' + prependLength('[{"Type":"TABLE","File":"/tests/03-Messages-FirePHPCore/index.php","Line":26},["2 SQL queries took 0.06 seconds",[["SQL Statement","Time","Result"],["SELECT * FROM Foo","0.02",["row1","row2"]],["SELECT * FROM Bar","0.04",["row1","row2"]]]]]') + '|',
                        'X-Wf-1-1-1-9: ' + prependLength('[{"Type":"EXCEPTION","File":"\/app\/_header.php","Line":17},{"Class":"Exception","Message":"Test Exception","File":"\/app\/_header.php","Line":17,"Type":"throw","Trace":[{"file":"\/app\/_header.php","line":20,"function":"test","args":[{"Hello":"World"}]},{"file":"\/app\/index.php","line":3,"args":["\/app\/_header.php"],"function":"require"}]}]') + '|',
                        'X-Wf-1-1-1-10: ' + prependLength('[{"Type":"TRACE","File":"\/app\/_header.php","Line":25},{"Class":"","Type":"","Function":"fb","Message":"Backtrace to here","File":"\/app\/_header.php","Line":25,"Args":["Backtrace to here","TRACE"],"Trace":[{"file":"\/app\/index.php","line":3,"args":["\/app\/_header.php"],"function":"require"}]}]') + '|',                            
                        
                        'X-Wf-1-1-1-11: ' + prependLength('[{"Type":"GROUP_START","Label":"Group 1","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"28"},null]') + '|',
                        'X-Wf-1-1-1-12: ' + prependLength('[{"Type":"LOG","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"29"},"Hello World"]') + '|',
                        'X-Wf-1-1-1-13: ' + prependLength('[{"Type":"GROUP_START","Label":"Group 1","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"30"},null]') + '|',
                        'X-Wf-1-1-1-14: ' + prependLength('[{"Type":"LOG","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"31"},"Hello World"]') + '|',
                        'X-Wf-1-1-1-15: ' + prependLength('[{"Type":"GROUP_END","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"32"},null]') + '|',
                        'X-Wf-1-1-1-16: ' + prependLength('[{"Type":"GROUP_END","File":"/tests/03-Messages-FirePHPCore/index.php","Line":"33"},null]') + '|',

                        'X-Wf-1-Structure-1: http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1',
                        'X-Wf-Protocol-1: http://meta.wildfirehq.org/Protocol/JsonStream/0.2',
                        'X-Wf-1-Plugin-1: http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.3',
                        'X-Wf-1-Structure-2: http://meta.firephp.org/Wildfire/Structure/FirePHP/Dump/0.1',
                        'X-Wf-1-Index: ' + count
                    ]);
                }
            }
        },
        "/dist/resources/insight.renderers.default/*": "$__DIRNAME__/../../node_modules/fireconsole.rep.js/dist/resources/insight.renderers.default"
    },
    "files": {
        "/dist/resources/insight.renderers.default/*": "$__DIRNAME__/../../node_modules/fireconsole.rep.js/dist/resources/insight.renderers.default"
    }
}
