
exports.main = function (JSONREP, node, options) {


    return JSONREP.makeRep(
        (
            '<div class="inspector">' + 
                '<div class="close" style="display: none;">x</div>' +
                '<div class="viewer"></div>' +
            '</div>'
        ),
        {
            css: (css () >>>

                :scope.inspector {
                    padding: 10px;
                }

                :scope.inspector > .close {
                    border: 1px solid #dcdcdc;
                    font-weight: bold;
                    float: right;
                    cursor: pointer;
                    padding: 2px;
                    line-height: 10px;
                }

                :scope.inspector > .viewer {
                    height: 100%;
                }                    
                
            <<<),
            on: {
                mount: function (el) {

                    var currentContext = null;
                    
                    function makeKeyForContext (context) {
                        return context.tabId + ":" + (context.url || "");
                    }

                    function getPanel () {
                        if (!currentContext) {
                            return;
                        }
                        var key = makeKeyForContext(currentContext);
                        var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                        if (!panelEl) {
                            panelEl = window.document.createElement('div');
                            panelEl.setAttribute("context", key);
                            panelEl.style.display = "none";
                            el.querySelector('.viewer').appendChild(panelEl);
                        }
                        return panelEl;                                                
                    }

                    function hidePanel () {
                        if (!currentContext) {
                            return;
                        }
                        var key = makeKeyForContext(currentContext);
                        var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                        if (!panelEl) {
                            return;
                        }
                        panelEl.style.display = "none";
                        el.querySelector(".close").style.display = "none";
                    }

                    function showPanel () {

                        if (!currentContext) {
                            return;
                        }
                        var key = makeKeyForContext(currentContext);

                        var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');

                        if (!panelEl) {
                            return;
                        }
                        panelEl.style.display = "";
                        el.querySelector(".close").style.display = "inline-block";
                    }

                    function destroyPanel () {
                        if (!currentContext) {
                            return;
                        }
                        var key = makeKeyForContext(currentContext);
                        var panelEl = el.querySelector('.viewer > DIV[context="' + key + '"]');
                        if (!panelEl) {
                            return;
                        }
                        panelEl.parentNode.removeChild(panelEl);
                        el.querySelector(".close").style.display = "none";
                    }


                    window.FC.on("inspectMessage", function (info) {

                        hidePanel();

                        if (info.message.context) {
                            currentContext = info.message.context;
                        }

//console.log("INSPECT MESSAGE!!", info.message);

                        const panel = getPanel();

                        if (!panel) return;

                        delete info.message.meta.wrapper;

                        window.FC.renderMessageInto(panel, info.message);
                        
                        showPanel();
                    });

                    window.FC.on("inspectNode", function (info) {

                        hidePanel();

                        if (info.message.context) {
                            currentContext = info.message.context;
                        }
                        
                        currentContext = {
                            tabId: browser.devtools.inspectedWindow.tabId
                        };

                        const panel = getPanel();

                        if (!panel) return;
                        
                        window.FC.renderMessageInto(panel, info.message);
                        
                        showPanel();
                    });
                        
                    window.FC.on("inspectFile", function (info) {

                        const panel = getPanel();

                        if (!panel) return;

                        window.FC.renderMessageInto(panel, {
                            type: "string",
                            value: "Viewing of files is not yet implemented."
                        });
                    });

                    el.querySelector(".close").addEventListener("click", destroyPanel, false);

                    browser.runtime.onMessage.addListener(function (message) {

                        if (
                            message.context &&
                            message.context.tabId != browser.devtools.inspectedWindow.tabId
                        ) {
                            return;
                        }

                        if (message.to === "message-listener") {
                
                            if (message.event === "currentContext") {

//console.log("CONTEXT IN INSPECTOR", message.context, currentContext);

                                hidePanel();                                
                                currentContext = message.context;
                                showPanel();
                            } else
                            if (message.event === "destroyContext") {

                                if (
                                    currentContext &&
                                    currentContext.tabId == message.context.tabId
                                ) {
                                    destroyPanel();
                                }
                            } else
                            if (message.event === "clear") {
                                destroyPanel();
                            }
                        }
                    });                    
                }
            }
        },
        options
    );
};
        