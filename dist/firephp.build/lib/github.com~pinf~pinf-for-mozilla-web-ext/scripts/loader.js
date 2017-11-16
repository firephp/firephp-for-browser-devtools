
const PINF_CORE_LOADER = window.PINF;

if (!PINF_CORE_LOADER) {
    throw new Error("The 'PINF' core loader must be loaded first!");
}

const PINF = window.PINF = (function (window) {

    const exports = {};

    exports.sandbox = PINF_CORE_LOADER.sandbox;

    exports.getReport = PINF_CORE_LOADER.getReport;

    exports.reset = PINF_CORE_LOADER.reset;

    exports.bundle = PINF_CORE_LOADER.bundle;

    return exports;
})(window);
