"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManager = void 0;
const utils_1 = require("@/lib/utils");
const models_1 = require("@onlook/models");
const assets_1 = require("@onlook/models/assets");
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
const colors_1 = __importDefault(require("tailwindcss/colors"));
const lodash_1 = require("lodash");
const non_secure_1 = require("nanoid/non-secure");
class ThemeManager {
    editorEngine;
    projectsManager;
    brandColors = {};
    defaultColors = {};
    configPath = null;
    cssPath = null;
    constructor(editorEngine, projectsManager) {
        this.editorEngine = editorEngine;
        this.projectsManager = projectsManager;
        (0, mobx_1.makeAutoObservable)(this);
        this.scanConfig();
    }
    reset() {
        this.defaultColors = {};
        this.brandColors = {};
        this.configPath = null;
        this.cssPath = null;
    }
    async scanConfig() {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            this.reset();
            return;
        }
        try {
            const configResult = (await (0, utils_1.invokeMainChannel)(models_1.MainChannels.SCAN_TAILWIND_CONFIG, {
                projectRoot,
            }));
            if (!configResult) {
                this.reset();
                return;
            }
            const { cssContent, configContent, cssPath, configPath } = configResult;
            this.cssPath = cssPath;
            this.configPath = configPath;
            const cssConfig = typeof cssContent === 'string' ? JSON.parse(cssContent) : cssContent;
            const config = typeof configContent === 'string' ? JSON.parse(configContent) : configContent;
            const lightModeColors = cssConfig.root || {};
            const darkModeColors = cssConfig.dark || {};
            const parsed = {};
            const groups = {};
            const processConfigObject = (obj, prefix = '', parentKey = '') => {
                Object.entries(obj).forEach(([key, value]) => {
                    const fullKey = prefix ? `${prefix}-${key}` : key;
                    if (parentKey) {
                        if (!groups[parentKey]) {
                            groups[parentKey] = new Set();
                        }
                        groups[parentKey].add(fullKey);
                    }
                    if (typeof value === 'object' &&
                        value !== null &&
                        !Array.isArray(value) &&
                        !('value' in value)) {
                        processConfigObject(value, prefix ? `${prefix}-${key}` : key, key);
                        if (models_1.DEFAULT_COLOR_NAME in value) {
                            const varName = extractVarName(value.DEFAULT);
                            if (varName) {
                                parsed[key] = {
                                    name: key,
                                    lightMode: lightModeColors[varName]?.value || '',
                                    darkMode: darkModeColors[varName]?.value || '',
                                    line: {
                                        config: config[varName]?.line,
                                        css: {
                                            lightMode: lightModeColors[varName]?.line,
                                            darkMode: darkModeColors[varName]?.line,
                                        },
                                    },
                                };
                            }
                        }
                    }
                    else if (typeof value === 'object' &&
                        value !== null &&
                        'value' in value &&
                        typeof value.value === 'string') {
                        // Try to extract the var name first
                        const varName = extractVarName(value.value);
                        if (varName) {
                            parsed[fullKey] = {
                                name: fullKey,
                                lightMode: lightModeColors[varName]?.value || '',
                                darkMode: darkModeColors[varName]?.value || '',
                                line: {
                                    config: value.line,
                                    css: {
                                        lightMode: lightModeColors[varName]?.line,
                                        darkMode: darkModeColors[varName]?.line,
                                    },
                                },
                            };
                        }
                        else {
                            const color = utility_1.Color.from(value.value);
                            if (color) {
                                parsed[fullKey] = {
                                    name: fullKey,
                                    lightMode: color.toHex(),
                                    darkMode: color.toHex(),
                                    line: {
                                        config: value.line,
                                        css: {
                                            lightMode: lightModeColors[fullKey]?.line,
                                            darkMode: darkModeColors[fullKey]?.line,
                                        },
                                    },
                                };
                            }
                        }
                    }
                });
            };
            const extractVarName = (value) => {
                if (typeof value !== 'string') {
                    return null;
                }
                const match = value.match(/var\(--([^)]+)\)/);
                return match ? match[1] : null;
            };
            processConfigObject(config);
            // Convert groups to color items for UI
            const colorGroupsObj = {};
            Object.entries(groups).forEach(([groupName, colorKeys]) => {
                if (colorKeys.size > 0) {
                    colorGroupsObj[groupName] = Array.from(colorKeys).map((key) => {
                        const color = parsed[key];
                        return {
                            name: key.includes('-') ? key.split('-').pop() || key : key,
                            originalKey: key,
                            lightColor: color?.lightMode || '',
                            darkColor: color?.darkMode || '',
                            line: {
                                config: color?.line?.config,
                                css: color?.line?.css,
                            },
                        };
                    });
                }
            });
            // Handle any top-level colors that aren't part of a group
            const ungroupedKeys = Object.keys(parsed).filter((key) => {
                const isInGroup = Object.values(groups).some((set) => set.has(key));
                if (isInGroup) {
                    return false;
                }
                const isPrefix = Object.values(groups).some((set) => Array.from(set).some((groupedKey) => groupedKey.startsWith(key + '-')));
                return !isPrefix;
            });
            if (ungroupedKeys.length > 0) {
                ungroupedKeys.forEach((key) => {
                    colorGroupsObj[key] = [
                        {
                            name: models_1.DEFAULT_COLOR_NAME,
                            originalKey: `${key}-DEFAULT`,
                            lightColor: parsed[key].lightMode,
                            darkColor: parsed[key].darkMode,
                            line: parsed[key].line,
                        },
                    ];
                });
            }
            const defaultColors = this.generateDefaultColors(lightModeColors, darkModeColors, config);
            if (defaultColors) {
                this.defaultColors = defaultColors;
            }
            this.brandColors = colorGroupsObj;
        }
        catch (error) {
            this.reset();
            console.error('Error loading colors:', error);
        }
    }
    generateDefaultColors(lightModeColors, darkModeColors, config) {
        const deprecatedColors = ['lightBlue', 'warmGray', 'trueGray', 'coolGray', 'blueGray'];
        const excludedColors = [
            'inherit',
            'current',
            'transparent',
            'black',
            'white',
            ...deprecatedColors,
        ];
        // Create a record instead of an array
        const defaultColorsRecord = {};
        Object.keys(colors_1.default)
            .filter((colorName) => !excludedColors.includes(colorName))
            .forEach((colorName) => {
            const defaultColorScale = colors_1.default[colorName];
            if (typeof defaultColorScale !== 'object' || defaultColorScale === null) {
                return;
            }
            // Create color items for each shade in the scale
            const colorItems = Object.entries(defaultColorScale)
                .filter(([shade]) => shade !== models_1.DEFAULT_COLOR_NAME)
                .map(([shade, defaultValue]) => {
                const lightModeValue = lightModeColors[`${colorName}-${shade}`]?.value;
                const darkModeValue = darkModeColors[`${colorName}-${shade}`]?.value;
                return {
                    name: shade,
                    originalKey: `${colorName}-${shade}`,
                    lightColor: lightModeValue || defaultValue,
                    darkColor: darkModeValue || defaultValue,
                    line: {
                        config: config[`${colorName}-${shade}`]?.line,
                        css: {
                            lightMode: lightModeColors[`${colorName}-${shade}`]?.line,
                            darkMode: darkModeColors[`${colorName}-${shade}`]?.line,
                        },
                    },
                    override: !!lightModeValue || !!darkModeValue,
                };
            });
            // Add custom shades
            const customShades = Object.keys(lightModeColors)
                .filter((key) => key.startsWith(`${colorName}-`))
                .map((key) => key.split('-')[1])
                .filter((shade) => !colorItems.some((item) => item.name === shade));
            customShades.forEach((shade) => {
                const lightModeValue = lightModeColors[`${colorName}-${shade}`]?.value;
                const darkModeValue = darkModeColors[`${colorName}-${shade}`]?.value;
                colorItems.push({
                    name: shade,
                    originalKey: `${colorName}-${shade}`,
                    lightColor: lightModeValue || '',
                    darkColor: darkModeValue || '',
                    line: {
                        config: config[`${colorName}-${shade}`]?.line,
                        css: {
                            lightMode: lightModeColors[`${colorName}-${shade}`]?.line,
                            darkMode: darkModeColors[`${colorName}-${shade}`]?.line,
                        },
                    },
                    override: true,
                });
            });
            // Sort color items by shade number
            colorItems.sort((a, b) => {
                const aNum = parseInt(a.name);
                const bNum = parseInt(b.name);
                return aNum - bNum;
            });
            // Add to record instead of array
            defaultColorsRecord[colorName] = colorItems;
        });
        return defaultColorsRecord;
    }
    async rename(oldName, newName) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            return;
        }
        try {
            await (0, utils_1.invokeMainChannel)(models_1.MainChannels.UPDATE_TAILWIND_CONFIG, {
                projectRoot,
                originalKey: oldName,
                newName: newName,
            });
            // Refresh colors after rename
            this.scanConfig();
        }
        catch (error) {
            console.error('Error renaming color group:', error);
        }
    }
    async delete(groupName, colorName) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            return;
        }
        try {
            await (0, utils_1.invokeMainChannel)(models_1.MainChannels.DELETE_TAILWIND_CONFIG, {
                projectRoot,
                groupName: groupName,
                colorName,
            });
            // Refresh colors after deletion
            this.scanConfig();
        }
        catch (error) {
            console.error('Error deleting color:', error);
        }
    }
    async update(groupName, index, newColor, newName, parentName, theme, shouldSaveToConfig = false) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            return;
        }
        try {
            // For new colors, pass empty originalKey and parentName
            const originalGroupName = (0, lodash_1.camelCase)(groupName);
            const originalParentName = (0, lodash_1.camelCase)(parentName);
            const originalKey = this.brandColors[originalGroupName]?.[index]?.originalKey || '';
            // If is selected element, update the color in real-time
            // Base on the class name, find the styles to update
            // Only save to Tailwind config if explicitly requested
            if (shouldSaveToConfig) {
                await (0, utils_1.invokeMainChannel)(models_1.MainChannels.UPDATE_TAILWIND_CONFIG, {
                    projectRoot,
                    originalKey,
                    newColor: newColor.toHex(),
                    newName,
                    parentName: originalParentName,
                    theme,
                });
                // Refresh colors after update
                this.scanConfig();
                // Force a theme refresh for all frames
                await this.editorEngine.webviews.reloadWebviews();
            }
        }
        catch (error) {
            console.error('Error updating color:', error);
        }
    }
    async add(newName) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot || !newName.trim()) {
            return;
        }
        try {
            await (0, utils_1.invokeMainChannel)(models_1.MainChannels.UPDATE_TAILWIND_CONFIG, {
                projectRoot,
                originalName: '',
                newName: newName.trim(),
                newColor: '#FFFFFF',
            });
            // Refresh colors
            this.scanConfig();
        }
        catch (error) {
            console.error('Error adding color group:', error);
        }
    }
    async handleDefaultColorChange(colorFamily, index, newColor, theme) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            return;
        }
        try {
            await (0, utils_1.invokeMainChannel)(models_1.MainChannels.UPDATE_TAILWIND_CONFIG, {
                projectRoot,
                originalKey: `${colorFamily}-${index * 100}`,
                newColor: newColor.toHex(),
                theme,
            });
            // Refresh colors after update
            this.scanConfig();
        }
        catch (error) {
            console.error('Error updating default color:', error);
        }
    }
    async duplicate(groupName, colorName, isDefaultPalette, theme) {
        const projectRoot = this.projectsManager.project?.folderPath;
        if (!projectRoot) {
            return;
        }
        try {
            if (isDefaultPalette) {
                const colorToDuplicate = this.defaultColors[groupName];
                if (!colorToDuplicate || colorToDuplicate.length === 0) {
                    throw new Error('Color not found');
                }
                const colorIndex = colorToDuplicate.length;
                const color = utility_1.Color.from(colorToDuplicate[colorIndex - 1].lightColor);
                await this.handleDefaultColorChange(groupName, colorIndex, color, theme);
            }
            else {
                const group = this.brandColors[groupName];
                const colorToDuplicate = group?.find((color) => color.name === colorName);
                if (!colorToDuplicate) {
                    throw new Error('Color not found');
                }
                // Generate a unique name for the duplicated color
                const existingNames = group.map((color) => color.name);
                let newName;
                if (isNaN(Number(colorName))) {
                    // For non-numeric names, use the generateUniqueName utility
                    newName = (0, utility_1.generateUniqueName)(colorName, existingNames);
                }
                else {
                    // For numeric names, generate a random numeric suffix
                    const randomId = (0, non_secure_1.customAlphabet)('0123456789', 5)();
                    newName = `${colorName}${randomId}`;
                }
                const color = utility_1.Color.from(theme === assets_1.Theme.DARK
                    ? colorToDuplicate.darkColor || colorToDuplicate.lightColor
                    : colorToDuplicate.lightColor);
                await this.update(groupName, group.length, color, newName, groupName, theme, true);
                this.scanConfig();
            }
        }
        catch (error) {
            console.error('Error duplicating color:', error);
        }
    }
    get colorGroups() {
        return this.brandColors;
    }
    get colorDefaults() {
        return this.defaultColors;
    }
    get tailwindConfigPath() {
        return this.configPath;
    }
    get tailwindCssPath() {
        return this.cssPath;
    }
    getColorByName(colorName) {
        const [groupName, shadeName] = colorName.split('-');
        const brandGroup = this.brandColors[groupName];
        if (brandGroup) {
            if (!shadeName || shadeName === models_1.DEFAULT_COLOR_NAME) {
                const defaultColor = brandGroup.find((color) => color.name === models_1.DEFAULT_COLOR_NAME);
                if (defaultColor?.lightColor) {
                    return defaultColor.lightColor;
                }
            }
            else {
                const color = brandGroup.find((color) => color.name === shadeName);
                if (color?.lightColor) {
                    return color.lightColor;
                }
            }
        }
        const defaultGroup = this.defaultColors[groupName];
        if (defaultGroup && shadeName) {
            const color = defaultGroup.find((color) => color.name === shadeName);
            if (color?.lightColor) {
                return color.lightColor;
            }
        }
        return undefined;
    }
    dispose() {
        this.brandColors = {};
        this.defaultColors = {};
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=index.js.map