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
exports.fileWatcher = exports.FileWatcher = void 0;
const watcher_1 = require("@parcel/watcher");
const constants_1 = require("@onlook/models/constants");
const pathModule = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../index");
const files_1 = require("./files");
const lodash_1 = require("lodash");
class FileWatcher {
    subscriptions = new Map();
    selfModified = new Set();
    fileContents = new Map();
    async watchFile(filePath) {
        if (!fs_1.default.existsSync(filePath)) {
            console.error(`File does not exist: ${filePath}`);
            return false;
        }
        // If already watching this file, no need to create a new subscription
        if (this.subscriptions.has(filePath)) {
            return true;
        }
        try {
            // Caches the initial file content
            const initialContent = await (0, files_1.readFile)(filePath);
            if (initialContent !== null) {
                this.fileContents.set(filePath, initialContent);
            }
            // Watch the directory containing the file
            const dirPath = pathModule.dirname(filePath);
            const normalizedPath = pathModule.normalize(filePath);
            const subscription = await (0, watcher_1.subscribe)(dirPath, (err, events) => {
                if (err) {
                    console.error(`File watcher error: ${err}`);
                    return;
                }
                if (events.length > 0) {
                    for (const event of events) {
                        const eventPath = pathModule.normalize(event.path);
                        // Skip if this change was made by our application
                        if (this.selfModified.has(eventPath)) {
                            this.selfModified.delete(eventPath);
                            continue;
                        }
                        // If the watched file was updated
                        if (eventPath === normalizedPath &&
                            (event.type === 'update' || event.type === 'create')) {
                            this.debouncedNotifyFileChanged(filePath);
                        }
                    }
                }
            }, {
                ignore: ['**/node_modules/**', '**/.git/**'],
            });
            this.subscriptions.set(filePath, subscription);
            return true;
        }
        catch (error) {
            console.error('Error setting up file watcher:', error);
            return false;
        }
    }
    // This prevent multiple notifications for a single save event
    debouncedNotifyFileChanged = (0, lodash_1.debounce)(async (filePath) => {
        await this.notifyFileChanged(filePath);
    }, 300);
    async notifyFileChanged(filePath) {
        try {
            if (!fs_1.default.existsSync(filePath)) {
                console.warn(`Cannot read changed file that no longer exists: ${filePath}`);
                return;
            }
            // Read the new content of the file
            const content = await (0, files_1.readFile)(filePath);
            if (content === null) {
                console.warn(`Failed to read content for file: ${filePath}`);
                return;
            }
            // Compare with cached content to see if it actually changed
            const cachedContent = this.fileContents.get(filePath);
            if (cachedContent === content) {
                return;
            }
            // Update cache
            this.fileContents.set(filePath, content);
            // Notifies the UI about the file change
            if (index_1.mainWindow?.webContents && !index_1.mainWindow.isDestroyed()) {
                index_1.mainWindow.webContents.send(constants_1.MainChannels.FILE_CHANGED, {
                    path: filePath,
                    content,
                });
            }
        }
        catch (error) {
            console.error('Error reading changed file:', error);
        }
    }
    markFileAsModified(filePath) {
        const normalizedPath = pathModule.normalize(filePath);
        this.selfModified.add(normalizedPath);
        // When we mark a file as modified, we also update our content cache
        // to avoid unnecessary notifications
        setTimeout(async () => {
            try {
                if (fs_1.default.existsSync(filePath)) {
                    const content = await (0, files_1.readFile)(filePath);
                    if (content !== null) {
                        this.fileContents.set(filePath, content);
                    }
                }
            }
            catch (error) {
                console.error('Error updating cached content after modification:', error);
            }
        }, 500);
    }
    unwatchFile(filePath) {
        const subscription = this.subscriptions.get(filePath);
        if (subscription) {
            subscription.unsubscribe().catch((err) => {
                console.error('Error unsubscribing from file watcher:', err);
            });
            this.subscriptions.delete(filePath);
            this.fileContents.delete(filePath);
        }
    }
    async clearAllSubscriptions() {
        for (const [filePath, subscription] of this.subscriptions.entries()) {
            try {
                await subscription.unsubscribe();
            }
            catch (error) {
                console.error(`Error unsubscribing from watcher for ${filePath}:`, error);
            }
        }
        this.subscriptions.clear();
        this.fileContents.clear();
    }
}
exports.FileWatcher = FileWatcher;
exports.fileWatcher = new FileWatcher();
//# sourceMappingURL=fileWatcher.js.map