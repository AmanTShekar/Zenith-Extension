"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTelemetry = resetTelemetry;
exports.openFeedbackWidget = openFeedbackWidget;
const posthog_js_1 = __importDefault(require("posthog-js"));
// Utility to clear client-side telemetry identities on logout.
// Safe to call even if Gleap is not installed; uses dynamic import.
async function resetTelemetry() {
    try {
        posthog_js_1.default.reset();
    }
    catch {
        // ignore
    }
    try {
        const mod = await Promise.resolve().then(() => __importStar(require("gleap")));
        const Gleap = mod.default ?? mod;
        Gleap?.clearIdentity();
    }
    catch {
        // ignore if Gleap isn't present
    }
}
// Opens the Gleap widget if available.
async function openFeedbackWidget() {
    try {
        const mod = await Promise.resolve().then(() => __importStar(require("gleap")));
        const Gleap = mod.default ?? mod;
        if (Gleap?.open) {
            Gleap?.open();
        }
    }
    catch {
        // ignore if Gleap isn't present
    }
}
//# sourceMappingURL=index.js.map