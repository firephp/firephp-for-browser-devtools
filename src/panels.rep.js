
exports.main = function (JSONREP, node, options) {

    var panels = [];

    return Promise.all(Object.keys(node).map(function (key) {
        var panelNode = {};
        panelNode[key] = node[key];
        return JSONREP.markupNode(panelNode).then(function (code) {
            panels.push(code);
            return null;
        });
    })).then(function () {

        return JSONREP.makeRep(
            (
                '<div class="panels">' + 
                panels.join("\n") +
                '</div>'
            ),
            {
                css: (css () >>>

                    :scope.panels > DIV {
                        border: 1px solid black;
                        padding: 5px;
                    }

                <<<),
                on: {
                    mount: function (el) {

                    }
                }
            },
            options
        );
    });
};
        