
exports.main = function (JSONREP, node, options) {    
        
    return JSONREP.makeRep2({
        "config": {
            "node": node
        },
        "code": (riotjs:makeRep () >>>

            <div class="summary">
                <div>
                    Logs: 23 ( 200 hidden )
                </div>
                <button onclick={triggerFilter}>Filter</button>
            </div>

            <style>

                :scope DIV .summary {
                    padding: 5px;
                    padding-bottom: 7px;
                    padding-left: 13px;
                    padding-right: 10px;
                    white-space: nowrap;
                }

                :scope DIV .summary DIV {
                    display: inline-block;
                }

                :scope DIV .summary > BUTTON {
                    cursor: pointer;
                    width: auto;
                    padding-left: 1px;
                    padding-right: 1px;
                    float: right;
                }
                
            </style>

            <script>

                var tag = this;

            </script>

        <<<)
    }, options);
};
