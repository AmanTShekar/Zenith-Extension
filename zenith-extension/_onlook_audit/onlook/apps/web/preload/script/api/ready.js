"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBodyReady = handleBodyReady;
const dom_ts_1 = require("./dom.ts");
const index_ts_1 = require("./events/index.ts");
const css_manager_ts_1 = require("./style/css-manager.ts");
function handleBodyReady() {
    (0, index_ts_1.listenForDomChanges)();
    keepDomUpdated();
    css_manager_ts_1.cssManager.injectDefaultStyles();
}
let domUpdateInterval = null;
function keepDomUpdated() {
    if (domUpdateInterval !== null) {
        clearInterval(domUpdateInterval);
        domUpdateInterval = null;
    }
    const interval = setInterval(() => {
        try {
            if ((0, dom_ts_1.processDom)() !== null) {
                clearInterval(interval);
                domUpdateInterval = null;
            }
        }
        catch (err) {
            clearInterval(interval);
            domUpdateInterval = null;
            console.warn('Error in keepDomUpdated:', err);
        }
    }, 5000);
    domUpdateInterval = interval;
}
const handleDocumentBody = setInterval(() => {
    window.onerror = function logError(errorMsg, url, lineNumber) {
        console.log(`Unhandled error: ${errorMsg} ${url} ${lineNumber}`);
    };
    if (window?.document?.body) {
        clearInterval(handleDocumentBody);
        try {
            handleBodyReady();
        }
        catch (err) {
            console.log('Error in documentBodyInit:', err);
        }
    }
}, 300);
//# sourceMappingURL=ready.js.map