"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderBackgroundCommand = exports.ProviderTask = exports.ProviderTerminal = exports.ProviderFileWatcher = exports.Provider = void 0;
class Provider {
    static createProject(input) {
        throw new Error('createProject must be implemented by subclass');
    }
    static createProjectFromGit(input) {
        throw new Error('createProjectFromGit must be implemented by subclass');
    }
}
exports.Provider = Provider;
class ProviderFileWatcher {
}
exports.ProviderFileWatcher = ProviderFileWatcher;
/**
 * This is a wrapper around the terminal object from the code provider.
 * Inspired from @codesandbox/sdk/sessions/WebSocketSession/terminals.d.ts
 */
class ProviderTerminal {
}
exports.ProviderTerminal = ProviderTerminal;
class ProviderTask {
}
exports.ProviderTask = ProviderTask;
class ProviderBackgroundCommand {
}
exports.ProviderBackgroundCommand = ProviderBackgroundCommand;
//# sourceMappingURL=types.js.map