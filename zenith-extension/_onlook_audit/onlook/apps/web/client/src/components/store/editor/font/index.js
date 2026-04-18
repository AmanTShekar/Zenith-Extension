"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontManager = void 0;
const parser_1 = require("@onlook/parser");
const mobx_1 = require("mobx");
const font_config_1 = require("./font-config");
const font_search_manager_1 = require("./font-search-manager");
const font_upload_manager_1 = require("./font-upload-manager");
const layout_manager_1 = require("./layout-manager");
const tailwind_config_1 = require("./tailwind-config");
class FontManager {
    editorEngine;
    _fonts = [];
    _fontFamilies = [];
    _defaultFont = null;
    _isScanning = false;
    _isUploading = false;
    previousFonts = [];
    // Managers
    fontSearchManager;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
        // Initialize managers
        this.fontSearchManager = new font_search_manager_1.FontSearchManager();
    }
    init() {
        this.loadInitialFonts();
        this.getCurrentDefaultFont();
        this.syncFontsWithConfigs();
    }
    async loadInitialFonts() {
        await this.fontSearchManager.loadInitialFonts();
    }
    async scanFonts() {
        this._isScanning = true;
        try {
            // Scan existing fonts and move them to config
            const existedFonts = await this.scanExistingFonts();
            if (existedFonts && existedFonts.length > 0) {
                await this.addFonts(existedFonts);
            }
            const fontConfigPath = await (0, font_config_1.getFontConfigPath)(this.editorEngine);
            if (!fontConfigPath) {
                console.error('No font config path found');
                return [];
            }
            // Scan fonts from config file
            const fonts = await (0, font_config_1.scanFontConfig)(fontConfigPath, this.editorEngine);
            this._fonts = fonts;
            // Update font search manager with current fonts
            this.fontSearchManager.updateFontsList(this._fonts);
            return fonts;
        }
        catch (error) {
            console.error('Error scanning fonts:', error);
            return [];
        }
        finally {
            this._isScanning = false;
        }
    }
    /**
     * Scan existing fonts declaration in the layout file and move them to the font config file
     */
    async scanExistingFonts() {
        try {
            const layoutPath = await this.editorEngine.activeSandbox.getLayoutPath();
            if (!layoutPath) {
                console.log('Could not get layout path');
                return [];
            }
            return await (0, font_config_1.scanExistingFonts)(layoutPath, this.editorEngine);
        }
        catch (error) {
            console.error('Error scanning existing fonts:', error);
            return [];
        }
    }
    /**
     * Adds a new font to the project
     */
    async addFont(font) {
        try {
            const fontConfigPath = await (0, font_config_1.getFontConfigPath)(this.editorEngine);
            if (!fontConfigPath) {
                console.error('No font config path found');
                return false;
            }
            const success = await (0, font_config_1.addFontToConfig)(font, fontConfigPath, this.editorEngine);
            if (success) {
                // Update the fonts array
                this._fonts.push(font);
                // Update font search manager with current fonts
                this.fontSearchManager.updateFontsList(this._fonts);
                // Load the new font in the search manager
                await this.fontSearchManager.loadFontFromBatch([font]);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error adding font:', error);
            return false;
        }
    }
    async addFonts(fonts) {
        for (const font of fonts) {
            await this.addFont(font);
        }
    }
    async removeFont(font) {
        try {
            const fontConfigPath = await (0, font_config_1.getFontConfigPath)(this.editorEngine);
            if (!fontConfigPath) {
                console.error('No font config path found');
                return false;
            }
            const result = await (0, font_config_1.removeFontFromConfig)(font, fontConfigPath, this.editorEngine);
            if (result) {
                // Remove from fonts array
                this._fonts = this._fonts.filter((f) => f.id !== font.id);
                // Update font search manager
                this.fontSearchManager.updateFontsList(this._fonts);
                if (font.id === this._defaultFont) {
                    this._defaultFont = null;
                }
                // Remove font variable and font class from layout file
                await (0, layout_manager_1.removeFontVariableFromRootLayout)(font.id, this.editorEngine);
                // Remove font from Tailwind config
                await (0, tailwind_config_1.removeFontFromTailwindConfig)(font, this.editorEngine.activeSandbox);
                return result;
            }
            return false;
        }
        catch (error) {
            console.error('Error removing font:', error);
            return false;
        }
    }
    async setDefaultFont(font) {
        try {
            this._defaultFont = font.id;
            const codeDiff = await (0, layout_manager_1.updateDefaultFontInRootLayout)(font, this.editorEngine);
            if (!codeDiff) {
                return false;
            }
            await this.editorEngine.fileSystem.writeFile(codeDiff.path, codeDiff.generated);
            // Reload all views after a delay to ensure the font is applied
            setTimeout(async () => {
                await this.editorEngine.frames.reloadAllViews();
            }, 500);
            return true;
        }
        catch (error) {
            console.error('Error setting default font:', error);
            return false;
        }
    }
    async clearDefaultFont() {
        try {
            if (!this._defaultFont) {
                return true; // Already no default font
            }
            const currentDefaultFontId = this._defaultFont;
            const success = await (0, layout_manager_1.clearDefaultFontFromRootLayout)(currentDefaultFontId, this.editorEngine);
            if (success) {
                this._defaultFont = null;
                // Reload all views after a delay
                setTimeout(async () => {
                    await this.editorEngine.frames.reloadAllViews();
                }, 500);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error clearing default font:', error);
            return false;
        }
    }
    async uploadFonts(fontFiles) {
        this._isUploading = true;
        try {
            const routerConfig = await this.editorEngine.activeSandbox.getRouterConfig();
            if (!routerConfig?.basePath) {
                console.error('Could not get base path');
                return false;
            }
            await this.ensureConfigFilesExist();
            const fontConfigPath = await (0, font_config_1.getFontConfigPath)(this.editorEngine);
            if (!fontConfigPath) {
                console.error('No font config path found');
                return false;
            }
            const fontConfig = await (0, font_config_1.readFontConfigFile)(fontConfigPath, this.editorEngine);
            if (!fontConfig) {
                console.error('Failed to read font config file');
                return false;
            }
            const result = await (0, font_upload_manager_1.uploadFonts)(this.editorEngine, fontFiles, routerConfig.basePath, fontConfig.ast);
            if (result.success) {
                const { code } = (0, parser_1.generate)(result.fontConfigAst);
                if (!fontConfigPath) {
                    return false;
                }
                await this.editorEngine.fileSystem.writeFile(fontConfigPath, code);
            }
            return result.success;
        }
        catch (error) {
            console.error('Error uploading fonts:', error);
            return false;
        }
        finally {
            this._isUploading = false;
        }
    }
    async fetchNextFontBatch() {
        return this.fontSearchManager.fetchNextFontBatch();
    }
    async searchFonts(query) {
        return this.fontSearchManager.searchFonts(query);
    }
    resetFontFetching() {
        this.fontSearchManager.resetFontFetching();
    }
    // Getters
    get fonts() {
        return this._fonts;
    }
    get fontFamilies() {
        return this._fontFamilies;
    }
    get systemFonts() {
        return this.fontSearchManager.systemFonts;
    }
    get defaultFont() {
        return this._defaultFont;
    }
    get searchResults() {
        return this.fontSearchManager.searchResults;
    }
    get isFetching() {
        return this.fontSearchManager.isFetching;
    }
    get isUploading() {
        return this._isUploading;
    }
    get isScanning() {
        return this._isScanning;
    }
    get currentFontIndex() {
        return this.fontSearchManager.currentFontIndex;
    }
    get hasMoreFonts() {
        return this.fontSearchManager.hasMoreFonts;
    }
    /**
     * Gets the default font from the project
     */
    async getCurrentDefaultFont() {
        try {
            const defaultFont = await (0, layout_manager_1.getCurrentDefaultFont)(this.editorEngine);
            if (defaultFont) {
                this._defaultFont = defaultFont;
            }
            return defaultFont;
        }
        catch (error) {
            console.error('Error getting current font:', error);
            return null;
        }
    }
    /**
     * Synchronizes detected fonts with the project configuration files
     */
    async syncFontsWithConfigs() {
        const sandbox = this.editorEngine.activeSandbox;
        try {
            const currentFonts = await this.scanFonts();
            const removedFonts = this.previousFonts.filter((prevFont) => !currentFonts.some((currFont) => currFont.id === prevFont.id));
            const addedFonts = currentFonts.filter((currFont) => !this.previousFonts.some((prevFont) => currFont.id === prevFont.id));
            if (removedFonts.length > 0) {
                for (const font of removedFonts) {
                    await (0, tailwind_config_1.removeFontFromTailwindConfig)(font, sandbox);
                    await (0, layout_manager_1.removeFontVariableFromRootLayout)(font.id, this.editorEngine);
                }
            }
            if (addedFonts.length > 0) {
                for (const font of addedFonts) {
                    await (0, tailwind_config_1.addFontToTailwindConfig)(font, sandbox);
                    await (0, layout_manager_1.addFontVariableToRootLayout)(font.id, this.editorEngine);
                }
            }
            if (removedFonts.length > 0 || addedFonts.length > 0) {
                this._fonts = currentFonts;
                // Update font search manager with current fonts
                this.fontSearchManager.updateFontsList(this._fonts);
            }
            this.previousFonts = currentFonts;
        }
        catch (error) {
            console.error('Error syncing fonts:', error);
        }
    }
    /**
     * Ensures both font config and tailwind config files exist
     */
    async ensureConfigFilesExist() {
        const sandbox = this.editorEngine.activeSandbox;
        if (!sandbox) {
            console.error('No sandbox session found');
            return;
        }
        const fontConfigPath = await (0, font_config_1.getFontConfigPath)(this.editorEngine);
        if (!fontConfigPath) {
            console.error('No font config path found');
            return;
        }
        await Promise.all([
            (0, font_config_1.ensureFontConfigFileExists)(fontConfigPath, this.editorEngine),
            (0, tailwind_config_1.ensureTailwindConfigExists)(sandbox),
        ]);
    }
    clear() {
        this._fonts = [];
        this.previousFonts = [];
        this._fontFamilies = [];
        this._defaultFont = null;
        this._isScanning = false;
        this._isUploading = false;
        this.fontSearchManager.clear();
        this.fontSearchManager.updateFontsList([]);
    }
}
exports.FontManager = FontManager;
//# sourceMappingURL=index.js.map