
exports.main = function (JSONREP, node) {
    
    return JSONREP.makeRep({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>

            <div>
            
                <ul>
                    <li><input type="checkbox" name="setting.enableUserAgentHeader"/> Enable UserAgent Header</li>
                    <li><input type="checkbox" name="setting.enableFirePHPHeader"/> Enable FirePHP Header</li>
                </ul>
            </div>

            <style>
            </style>

            <script>
/*    
                this.root.innerHTML = [
                    this.opts.config.node.message,
                    this.opts.config.append
                ].join("");
*/
            </script>

        <<<)
    });
};
