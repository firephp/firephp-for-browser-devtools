#!/usr/bin/env bash.origin.script

# TODO: Remove these once we lock versions for downloaded assets or include them.
#export BO_ALLOW_DOWNLOADS=1
#export BO_ALLOW_INSTALLS=1

#export BO_SYSTEM_CACHE_DIR="$(node --eval 'process.stdout.write(require("bash.origin.workspace").node_modules);')"


depend {
    "webext": "@com.github/pinf-to/to.pinf.org.mozilla.web-ext#s1"
}


function do_run {

    version="$(BO_run_recent_node --eval 'process.stdout.write(require("./package.json").version);')"

    CALL_webext run {
        "manifest": {
            "dist": "$__DIRNAME__/dist/firephp.build",
            "name": "FirePHP",
            "version": "${version}",
            "description": "Log from PHP to a devtools panel.",
            "applications": {
                "gecko": {
                    "id": "FirePHPExtension-Build@firephp.org",
                    "strict_min_version": "42.0"
                }
            },
            "icons": {
                "48": "$__DIRNAME__/src/skin/Logo.png"
            },
            "permissions": [
                "tabs",
                "storage",
                "webRequest",
                "webNavigation",
                "webRequestBlocking",            
                "<all_urls>"
            ],
            "content_security_policy": "script-src 'self'; style-src 'self'; object-src 'self'; img-src 'self'",
            "background": {
                "scripts": [
                    {
                        "background.js": {
                            "@it.pinf.org.browserify#s1": {
                                "src": "$__DIRNAME__/src/background.js",
                                "prime": true,
                                "format": "pinf",
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
            },
            "devtools": {
                "panels": [
                    {
                        "devtools/index.js": {
                            "label": "FirePHP",
                            "icon": "$__DIRNAME__/src/skin/Logo.png",
                            "code": {
                                "@github.com~jsonrep~jsonrep#s1": {
                                    "externalizeCss": true,
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
                                        "layout": "$__DIRNAME__/src/layout.rep.js",
                                        "menu": "$__DIRNAME__/src/menu.rep.js",
                                        "summary": "$__DIRNAME__/src/summary.rep.js",
                                        "settings": "$__DIRNAME__/src/settings.rep.js",
                                        "manage": "$__DIRNAME__/src/manage.rep.js",
                                        "inspector": "$__DIRNAME__/src/inspector.rep.js",
                                        "fireconsole": "fireconsole.rep.js/dist/fireconsole.rep.js",
                                        "console": "$__DIRNAME__/src/console.rep.js",
                                        "enabler": "$__DIRNAME__/src/enabler.rep.js"
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
                    }
                ]
            }
        },
        "routes": {
            "^/$": (javascript (API) >>>

                return function (req, res, next) {

                    if (
                        req.headers["x-firephp-version"] ||
                        /\sFirePHP\/([\.|\d]*)\s?/.test(req.headers["user-agent"])
                    ) {

                        function wrap (message) {
                            return message.length + '|' + message + '|';
                        }

                        res.writeHead(200, {
                            'X-Wf-Protocol-1': 'http://meta.wildfirehq.org/Protocol/JsonStream/0.2',
                            'X-Wf-1-Plugin-1': 'http://meta.firephp.org/Wildfire/Plugin/FirePHP/Library-FirePHPCore/0.0.0master1106021548',
                            'X-Wf-1-Structure-1': 'http://meta.firephp.org/Wildfire/Structure/FirePHP/FirebugConsole/0.1',

                            // @see https://github.com/firephp/firephp/issues/16
                            'X-Wf-1-1-1-1': wrap('[{"Type":"LOG","File":"/path/to/file","Line":10},"Hello World"]'),
                            'X-Wf-1-1-1-2': wrap('[{"Type":"INFO","File":"\/christoph\/projects\/gi0.FireConsole.org\/rep.js\/examples\/03-FirePHPCore\/index.php","Line":75},"\\u0427\\u0442\\u043e-\\u0442\\u043e"]'),
                            'X-Wf-1-1-1-3': wrap('[{"Type":"INFO","File":"\/christoph\/projects\/gi0.FireConsole.org\/rep.js\/examples\/03-FirePHPCore\/index.php","Line":76},"Od\\u00f3metro"]'),

                            'X-Wf-1-Index': '3'
                        });


                        res.end("FirePHP Core formatted messages sent in HTTP response headers.");
                    } else {

                        res.end("No FirePHP HTTP request headers found.");
                    }

                    if (process.env.BO_TEST_FLAG_DEV) return;

                    setTimeout(function () {
                        API.SERVER.stop();
                    }, 1000);
                };
            <<<),
            "^/tests": {
                "@it.pinf.org.mochajs#s1": {}
            }
        }
    } "$@"

}

function do_sign {

    pushd "dist/firephp.build" > /dev/null

        CALL_webext sign {
            "dist": "$__DIRNAME__/dist/firephp.xpi",
            "manifest": {
            }
        }

    popd > /dev/null
}

function do_extract {

    if [ ! -e "dist/firephp.xpi" ]; then
        BO_exit_error "No xpi file to unbundle found! Run 'sign' first."
    fi
    rm -Rf "dist/firephp.xpi.extracted" || true
    rm -Rf "dist/firephp.zip" || true
    cp "dist/firephp.xpi" "dist/firephp.zip"
    unzip "dist/firephp.zip" -d "dist/firephp.xpi.extracted/"
    rm -Rf "dist/firephp.zip" || true

    BO_cecho "Extracted extension can be found in: dist/firephp.extracted/" YELLOW BOLD
}


BO_parse_args "ARGS" "$@"


if [ "$ARGS_1" == "build" ]; then

    do_run "--build-only"

    BO_cecho "Built extension can be found in: dist/firephp.build/" YELLOW BOLD

elif [ "$ARGS_1" == "run" ]; then

    export BO_TEST_FLAG_DEV=1
    do_run

elif [ "$ARGS_1" == "sign" ]; then

    if [ "$ARGS_OPT_dev" == "true" ]; then
        export BO_TEST_FLAG_DEV=1
    fi

    if [ "$ARGS_OPT_skip_build" != "true" ]; then
        do_run "--build-only"
    fi

    if [ "$ARGS_OPT_dev" == "true" ]; then
        echo "Not signing. Exiting due to --dev"
        exit 0
    fi

    do_sign
    #do_extract
fi
