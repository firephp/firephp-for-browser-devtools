
PINF.bundle("", function(require) {

    require.memoize("/main.js", function(require, exports, module) {

        function ensureDependencies (done) {

            var link = document.createElement("link");
            link.href = "//golden-layout.com/files/latest/css/goldenlayout-base.css";
            link.type = "text/css";
            link.rel = "stylesheet";
            document.getElementsByTagName("head")[0].appendChild(link);

            var link = document.createElement("link");
            link.href = "//golden-layout.com/files/latest/css/goldenlayout-dark-theme.css";
            link.type = "text/css";
            link.rel = "stylesheet";
            document.getElementsByTagName("head")[0].appendChild(link);

            var script = document.createElement('script');
            script.src = '//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js';
            script.type = 'text/javascript';
            script.onload = function () {
                var script = document.createElement('script');
                script.src = '//golden-layout.com/files/latest/js/goldenlayout.min.js';
                script.type = 'text/javascript';
                script.onload = function () {
                    return done();
                }
                document.getElementsByTagName('head')[0].appendChild(script);
            },
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        exports.main = function (JSONREP, node) {

            return JSONREP.makeRep({
                html: '<div style="width: 100%; height: 100%; color: #ffffff;"></div>',
                css: [
                    '[__dbid][__dtid="insight.domplate.reps/default/string"] {',
                    '    color: inherit;',
                    '}'
                ].join("\n"),                    
                on: {
                    mount: function (el) {

                        ensureDependencies(function () {

                            var myLayout = new window.GoldenLayout(node, el);

                            myLayout.registerComponent('example', function (container, state) {

                                var node = {};
                                var key = Object.keys(state).filter(function (key) {
                                    return /^@/.test(key);
                                });
                                if (key.length === 1) {
                                    node[key] = state[key];
                                } else
                                if (key.length > 1) {
                                    console.error("state", state);
                                    throw new Error("You need one, and only one, key prefixed by '@'!");
                                } else {
                                    node = state;
                                }

                                JSONREP.markupNode(node).then(function (html) {

                                    container.getElement().html('<div>' + html + '</div>');


                                    var el = container.getElement().get(0);

                                    Array.from(el.querySelectorAll('[_repid]')).forEach(function (el) {

                                        var rep = JSONREP.getRepForId(el.getAttribute("_repid"));
                                        if (
                                            rep &&
                                            rep.on &&
                                            rep.on.mount
                                        ) {
                                            rep.on.mount(el);
                                        }
                                    });
                                });        
                            });

                            myLayout.init();
                        });
                    }
                }
            });
        }
    });

});
