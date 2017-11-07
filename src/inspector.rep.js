
exports.main = function (JSONREP, node) {


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
                    border: 1px solid black;
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

                    var currentDomain = null;

                    WINDOW.FC.on("inspectMessage", function (info) {
                        currentDomain = info.message.domain;
                        WINDOW.FC.renderMessageInto(el.querySelector(".viewer"), info.message);
                        el.querySelector(".close").style.display = "inline-block";
                    });

                    WINDOW.FC.on("inspectFile", function (info) {

                        console.log("EVENT:inspectFile", info);
                    });

                    function clear () {
                        el.querySelector(".viewer").innerHTML = "";
                        el.querySelector(".close").style.display = "none";
                    }

                    el.querySelector(".close").addEventListener("click", clear, false);

                    browser.runtime.onMessage.addListener(function (message) {

                        if (message.to === "message-listener") {
                
                            if (message.event === "onBeforeNavigate") {

                                if (message.hostname === currentDomain) {
                                    clear();
                                }
                            }
                        }
                    });                    
                }
            }
        }
    );
};
        