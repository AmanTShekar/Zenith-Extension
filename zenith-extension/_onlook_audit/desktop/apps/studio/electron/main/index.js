"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__dirname = exports.mainWindow = void 0;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const fix_path_1 = __importDefault(require("fix-path"));
const node_module_1 = require("node:module");
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const node_url_1 = require("node:url");
const analytics_1 = require("./analytics");
const auth_1 = require("./auth");
const events_1 = require("./events");
const run_1 = __importDefault(require("./run"));
const update_1 = require("./update");
// Help main inherit $PATH defined in dotfiles (.bashrc/.bash_profile/.zshrc/etc).
(0, fix_path_1.default)();
exports.mainWindow = null;
const require = (0, node_module_1.createRequire)(import.meta.url);
exports.__dirname = node_path_1.default.dirname((0, node_url_1.fileURLToPath)(import.meta.url));
// Constants
const MAIN_DIST = node_path_1.default.join(exports.__dirname, '../../dist-electron');
const RENDERER_DIST = node_path_1.default.join(exports.__dirname, '../../dist');
const PRELOAD_PATH = node_path_1.default.join(exports.__dirname, '../preload/index.js');
const INDEX_HTML = node_path_1.default.join(RENDERER_DIST, 'index.html');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
let cleanupComplete = false;
// Environment setup
const setupEnvironment = () => {
    process.env.APP_ROOT = node_path_1.default.join(exports.__dirname, '../..');
    process.env.WEBVIEW_PRELOAD_PATH = node_path_1.default.join(exports.__dirname, '../preload/webview.js');
    process.env.APP_VERSION = electron_1.app.getVersion();
    process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
        ? node_path_1.default.join(process.env.APP_ROOT, 'public')
        : RENDERER_DIST;
};
// Platform-specific configurations
const configurePlatformSpecifics = () => {
    if (node_os_1.default.release().startsWith('6.1')) {
        electron_1.app.disableHardwareAcceleration();
    }
    if (process.platform === 'win32') {
        electron_1.app.setAppUserModelId(electron_1.app.getName());
    }
};
// Protocol setup
const setupProtocol = () => {
    if (process.defaultApp && process.argv.length >= 2) {
        electron_1.app.setAsDefaultProtocolClient(constants_1.APP_SCHEMA, process.execPath, [
            node_path_1.default.resolve(process.argv[1]),
        ]);
    }
    else {
        electron_1.app.setAsDefaultProtocolClient(constants_1.APP_SCHEMA);
    }
};
const createWindow = () => {
    exports.mainWindow = new electron_1.BrowserWindow({
        title: constants_1.APP_NAME,
        minWidth: 800,
        icon: node_path_1.default.join(process.env.VITE_PUBLIC, 'favicon.ico'),
        titleBarStyle: 'hiddenInset',
        frame: false,
        webPreferences: {
            preload: PRELOAD_PATH,
            webviewTag: true,
        },
    });
    return exports.mainWindow;
};
const loadWindowContent = (win) => {
    VITE_DEV_SERVER_URL ? win.loadURL(VITE_DEV_SERVER_URL) : win.loadFile(INDEX_HTML);
};
const initMainWindow = () => {
    const win = createWindow();
    win.maximize();
    loadWindowContent(win);
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) {
            electron_1.shell.openExternal(url);
        }
        return { action: 'deny' };
    });
    (0, auth_1.setupAuthAutoRefresh)();
};
const setupAppEventListeners = () => {
    electron_1.app.whenReady().then(() => {
        initMainWindow();
    });
    electron_1.app.on('ready', () => {
        update_1.updater.listen();
        (0, analytics_1.sendAnalytics)('start app');
    });
    electron_1.app.on('window-all-closed', async () => {
        if (process.platform !== 'darwin') {
            exports.mainWindow = null;
            electron_1.app.quit();
        }
    });
    electron_1.app.on('second-instance', (_, commandLine) => {
        if (exports.mainWindow) {
            if (exports.mainWindow.isMinimized()) {
                exports.mainWindow.restore();
            }
            exports.mainWindow.focus();
        }
        const url = commandLine.find((arg) => arg.startsWith(`${constants_1.APP_SCHEMA}://`));
        if (url && process.platform !== 'darwin') {
            (0, auth_1.handleAuthCallback)(url);
        }
    });
    electron_1.app.on('activate', () => {
        electron_1.BrowserWindow.getAllWindows().length
            ? electron_1.BrowserWindow.getAllWindows()[0].focus()
            : initMainWindow();
    });
    electron_1.app.on('open-url', (event, url) => {
        event.preventDefault();
        (0, auth_1.handleAuthCallback)(url);
    });
    async function cleanUp() {
        // Timeout after 10 seconds
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Cleanup timeout')), 10000);
        });
        try {
            await Promise.race([
                Promise.all([
                    exports.mainWindow?.webContents.send(constants_1.MainChannels.CLEAN_UP_BEFORE_QUIT),
                    run_1.default?.stopAll(),
                ]),
                timeoutPromise,
            ]);
        }
        catch (error) {
            console.error('Cleanup failed or timed out:', error);
        }
    }
    electron_1.app.on('before-quit', (event) => {
        if (!cleanupComplete) {
            cleanupComplete = false;
            event.preventDefault();
            cleanUp()
                .catch((error) => {
                console.error('Cleanup failed:', error);
                electron_1.app.quit();
            })
                .finally(() => {
                cleanupComplete = true;
                electron_1.app.quit();
            });
        }
    });
    electron_1.app.on('quit', () => {
        (0, analytics_1.sendAnalytics)('quit app');
    });
};
// Main function
const main = async () => {
    if (!electron_1.app.requestSingleInstanceLock()) {
        electron_1.app.quit();
        process.exit(0);
    }
    setupEnvironment();
    configurePlatformSpecifics();
    setupProtocol();
    setupAppEventListeners();
    (0, events_1.listenForIpcMessages)();
};
main();
//# sourceMappingURL=index.js.map