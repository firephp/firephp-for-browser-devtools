
PINF.bundle("", function(require) {
    require.memoize("/main.js", function(require, exports, module) {

        exports.main = function (JSONREP, node) {

            return '<img src="https://img.shields.io/badge/' + node.subject + '-' + node.status + '-' + node.color + '.svg">';
        }
	});
});
