
'use strict';

exports.inf = async function (inf) {

    let manifest = null;

    return {

        set: function (value) {
            manifest = value;
        },

        get: function () {
            return manifest;
        }
    };
}
