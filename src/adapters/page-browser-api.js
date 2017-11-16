



module.exports = {
    runtime: {
        onMessage: {
            addListener: function (listener) {

console.log("[page-browser] browser.runtime.onMessage.addListener (listener):", listener);                    
                
            }
        },
        sendMessage: function (message) {

console.log("[page-browser] browser.runtime.sendMessage (message):", message);                    

        }
    },
    storage: {
        onChanged: {
            addListener: function (listener) {
                
            }
        },
        local: {
            get: function (name) {
                return Promise.resolve(false);
            }
        }
    },
    devtools: {
        inspectedWindow: {
            tabId: 1
        }
    }
};
