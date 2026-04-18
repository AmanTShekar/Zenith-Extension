"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const dom_1 = require("./dom");
const events_1 = require("./events");
const style_1 = __importDefault(require("./style"));
function handleBodyReady() {
    (0, api_1.setApi)();
    (0, events_1.listenForEvents)();
    keepDomUpdated();
    style_1.default.injectDefaultStyles();
}
let domUpdateInterval = null;
function keepDomUpdated() {
    if (domUpdateInterval !== null) {
        clearInterval(domUpdateInterval);
        domUpdateInterval = null;
    }
    const interval = setInterval(() => {
        try {
            if ((0, dom_1.processDom)()) {
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
//# sourceMappingURL=index.js.map