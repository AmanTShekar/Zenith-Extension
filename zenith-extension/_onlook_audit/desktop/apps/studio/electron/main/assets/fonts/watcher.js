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
exports.FontFileWatcher = void 0;
const watcher_1 = require("@parcel/watcher");
const constants_1 = require("@onlook/models/constants");
const pathModule = __importStar(require("path"));
const scanner_1 = require("./scanner");
const fs_1 = __importDefault(require("fs"));
const layout_1 = require("./layout");
const layout_2 = require("./layout");
const tailwind_1 = require("./tailwind");
const pages_1 = require("../../pages");
const index_1 = require("../../index");
class FontFileWatcher {
    subscription = null;
    previousFonts = [];
    selfModified = new Set();
    async watch(projectRoot) {
        await this.clearSubscription();
        const _fontPath = pathModule.resolve(projectRoot, constants_1.DefaultSettings.FONT_CONFIG);
        const fontDir = pathModule.dirname(_fontPath);
        let _layoutPath = '';
        let _appPath = '';
        if (!fs_1.default.existsSync(fontDir)) {
            console.error(`Font directory does not exist: ${fontDir}`);
            return false;
        }
        try {
            this.previousFonts = await (0, scanner_1.scanFonts)(projectRoot);
        }
        catch (error) {
            console.error('Error scanning initial fonts state:', error);
            this.previousFonts = [];
        }
        const routerConfig = await (0, pages_1.detectRouterType)(projectRoot);
        if (routerConfig) {
            if (routerConfig.type === 'app') {
                _layoutPath = pathModule.join(routerConfig.basePath, 'layout.tsx');
            }
            else {
                _appPath = pathModule.join(routerConfig.basePath, '_app.tsx');
            }
        }
        try {
            this.subscription = await (0, watcher_1.subscribe)(fontDir, (err, events) => {
                if (err) {
                    console.error(`Font watcher error: ${err}`);
                    return;
                }
                if (events.length > 0) {
                    for (const event of events) {
                        const eventPath = pathModule.normalize(event.path);
                        const fontPath = pathModule.normalize(_fontPath);
                        const layoutPath = pathModule.normalize(_layoutPath);
                        const appPath = pathModule.normalize(_appPath);
                        if (this.selfModified.has(eventPath)) {
                            this.selfModified.delete(eventPath);
                            continue;
                        }
                        if ((eventPath === fontPath ||
                            eventPath.endsWith(constants_1.DefaultSettings.FONT_CONFIG)) &&
                            (event.type === 'update' || event.type === 'create')) {
                            try {
                                this.syncFontsWithConfigs(projectRoot);
                            }
                            catch (error) {
                                console.error('Error syncing fonts with configs:', error);
                            }
                        }
                        if ((eventPath === layoutPath || eventPath === appPath) &&
                            (event.type === 'update' || event.type === 'create')) {
                            this.selfModified.add(eventPath);
                            try {
                                index_1.mainWindow?.webContents.send(constants_1.MainChannels.GET_DEFAULT_FONT);
                            }
                            catch (error) {
                                console.error('Error syncing fonts with configs:', error);
                            }
                        }
                    }
                }
            }, {
                ignore: ['**/node_modules/**', '**/.git/**'],
            });
            return true;
        }
        catch (error) {
            console.error('Error setting up font file watcher subscription:', error);
            return false;
        }
    }
    async syncFontsWithConfigs(projectRoot) {
        try {
            const currentFonts = await (0, scanner_1.scanFonts)(projectRoot);
            const removedFonts = this.previousFonts.filter((prevFont) => !currentFonts.some((currFont) => currFont.id === prevFont.id));
            const addedFonts = currentFonts.filter((currFont) => !this.previousFonts.some((prevFont) => currFont.id === prevFont.id));
            for (const font of removedFonts) {
                const routerConfig = await (0, pages_1.detectRouterType)(projectRoot);
                if (routerConfig) {
                    if (routerConfig.type === 'app') {
                        const layoutPath = pathModule.join(routerConfig.basePath, 'layout.tsx');
                        this.selfModified.add(layoutPath);
                        await (0, layout_2.removeFontVariableFromLayout)(layoutPath, font.id, ['html']);
                    }
                    else {
                        const appPath = pathModule.join(routerConfig.basePath, '_app.tsx');
                        this.selfModified.add(appPath);
                        await (0, layout_2.removeFontVariableFromLayout)(appPath, font.id, [
                            'div',
                            'main',
                            'section',
                            'body',
                        ]);
                    }
                }
                const tailwindConfigPath = pathModule.join(projectRoot, 'tailwind.config.ts');
                this.selfModified.add(tailwindConfigPath);
                await (0, tailwind_1.removeFontFromTailwindConfig)(projectRoot, font);
            }
            if (addedFonts.length > 0) {
                for (const font of addedFonts) {
                    const tailwindConfigPath = pathModule.join(projectRoot, 'tailwind.config.ts');
                    this.selfModified.add(tailwindConfigPath);
                    await (0, tailwind_1.updateTailwindFontConfig)(projectRoot, font);
                    const routerConfig = await (0, pages_1.detectRouterType)(projectRoot);
                    if (routerConfig) {
                        if (routerConfig.type === 'app') {
                            const layoutPath = pathModule.join(routerConfig.basePath, 'layout.tsx');
                            this.selfModified.add(layoutPath);
                            await (0, layout_1.addFontVariableToLayout)(projectRoot, font.id);
                        }
                        else {
                            const appPath = pathModule.join(routerConfig.basePath, '_app.tsx');
                            this.selfModified.add(appPath);
                            await (0, layout_1.addFontVariableToLayout)(projectRoot, font.id);
                        }
                    }
                }
            }
            if (removedFonts.length > 0 || addedFonts.length > 0) {
                index_1.mainWindow?.webContents.send(constants_1.MainChannels.FONTS_CHANGED, {
                    currentFonts,
                    removedFonts,
                    addedFonts,
                });
            }
            this.previousFonts = currentFonts;
        }
        catch (error) {
            console.error('Error syncing fonts:', error);
        }
    }
    async clearSubscription() {
        if (this.subscription) {
            await this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}
exports.FontFileWatcher = FontFileWatcher;
//# sourceMappingURL=watcher.js.map