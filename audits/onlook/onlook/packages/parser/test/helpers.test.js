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
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("@babel/types"));
const bun_test_1 = require("bun:test");
const src_1 = require("src");
(0, bun_test_1.describe)('Helper Tests', () => {
    (0, bun_test_1.test)('should correctly identify React.Fragment', () => {
        // Create a React.Fragment JSX element manually
        const fragmentElement = t.jsxOpeningElement(t.jsxMemberExpression(t.jsxIdentifier('React'), t.jsxIdentifier('Fragment')), [], true);
        (0, bun_test_1.expect)((0, src_1.isReactFragment)(fragmentElement)).toBe(true);
    });
    (0, bun_test_1.test)('should correctly identify shorthand Fragment (<>)', () => {
        // Create a Fragment JSX element manually
        const fragmentElement = t.jsxOpeningElement(t.jsxIdentifier('Fragment'), [], true);
        (0, bun_test_1.expect)((0, src_1.isReactFragment)(fragmentElement)).toBe(true);
    });
    (0, bun_test_1.test)('should return false for non-Fragment elements', () => {
        // Create a regular div JSX element
        const divElement = t.jsxOpeningElement(t.jsxIdentifier('div'), [], false);
        (0, bun_test_1.expect)((0, src_1.isReactFragment)(divElement)).toBe(false);
    });
});
//# sourceMappingURL=helpers.test.js.map