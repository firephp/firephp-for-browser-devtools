
exports.main = function (JSONREP, node, options) {    

    return JSONREP.makeRep2({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>

            <table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="menu">
                    </td>
                    <td class="menu menu-right">
                        <button onclick={triggerClose}>Close</button>
                    </td>
                </tr>
                <tr>
                    <td class="filetree" width="20%">
                        <div class="filetree">
                        </div>
                    </td>
                    <td class="editor" width="80%">
                        <textarea class="editor"></textarea>
                    </td>
                </tr>
            </table>

            <style>

                :scope DIV TABLE {
                    height: 100vh;
                    width: 100vw;
                }

                :scope DIV TD.menu {
                    background-color: #efefef;
                    border-bottom: 1px solid #bcbcbc;
                    padding: 3px;
                    padding-left: 10px;
                    padding-right: 10px;
                }

                :scope DIV TD.menu-right {
                    text-align: right;
                }

                :scope DIV TD.filetree {
                    border-right: 1px solid #bcbcbc;
                    padding: 10px;
                    vertical-align: top;
                    height: 100%;
                    min-width: 20%;
                }

                :scope DIV TD.editor {
                    min-width: 80%;
                    vertical-align: top;
                    position: relative;
                    box-sizing: border-box;
                }

                :scope DIV DIV.CodeMirror {
                    position: absolute;
                }

            </style>

            <script>
                const COMPONENT = require("./component");

                const tag = this;
                let editor = null;

                const comp = COMPONENT.for({
                    browser: window.crossbrowser,
                    handlers: {
                        "http://registry.pinf.org/cadorn.org/insight/@meta/receiver/console/request/0": function (message) {

console.log("MESSAGE in EDITOR ::::", message);

                            const filetreeTag = tag.root.querySelector('DIV.filetree');

                            WINDOW.FC.fireconsole.repRenderer.renderNodeInto({
                                meta: {
                                    "lang": "elements",
                                    "lang.type": "pathtree"
                                },
                                value: message.data
                            }, filetreeTag);

                            window.FC.on("click", function (args) {

console.log("EDITOR FC CLICK", args);

                                if (args.rep === "insight.domplate.reps/elements/pathtree") {

                                    comp.loadFile(args.node.value.id);

/*
                                    editor.getDoc().setValue(JSON.stringify({
                                        "load file": args.node.value.id
                                    }, null, 4));
*/
                                }
                            });

                            if (editor) {
                                editor.getDoc().setValue(JSON.stringify({
                                    "foo": "bar"
                                }, null, 4));
                            }
                        }
                    }
                });

                comp.on("changed.context", function (context) {
                    comp.contextChangeAcknowledged();

// TODO: Clear editor

                });

                comp.on("message", function (message) {
                    if (message.action === "show-file") {

console.log("EDITOR show-file::", message);

                        editor.getDoc().setValue(message.args.content);
// TODO: Position to line
                        if (typeof message.args.line !== "undefined") {

console.log("set cursor to", message.args.line || 0);             

                            setTimeout(function () {
                                editor.getDoc().setCursor((message.args.line-1) || 0, 0);
                                editor.scrollIntoView(null, 100);
                            }, 10);
                        }

                    } else
                    if (message.event === "editor") {
                        let forceEditor = false;
                        if (typeof message.value !== 'undefined') {
                            forceEditor = message.value;
                        } else {
                            forceEditor = true;
                        }
                        if (forceEditor) {
                            setTimeout(function () {
                                syncSize();
                            }, 100);
                        }

console.log("SHOW EDITOR::", message);

                        if (
                            message.args &&
                            message.args.show &&
                            message.args.show.file
                        ) {
                            comp.loadFile(
                                message.args.show.file,
                                message.args.show.line || 0
                            );
                        }
                    }
                });

                // TODO: Debounce
                function syncSize () {
                    if (!editor) {
                        return;
                    }
                    const editorTableTag = tag.root.querySelector("TD.editor");
                    editor.setSize(
                        editorTableTag.getBoundingClientRect().width,
                        editorTableTag.getBoundingClientRect().height
                    );
                    editor.refresh();
                }
                
                tag.on("mount", function () {

                    editor = CodeMirror.fromTextArea(tag.root.querySelector("TEXTAREA.editor"), {
                        value: "",
                        lineNumbers: true,
                        mode: "application/x-httpd-php",
                        autofocus: true,
                        autoRefresh: true,
                        styleActiveLine: true,
                        styleActiveSelected: true
                    });

                    window.addEventListener("resize", function () {
                        syncSize();
                    }, false);
                    syncSize();

                });

                tag.triggerClose = function (event) {
                    comp.hideView("editor");
                }

            </script>

        <<<)
    }, options);
};
