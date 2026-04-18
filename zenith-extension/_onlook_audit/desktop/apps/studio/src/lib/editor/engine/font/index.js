"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontManager = void 0;
const mobx_1 = require("mobx");
const utils_1 = require("@/lib/utils");
const models_1 = require("@onlook/models");
const webfontloader_1 = __importDefault(require("webfontloader"));
const flexsearch_1 = __importDefault(require("flexsearch"));
class FontManager {
    editorEngine;
    projectsManager;
    _fonts = [];
    _systemFonts = [];
    _searchResults = [];
    _allFontFamilies = models_1.fontFamilies;
    _defaultFont = null;
    _lastDefaultFont = null;
    disposers = [];
    _currentFontIndex = 0;
    _batchSize = 20;
    _isFetching = false;
    _fontSearchIndex;
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        // Initialize FlexSearch index
        this._fontSearchIndex = new flexsearch_1.default.Document({
            document: {
                id: 'id',
                index: ['family'],
                store: true,
            },
            tokenize: 'forward',
        });
        // Add all font families to the search index
        this._allFontFamilies.forEach((font) => {
            this._fontSearchIndex.add(font.id, {
                id: font.id,
                family: font.family,
                subsets: font.subsets,
                variable: font.variable,
                weights: font.weights,
                styles: font.styles,
            });
        });
        this.loadInitialFonts();
        const fontChangeHandler = (data) => {
            this._fonts = data.currentFonts;
        };
        const defaultFontChangeHandler = () => {
            this.getDefaultFont();
        };
        window.api.on(models_1.MainChannels.FONTS_CHANGED, fontChangeHandler);
        window.api.on(models_1.MainChannels.GET_DEFAULT_FONT, defaultFontChangeHandler);
        // Watch for project changes and set up watcher when a project is selected
        const disposer = (0, mobx_1.reaction)(() => this.projectsManager.project?.folderPath, (folderPath) => {
            console.log('Project path changed, setting up font watcher:', folderPath);
            if (folderPath) {
                this.watchFontFile(folderPath);
            }
        }, { fireImmediately: true });
        this.disposers.push(disposer);
        this.disposers.push(() => window.api.removeListener(models_1.MainChannels.FONTS_CHANGED, fontChangeHandler));
        this.disposers.push(() => window.api.removeListener(models_1.MainChannels.GET_DEFAULT_FONT, defaultFontChangeHandler));
    }
    convertFont(font) {
        return {
            ...font,
            weight: font.weights,
            styles: font.styles || [],
            variable: `--font-${font.id}`,
        };
    }
    async loadInitialFonts() {
        const initialFonts = this._allFontFamilies.slice(0, this._batchSize);
        const convertedFonts = initialFonts.map((font) => this.convertFont(font));
        this._systemFonts = convertedFonts;
        this._currentFontIndex = this._batchSize;
        try {
            await this.loadFontBatch(convertedFonts);
            console.log(`Initial ${convertedFonts.length} fonts loaded successfully`);
        }
        catch (error) {
            console.error('Failed to load initial fonts:', error);
        }
    }
    async loadFontBatch(fonts) {
        return new Promise((resolve, reject) => {
            webfontloader_1.default.load({
                google: {
                    families: fonts.map((font) => font.family),
                },
                active: () => {
                    console.log(`Batch of fonts loaded successfully`);
                    resolve();
                },
                inactive: () => {
                    console.warn(`Failed to load font batch`);
                    reject(new Error('Font loading failed'));
                },
                timeout: 30000, // 30 second timeout
            });
        });
    }
    async watchFontFile(projectRoot) {
        if (!projectRoot) {
            console.error('No project root provided, skipping font file watcher setup');
            return;
        }
        try {
            await (0, utils_1.invokeMainChannel)(models_1.MainChannels.WATCH_FONT_FILE, {
                projectRoot,
            });
        }
        catch (error) {
            console.error('Error setting up font file watcher:', error);
        }
    }
    async scanFonts() {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            console.error('No project root provided, skipping font file watcher setup');
            return;
        }
        const fonts = (await (0, utils_1.invokeMainChannel)(models_1.MainChannels.SCAN_FONTS, {
            projectRoot,
        }));
        this._fonts = fonts;
        return fonts;
    }
    async addFont(font) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            console.error('No project root provided, skipping font file watcher setup');
            return;
        }
        try {
            const result = (await (0, utils_1.invokeMainChannel)(models_1.MainChannels.ADD_FONT, {
                projectRoot,
                font,
            }));
            const writeCodeAction = {
                type: 'write-code',
                diffs: [result],
            };
            this.editorEngine.history.push(writeCodeAction);
        }
        catch (error) {
            console.error('Error adding font:', error);
        }
    }
    async removeFont(font) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            console.error('No project root provided, skipping font file watcher setup');
            return;
        }
        try {
            const result = (await (0, utils_1.invokeMainChannel)(models_1.MainChannels.REMOVE_FONT, {
                projectRoot,
                font,
            }));
            const writeCodeAction = {
                type: 'write-code',
                diffs: [result],
            };
            this.editorEngine.history.push(writeCodeAction);
            if (font.id === this.defaultFont) {
                this._defaultFont = null;
            }
        }
        catch (error) {
            console.error('Error removing font:', error);
        }
    }
    async setDefaultFont(font) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            console.error('No project root provided, skipping font file watcher setup');
            return;
        }
        try {
            const result = (await (0, utils_1.invokeMainChannel)(models_1.MainChannels.SET_FONT, {
                projectRoot,
                font,
            }));
            if (result) {
                const writeCodeAction = {
                    type: 'write-code',
                    diffs: [result],
                };
                this.editorEngine.history.push(writeCodeAction);
            }
            setTimeout(() => this.getDefaultFont(), 300);
        }
        catch (error) {
            console.error('Error setting font:', error);
        }
    }
    async getDefaultFont() {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            console.error('No project root provided, skipping font file watcher setup');
            return;
        }
        try {
            const defaultFont = (await (0, utils_1.invokeMainChannel)(models_1.MainChannels.GET_DEFAULT_FONT, {
                projectRoot,
            }));
            if (defaultFont !== this._lastDefaultFont) {
                this._lastDefaultFont = defaultFont;
                this._defaultFont = defaultFont;
            }
        }
        catch (error) {
            console.error('Error getting current font:', error);
        }
    }
    async uploadFonts(fontFiles) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            return;
        }
        try {
            await (0, utils_1.invokeMainChannel)(models_1.MainChannels.UPLOAD_FONTS, {
                projectRoot,
                fontFiles,
            });
            await this.scanFonts();
        }
        catch (error) {
            console.error('Error uploading fonts:', error);
        }
    }
    async fetchNextFontBatch() {
        if (this._isFetching) {
            console.log('Already fetching fonts, please wait...');
            return { fonts: [], hasMore: this._currentFontIndex < this._allFontFamilies.length };
        }
        this._isFetching = true;
        try {
            const start = this._currentFontIndex;
            const end = Math.min(start + this._batchSize, this._allFontFamilies.length);
            if (start >= this._allFontFamilies.length) {
                return { fonts: [], hasMore: false };
            }
            const batchFonts = this._allFontFamilies
                .slice(start, end)
                .map((font) => this.convertFont(font));
            await this.loadFontBatch(batchFonts);
            this._systemFonts.push(...batchFonts);
            this._currentFontIndex = end;
            return {
                fonts: batchFonts,
                hasMore: end < this._allFontFamilies.length,
            };
        }
        catch (error) {
            console.error('Error fetching font batch:', error);
            throw error;
        }
        finally {
            this._isFetching = false;
        }
    }
    async searchFonts(query) {
        if (!query) {
            this._searchResults = [];
            return [];
        }
        try {
            // Search using FlexSearch
            const searchResults = await this._fontSearchIndex.search(query, {
                limit: 20,
                suggest: true,
                enrich: true,
            });
            const fonts = Object.values(searchResults)
                .flatMap((result) => result.result)
                .map((font) => this.convertFont(font.doc))
                .filter((font) => !this._fonts.some((f) => f.family === font.family));
            if (fonts.length === 0) {
                this._searchResults = [];
                return [];
            }
            await this.loadFontBatch(fonts);
            this._searchResults = fonts;
            return fonts;
        }
        catch (error) {
            console.error('Error searching fonts:', error);
            return [];
        }
    }
    resetFontFetching() {
        this._currentFontIndex = 0;
        this._isFetching = false;
    }
    get fonts() {
        return this._fonts;
    }
    get systemFonts() {
        return this._systemFonts.filter((fontFamily) => !this._fonts.some((font) => font.family === fontFamily.family));
    }
    get defaultFont() {
        return this._defaultFont;
    }
    get searchResults() {
        return this._searchResults.filter((fontFamily) => !this._fonts.some((font) => font.family === fontFamily.family));
    }
    get isFetching() {
        return this._isFetching;
    }
    get currentFontIndex() {
        return this._currentFontIndex;
    }
    get hasMoreFonts() {
        return this._currentFontIndex < this._allFontFamilies.length;
    }
    dispose() {
        this._fonts = [];
        this._systemFonts = [];
        this._searchResults = [];
        this._defaultFont = null;
        this._lastDefaultFont = null;
        this._allFontFamilies = [];
        this._currentFontIndex = 0;
        this._batchSize = 20;
        this._isFetching = false;
        // Clean up all reactions
        this.disposers.forEach((disposer) => disposer());
        this.disposers = [];
    }
}
exports.FontManager = FontManager;
//# sourceMappingURL=index.js.map