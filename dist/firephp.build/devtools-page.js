
const WINDOW = window;
const BROWSER = (typeof browser != "undefined") ? browser : chrome;

const panels = new EventEmitter();
panels.on("set", function (name, value) {
    panels[name] = value;
});


[].forEach(function (script) {

    const url = "scripts/" + script;

    WINDOW.PINF.sandbox(url, function (sandbox) {

        sandbox.main({
            panels: panels
        });

    }, console.error);

});

[{"label":"FirePHP","icon":"skin/__icon_devtools_panel_Logo.png","filename":"devtools/dist/index.html"}].forEach(function (panel) {

    const url = "scripts/" + panel.filename;

    WINDOW.crossbrowser.devtools.panels.create(
        panel.label || undefined,
        panel.icon || undefined,
        url
    ).then((panel) => {

        panels.emit("set", panel.name, panel);

        panel.onShown.addListener(function () {

//console.log("INIT PANEL", url);
        });

        panel.onHidden.addListener(function () {

//console.log("CLOSE PANEL", url);
        });
    });

});
