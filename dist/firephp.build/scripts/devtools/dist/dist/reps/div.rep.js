
PINF.bundle("", function(require) {
    require.memoize("/main.js", function(require, exports, module) {

        exports.main = function (JSONREP, node) {

            function makeAttributes () {
                var attributes = {};
                if (node.style) {
                    attributes.style = Object.keys(node.style).map(function (name) {
                        return name + ':' + node.style[name];
                    }).join(";");
                }
                return Object.keys(attributes).map(function (name) {
                    return name + '="' + attributes[name].replace(/"/g, '\\"') + '"';
                }).join(" ");
            }

            return JSONREP.markupNode(node.innerHTML).then(function (html) {

                return ('<div ' + makeAttributes() + '>' + html + '</div>');
            });
        }
	});
});
