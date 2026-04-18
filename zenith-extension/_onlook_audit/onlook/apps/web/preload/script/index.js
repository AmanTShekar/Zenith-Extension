"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.penpalParent = void 0;
const penpal_1 = require("@onlook/penpal");
const debounce_1 = __importDefault(require("lodash/debounce"));
const penpal_2 = require("penpal");
const api_1 = require("./api");
exports.penpalParent = null;
let isConnecting = false;
/**
 * Find the correct parent window for Onlook connection.
 * Handles both direct iframes (Next.js) and nested iframes (Storybook).
 */
const findOnlookParent = () => {
    // If we're not in an iframe, something is wrong
    if (window === window.top) {
        console.warn(`${penpal_1.PENPAL_CHILD_CHANNEL} - Not in an iframe, using window.parent as fallback`);
        return window.parent;
    }
    // Check if we're in a direct iframe (parent is the top window)
    // This is the Next.js case: Onlook -> Next.js iframe
    if (window.parent === window.top) {
        return window.parent;
    }
    // We're in a nested iframe (parent is NOT the top window)
    // This is the Storybook case: Onlook -> CodeSandbox -> Storybook preview iframe
    if (window.top) {
        console.log(`${penpal_1.PENPAL_CHILD_CHANNEL} - Using window.top for nested iframe scenario`);
        return window.top;
    }
    // Final fallback
    return window.parent;
};
const createMessageConnection = async () => {
    if (isConnecting || exports.penpalParent) {
        return exports.penpalParent;
    }
    isConnecting = true;
    console.log(`${penpal_1.PENPAL_CHILD_CHANNEL} - Creating penpal connection`);
    const messenger = new penpal_2.WindowMessenger({
        remoteWindow: findOnlookParent(),
        // TODO: Use a proper origin
        allowedOrigins: ['*'],
    });
    const connection = (0, penpal_2.connect)({
        messenger,
        // Methods the iframe window is exposing to the parent window.
        methods: api_1.preloadMethods
    });
    connection.promise.then((parent) => {
        if (!parent) {
            console.error(`${penpal_1.PENPAL_CHILD_CHANNEL} - Failed to setup penpal connection: child is null`);
            reconnect();
            return;
        }
        const remote = parent;
        exports.penpalParent = remote;
        console.log(`${penpal_1.PENPAL_CHILD_CHANNEL} - Penpal connection set`);
    }).finally(() => {
        isConnecting = false;
    });
    connection.promise.catch((error) => {
        console.error(`${penpal_1.PENPAL_CHILD_CHANNEL} - Failed to setup penpal connection:`, error);
        reconnect();
    });
    return exports.penpalParent;
};
const reconnect = (0, debounce_1.default)(() => {
    if (isConnecting)
        return;
    console.log(`${penpal_1.PENPAL_CHILD_CHANNEL} - Reconnecting to penpal parent`);
    exports.penpalParent = null; // Reset the parent before reconnecting
    createMessageConnection();
}, 1000);
createMessageConnection();
//# sourceMappingURL=index.js.map