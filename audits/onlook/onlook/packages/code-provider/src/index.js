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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeFsProvider = exports.CodesandboxProvider = void 0;
exports.createCodeProviderClient = createCodeProviderClient;
exports.getStaticCodeProvider = getStaticCodeProvider;
const providers_1 = require("./providers");
const codesandbox_1 = require("./providers/codesandbox");
const nodefs_1 = require("./providers/nodefs");
__exportStar(require("./providers"), exports);
var codesandbox_2 = require("./providers/codesandbox");
Object.defineProperty(exports, "CodesandboxProvider", { enumerable: true, get: function () { return codesandbox_2.CodesandboxProvider; } });
var nodefs_2 = require("./providers/nodefs");
Object.defineProperty(exports, "NodeFsProvider", { enumerable: true, get: function () { return nodefs_2.NodeFsProvider; } });
__exportStar(require("./types"), exports);
/**
 * Providers are designed to be singletons; be mindful of this when creating multiple clients
 * or when instantiating in the backend (stateless vs stateful).
 */
async function createCodeProviderClient(codeProvider, { providerOptions }) {
    const provider = newProviderInstance(codeProvider, providerOptions);
    await provider.initialize({});
    return provider;
}
async function getStaticCodeProvider(codeProvider) {
    if (codeProvider === providers_1.CodeProvider.CodeSandbox) {
        return codesandbox_1.CodesandboxProvider;
    }
    if (codeProvider === providers_1.CodeProvider.NodeFs) {
        return nodefs_1.NodeFsProvider;
    }
    throw new Error(`Unimplemented code provider: ${codeProvider}`);
}
function newProviderInstance(codeProvider, providerOptions) {
    if (codeProvider === providers_1.CodeProvider.CodeSandbox) {
        if (!providerOptions.codesandbox) {
            throw new Error('Codesandbox provider options are required.');
        }
        return new codesandbox_1.CodesandboxProvider(providerOptions.codesandbox);
    }
    if (codeProvider === providers_1.CodeProvider.NodeFs) {
        if (!providerOptions.nodefs) {
            throw new Error('NodeFs provider options are required.');
        }
        return new nodefs_1.NodeFsProvider(providerOptions.nodefs);
    }
    throw new Error(`Unimplemented code provider: ${codeProvider}`);
}
//# sourceMappingURL=index.js.map