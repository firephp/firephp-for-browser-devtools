
exports.main = function (JSONREP, node) {    
        
    return JSONREP.makeRep({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>

            <div>
                <h2>{hostname}</h2>
            
                <ul>
                    <li><input type="checkbox" name="settings.enableUserAgentHeader" onchange={syncCheckbox}/> Enable UserAgent Header</li>
                    <li><input type="checkbox" name="settings.enableFirePHPHeader" onchange={syncCheckbox}/> Enable FirePHP Header</li>
                </ul>
            </div>

            <style>
            </style>

            <script>

                var tag = this;

                tag.hostname = "";


                function getHostname () {
                    return browser.devtools.inspectedWindow.eval("window.location.hostname").then(function (result) {
                        return result[0];                    
                    });
                }
                function getSettingForHostname (hostname, name) {
                    var key = "domain[" + hostname + "]." + name;
                    return browser.storage.local.get(key).then(function (value) {
                        return (value[key] || false);
                    });
                }
                function setSettingForHostname (hostname, name, value) {
                    var obj = {};
                    obj["domain[" + hostname + "]." + name] = value;
                    return browser.storage.local.set(obj);
                }


                function sync () {
                    return getHostname().then(function (hostname) {

                        tag.hostname = hostname;

                        $('INPUT[type="checkbox"]', tag.root).each(function () {
                            var el = $(this);
                            var name = el.attr("name");
                            if (/^settings\./.test(name)) return;
                            getSettingForHostname(hostname, name).then(function (enabled) {
                                el.get(0).checked = enabled;
                                return null;
                            }).catch(function (err) {
                                throw err;
                            });
                        });
                    }).catch(function (err) {
                        throw err;
                    });
                }

                tag.on("mount", function () {
                    sync().then(function () {
                        tag.update();
                        return null;
                    });
                });
                tag.on("updated", sync);
                
                tag.syncCheckbox = function (event) {

                    var name = event.target.getAttribute("name");

                    getHostname().then(function (hostname) {    
                        return setSettingForHostname(hostname, name, event.target.checked);
                    }).then(function () {
                        tag.update();
                        return null;
                    }).catch(function (err) {
                        throw err;
                    });
                }

/*    
                this.root.innerHTML = [
                    this.opts.config.node.message,
                    this.opts.config.append
                ].join("");
*/
            </script>

        <<<)
    });
};
