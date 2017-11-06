
exports.main = function (JSONREP, node) {


    return JSONREP.makeRep(
        (
            '<div class="inspector">' + 
            'Inspector' +
            '</div>'
        ),
        {
            css: (css () >>>

                :scope.inspector > DIV {
                    border: 1px solid black;
                    padding: 5px;
                }

            <<<),
            on: {
                mount: function (el) {

                    WINDOW.FC.on("inspectMessage", function (info) {

                        WINDOW.FC.renderMessageInto(el, info.message);
                    });

                    WINDOW.FC.on("inspectFile", function (info) {
                        
                        console.log("EVENT:inspectFile", info);
                    });
                        
                }
            }
        }
    );
};
        