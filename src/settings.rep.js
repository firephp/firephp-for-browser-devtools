
exports.main = function (JSONREP, node) {

    return JSONREP.makeRep(
        (html () >>>
            '<div class="panel.settings">' + 
            'Settings' +
            '</div>'
        <<<),
        {
            on: {
                mount: function (el) {

                }
            }
        }
    );
};
