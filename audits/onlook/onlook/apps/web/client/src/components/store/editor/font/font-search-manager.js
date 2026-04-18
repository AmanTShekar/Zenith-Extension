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
exports.FontSearchManager = void 0;
const fonts_1 = require("@onlook/fonts");
const FlexSearch = __importStar(require("flexsearch"));
const mobx_1 = require("mobx");
class FontSearchManager {
    _systemFonts = [];
    _searchResults = [];
    _currentFontIndex = 0;
    _batchSize = 20;
    _isFetching = false;
    _fontSearchIndex;
    _allFontFamilies = fonts_1.FAMILIES;
    _fonts = [];
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        // Initialize FlexSearch index
        this._fontSearchIndex = new FlexSearch.Document({
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
    }
    async loadInitialFonts() {
        const initialFonts = this._allFontFamilies.slice(0, this._batchSize);
        const convertedFonts = initialFonts.map((font) => (0, fonts_1.convertRawFont)(font));
        this._systemFonts = convertedFonts;
        this._currentFontIndex = this._batchSize;
        try {
            await this.loadFontBatch(convertedFonts);
        }
        catch (error) {
            console.error('Failed to load initial fonts:', error);
        }
    }
    async loadFontBatch(fonts) {
        if (typeof window === 'undefined') {
            console.error('window is undefined');
            return;
        }
        const WebFont = await Promise.resolve().then(() => __importStar(require('webfontloader')));
        return new Promise((resolve, reject) => {
            WebFont.load({
                google: {
                    families: fonts.map((font) => font.family),
                },
                active: () => {
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
    async fetchNextFontBatch() {
        if (this._isFetching) {
            console.log('Already fetching fonts, please wait...');
            return {
                fonts: [],
                hasMore: this._currentFontIndex < this._allFontFamilies.length,
            };
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
                .map((font) => (0, fonts_1.convertRawFont)(font));
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
            const searchResults = this._fontSearchIndex.search(query, {
                limit: 20,
                suggest: true,
                enrich: true,
            });
            const fonts = Object.values(searchResults)
                .flatMap((result) => result.result)
                .filter((font) => font.doc !== null)
                .map((font) => (0, fonts_1.convertRawFont)(font.doc))
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
    async loadFontFromBatch(fonts) {
        await this.loadFontBatch(fonts);
    }
    resetFontFetching() {
        this._currentFontIndex = 0;
        this._isFetching = false;
    }
    updateFontsList(fonts) {
        this._fonts = fonts;
    }
    clear() {
        this._systemFonts = [];
        this._searchResults = [];
        this._currentFontIndex = 0;
        this._isFetching = false;
        this._fonts = [];
    }
    get systemFonts() {
        return this._systemFonts.filter((fontFamily) => !this._fonts.some((font) => font.family === fontFamily.family));
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
}
exports.FontSearchManager = FontSearchManager;
//# sourceMappingURL=font-search-manager.js.map