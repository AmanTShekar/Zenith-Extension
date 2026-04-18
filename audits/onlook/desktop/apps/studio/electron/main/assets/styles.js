"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTailwindColorConfig = updateTailwindColorConfig;
exports.deleteTailwindColorGroup = deleteTailwindColorGroup;
exports.scanTailwindConfig = scanTailwindConfig;
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const assets_1 = require("@onlook/models/assets");
const constants_1 = require("@onlook/models/constants");
const utility_1 = require("@onlook/utility");
const lodash_1 = require("lodash");
const path_1 = __importDefault(require("path"));
const postcss_1 = __importDefault(require("postcss"));
const classes_1 = require("../code/classes");
const helpers_1 = require("../code/diff/helpers");
const transform_1 = require("../code/diff/transform");
const files_1 = require("../code/files");
const helpers_2 = require("./helpers");
const colors_1 = __importDefault(require("tailwindcss/colors"));
async function updateTailwindColorConfig(projectRoot, originalKey, newColor, newName, theme, parentName) {
    try {
        const colorUpdate = await (0, helpers_2.initializeTailwindColorContent)(projectRoot);
        if (!colorUpdate) {
            return { success: false, error: 'Failed to prepare color update' };
        }
        // Check if this is a default color update
        const camelCaseName = newName === constants_1.DEFAULT_COLOR_NAME ? newName : (0, lodash_1.camelCase)(newName);
        if (originalKey) {
            const [parentKey, keyName] = originalKey.split('-');
            const isDefaultColor = parentKey && colors_1.default[parentKey];
            if (isDefaultColor) {
                const colorIndex = parseInt(keyName) / 100;
                await updateDefaultTailwindColor(colorUpdate, parentKey, colorIndex, newColor, theme);
                return { success: true };
            }
            return updateTailwindColorVariable(colorUpdate, originalKey, newColor, camelCaseName, theme);
        }
        else {
            return createTailwindColorVariable(colorUpdate, newColor, camelCaseName, parentName);
        }
    }
    catch (error) {
        console.error('Error updating Tailwind config:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
function addTailwindNestedColor(colorObj, parentName, newName, newCssVarName) {
    const parentColorObj = colorObj.properties.find((prop) => isValidTailwindConfigProperty(prop, parentName));
    if (parentColorObj) {
        if (parentColorObj.value.type === 'StringLiteral') {
            const oldValue = parentColorObj.value.value;
            parentColorObj.value = {
                type: 'ObjectExpression',
                properties: [
                    {
                        type: 'ObjectProperty',
                        key: {
                            type: 'Identifier',
                            name: constants_1.DEFAULT_COLOR_NAME,
                        },
                        value: {
                            type: 'StringLiteral',
                            value: oldValue,
                        },
                        computed: false,
                        shorthand: false,
                    },
                    {
                        type: 'ObjectProperty',
                        key: {
                            type: 'Identifier',
                            name: newName,
                        },
                        value: {
                            type: 'StringLiteral',
                            value: `var(--${newCssVarName})`,
                        },
                        computed: false,
                        shorthand: false,
                    },
                ],
            };
        }
        else if (parentColorObj.value.type === 'ObjectExpression') {
            parentColorObj.value.properties.push({
                type: 'ObjectProperty',
                key: {
                    type: 'Identifier',
                    name: newName,
                },
                value: {
                    type: 'StringLiteral',
                    value: `var(--${newCssVarName})`,
                },
                computed: false,
                shorthand: false,
            });
        }
    }
}
async function createTailwindColorVariable({ configPath, cssPath, configContent, cssContent }, newColor, newName, parentName) {
    const newCssVarName = parentName?.length ? `${parentName}-${newName}` : newName;
    // Check if CSS variable already exists
    const cssVariables = extractTailwindCssVariables(cssContent);
    if (cssVariables.root[newCssVarName] || cssVariables.dark[newCssVarName]) {
        return { success: false, error: `CSS variable --${newCssVarName} already exists` };
    }
    else {
        // Variable doesn't exist, add it
        const updatedCssContent = await addTailwindCssVariable(cssContent, newCssVarName, newColor);
        const formattedContent = await (0, files_1.formatContent)(cssPath, updatedCssContent);
        await (0, files_1.writeFile)(cssPath, formattedContent);
    }
    // Update config file
    const updateAst = (0, parser_1.parse)(configContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });
    (0, traverse_1.default)(updateAst, {
        ObjectProperty(path) {
            if ((0, helpers_2.isColorsObjectProperty)(path)) {
                const colorObj = path.node.value;
                if (!(0, helpers_2.isObjectExpression)(colorObj)) {
                    return;
                }
                if (!parentName) {
                    (0, helpers_2.addTailwindRootColor)(colorObj, newName, newCssVarName);
                }
                else {
                    addTailwindNestedColor(colorObj, parentName, newName, newCssVarName);
                }
            }
        },
    });
    const output = (0, generator_1.default)(updateAst, { compact: false }, configContent);
    const formattedOutput = await (0, files_1.formatContent)(configPath, output.code);
    await (0, files_1.writeFile)(configPath, formattedOutput);
    return { success: true };
}
function updateTailwindConfigFile(configContent, parentKey, keyName, newName, newCssVarName) {
    let keyUpdated = false;
    let valueUpdated = false;
    const { output } = (0, helpers_2.modifyTailwindConfig)(configContent, {
        visitor: (path) => {
            if ((0, helpers_2.isColorsObjectProperty)(path)) {
                const colorObj = path.node.value;
                if (!(0, helpers_2.isObjectExpression)(colorObj)) {
                    return false;
                }
                colorObj.properties.forEach((colorProp) => {
                    if (colorProp.type === 'ObjectProperty' &&
                        (colorProp.key.type === 'Identifier' ||
                            colorProp.key.type === 'NumericLiteral') &&
                        (colorProp.key.type === 'Identifier'
                            ? colorProp.key.name === parentKey
                            : String(colorProp.key.value) === parentKey)) {
                        // If the keyName is not provided, we are renaming the root color
                        if (!keyName) {
                            if (parentKey && newName !== parentKey) {
                                if (colorProp.key.type === 'Identifier') {
                                    colorProp.key.name = newName;
                                }
                                else {
                                    colorProp.key = {
                                        type: 'Identifier',
                                        name: newName,
                                    };
                                }
                                keyUpdated = true;
                                // Then we need to update the child css variables or direct color values
                                if (colorProp.value.type === 'ObjectExpression') {
                                    colorProp.value.properties.forEach((nestedProp) => {
                                        if (nestedProp.type === 'ObjectProperty' &&
                                            (nestedProp.key.type === 'Identifier' ||
                                                nestedProp.key.type === 'NumericLiteral') &&
                                            nestedProp.value.type === 'StringLiteral') {
                                            // Special handling for DEFAULT
                                            const keyValue = nestedProp.key.type === 'Identifier'
                                                ? nestedProp.key.name
                                                : String(nestedProp.key.value);
                                            const oldVarName = keyValue === constants_1.DEFAULT_COLOR_NAME
                                                ? parentKey
                                                : `${parentKey}-${keyValue}`;
                                            const newVarName = keyValue === constants_1.DEFAULT_COLOR_NAME
                                                ? newName
                                                : `${newName}-${keyValue}`;
                                            nestedProp.value.value = nestedProp.value.value.replace(new RegExp(`--${oldVarName}`, 'g'), `--${newVarName}`);
                                        }
                                    });
                                }
                                else if (colorProp.value.type === 'StringLiteral') {
                                    colorProp.value.value = colorProp.value.value.replace(new RegExp(`--${parentKey}`, 'g'), `--${newName}`);
                                }
                            }
                        }
                        else {
                            const nestedObj = colorProp.value;
                            if (!(0, helpers_2.isObjectExpression)(nestedObj)) {
                                return false;
                            }
                            nestedObj.properties.forEach((nestedProp) => {
                                if (nestedProp.type === 'ObjectProperty' &&
                                    (nestedProp.key.type === 'Identifier' ||
                                        nestedProp.key.type === 'NumericLiteral') &&
                                    ((nestedProp.key.type === 'Identifier' &&
                                        nestedProp.key.name === keyName) ||
                                        (nestedProp.key.type === 'NumericLiteral' &&
                                            String(nestedProp.key.value) === keyName))) {
                                    if (newName !== keyName) {
                                        if (nestedProp.key.type === 'Identifier') {
                                            nestedProp.key.name = newName;
                                        }
                                        else if (nestedProp.key.type === 'NumericLiteral') {
                                            nestedProp.key = {
                                                type: 'Identifier',
                                                name: newName,
                                            };
                                        }
                                        keyUpdated = true;
                                    }
                                    if (nestedProp.value.type === 'StringLiteral') {
                                        // Special handling for DEFAULT values
                                        const varName = keyName === constants_1.DEFAULT_COLOR_NAME
                                            ? parentKey
                                            : newCssVarName;
                                        nestedProp.value.value = `var(--${varName})`;
                                        valueUpdated = true;
                                    }
                                }
                            });
                        }
                    }
                });
                return keyUpdated || valueUpdated;
            }
            return false;
        },
    });
    return { keyUpdated, valueUpdated, output };
}
async function updateTailwindColorVariable({ configPath, cssPath, configContent, cssContent }, originalName, newColor, newName, theme) {
    const [parentKey, keyName] = originalName.split('-');
    if (!parentKey) {
        return { success: false, error: `Invalid color key format: ${originalName}` };
    }
    let newCssVarName;
    // If the keyName is not provided, we are renaming the root color
    if (!keyName) {
        newCssVarName = newName !== parentKey ? `${newName}` : originalName;
    }
    else {
        // Special handling for DEFAULT
        if (keyName === constants_1.DEFAULT_COLOR_NAME) {
            newCssVarName = parentKey;
            originalName = parentKey;
        }
        else {
            newCssVarName = newName !== keyName ? `${parentKey}-${newName}` : originalName;
        }
    }
    // Update CSS file
    const updatedCssContent = await updateTailwindCssVariable(cssContent, originalName, newCssVarName, newColor, theme);
    const formattedContent = await (0, files_1.formatContent)(cssPath, updatedCssContent);
    await (0, files_1.writeFile)(cssPath, formattedContent);
    // Update config file
    const { keyUpdated, valueUpdated, output } = updateTailwindConfigFile(configContent, parentKey, keyName, newName, newCssVarName);
    if (keyUpdated || valueUpdated) {
        const formattedContent = await (0, files_1.formatContent)(configPath, output);
        await (0, files_1.writeFile)(configPath, formattedContent);
        // Update class references if the name changed
        if (keyUpdated) {
            const projectRoot = path_1.default.dirname(configPath);
            const replacements = [];
            if (!keyName) {
                replacements.push({
                    oldClass: parentKey,
                    newClass: newName,
                });
            }
            else {
                replacements.push({
                    oldClass: `${parentKey}-${keyName}`,
                    newClass: `${parentKey}-${newName}`,
                });
            }
            await updateClassReferences(projectRoot, replacements);
        }
    }
    else {
        console.log(`Warning: Could not update key: ${keyName} in ${parentKey}`);
    }
    return { success: true };
}
// Helper to process CSS with PostCSS
async function processCss(css, plugins) {
    const result = await (0, postcss_1.default)(plugins).process(css, {
        from: undefined, // Prevents source map generation
    });
    return result.css;
}
async function addTailwindCssVariable(cssContent, varName, color) {
    return processCss(cssContent, [
        {
            postcssPlugin: 'add-css-var',
            Once(root) {
                root.walkRules(':root', (rule) => {
                    rule.append({ prop: `--${varName}`, value: color });
                });
                root.walkRules('.dark', (rule) => {
                    rule.append({ prop: `--${varName}`, value: color });
                });
            },
        },
    ]);
}
// Update existing CSS variable
async function updateTailwindCssVariable(cssContent, originalName, newVarName, newColor, theme) {
    return processCss(cssContent, [
        {
            postcssPlugin: 'update-css-var',
            Once(root) {
                let rootValue;
                let darkValue;
                let hasRootVar = false;
                let hasDarkVar = false;
                root.walkRules(':root', (rule) => {
                    rule.walkDecls(`--${originalName}`, (decl) => {
                        rootValue = decl.value;
                        hasRootVar = true;
                    });
                });
                root.walkRules('.dark', (rule) => {
                    rule.walkDecls(`--${originalName}`, (decl) => {
                        darkValue = decl.value;
                        hasDarkVar = true;
                    });
                });
                // Create new variables if they don't exist and we have both newVarName and newColor
                if (newVarName && newColor) {
                    if (!hasRootVar) {
                        root.walkRules(':root', (rule) => {
                            rule.append({ prop: `--${newVarName}`, value: newColor });
                        });
                    }
                    if (!hasDarkVar) {
                        root.walkRules('.dark', (rule) => {
                            rule.append({ prop: `--${newVarName}`, value: newColor });
                        });
                    }
                }
                root.walkRules(/^(:root|\.dark)$/, (rule) => {
                    const isDarkTheme = rule.selector === '.dark';
                    const shouldUpdateValue = newColor &&
                        (!theme || (isDarkTheme ? theme === assets_1.Theme.DARK : theme === assets_1.Theme.LIGHT));
                    rule.walkDecls((decl) => {
                        if (decl.prop === `--${originalName}`) {
                            const otherThemeValue = isDarkTheme ? rootValue : darkValue;
                            const isOtherThemeHex = otherThemeValue?.startsWith('#');
                            const shouldConvertToHex = newColor?.startsWith('#') || isOtherThemeHex;
                            if (newVarName && newVarName !== originalName) {
                                // Handle variable rename
                                let valueToUse = shouldUpdateValue ? newColor : decl.value;
                                if (shouldConvertToHex && !valueToUse.startsWith('#')) {
                                    try {
                                        const color = (0, utility_1.parseHslValue)(valueToUse);
                                        if (color) {
                                            valueToUse = color.toHex();
                                        }
                                    }
                                    catch (err) {
                                        console.error('Failed to convert to hex:', err);
                                    }
                                }
                                rule.append({
                                    prop: `--${newVarName}`,
                                    value: valueToUse,
                                });
                                decl.remove();
                            }
                            else if (shouldUpdateValue || shouldConvertToHex) {
                                // Handle value update or format conversion
                                let newValue = shouldUpdateValue ? newColor : decl.value;
                                if (shouldConvertToHex && !newValue.startsWith('#')) {
                                    try {
                                        const color = (0, utility_1.parseHslValue)(newValue);
                                        if (color) {
                                            newValue = color.toHex();
                                        }
                                    }
                                    catch (err) {
                                        console.error('Failed to convert to hex:', err);
                                    }
                                }
                                decl.value = newValue;
                            }
                        }
                        // Handle variable usages in other declarations
                        if (decl.value.includes(`var(--${originalName})`)) {
                            if (newVarName && newVarName !== originalName) {
                                decl.value = decl.value.replace(new RegExp(`var\\(--${originalName}\\)`, 'g'), `var(--${newVarName})`);
                            }
                        }
                        // Handle nested variables rename if existed
                        if (newVarName &&
                            newVarName !== originalName &&
                            decl.prop.includes(originalName)) {
                            const nestedVarRegex = new RegExp(`^--${originalName}-`);
                            if (nestedVarRegex.test(decl.prop)) {
                                const newProp = decl.prop.replace(originalName, newVarName);
                                rule.append({ prop: newProp, value: decl.value });
                                decl.remove();
                            }
                        }
                    });
                });
                // update Tailwind classes that use the variable
                root.walkAtRules('layer', (layerRule) => {
                    layerRule.walkRules((rule) => {
                        rule.nodes?.forEach((node) => {
                            // Check if this is an @apply at-rule
                            if (node.type === 'atrule' && 'name' in node && node.name === 'apply') {
                                const value = 'params' in node ? node.params : '';
                                const utilityPattern = new RegExp(`-${originalName}\\b`, 'g');
                                const hasMatch = utilityPattern.test(value);
                                if (hasMatch) {
                                    const newValue = value.replace(utilityPattern, (match) => {
                                        const replaced = match.replace(originalName, newVarName || originalName);
                                        return replaced;
                                    });
                                    if ('params' in node) {
                                        node.params = newValue;
                                    }
                                }
                            }
                        });
                    });
                });
            },
        },
    ]);
}
// Extract CSS variables from stylesheet
function extractTailwindCssVariables(content) {
    const configs = {
        root: {},
        dark: {},
    };
    const result = postcss_1.default.parse(content);
    result.walkRules(':root', (rule) => {
        rule.walkDecls(/^--/, (decl) => {
            const varName = decl.prop.slice(2);
            const value = decl.value;
            // Convert HSL to hex if needed
            try {
                const color = (0, utility_1.parseHslValue)(value);
                if (color) {
                    configs.root[varName] = {
                        value: color.toHex(),
                        line: decl.source?.start?.line,
                    };
                    return;
                }
            }
            catch (err) {
                console.error(`Failed to convert HSL value: ${value}`, err);
            }
            configs.root[varName] = {
                value,
                line: decl.source?.start?.line,
            };
        });
    });
    result.walkRules('.dark', (rule) => {
        rule.walkDecls(/^--/, (decl) => {
            const varName = decl.prop.slice(2);
            const value = decl.value;
            try {
                const color = (0, utility_1.parseHslValue)(value);
                if (color) {
                    configs.dark[varName] = {
                        value: color.toHex(),
                        line: decl.source?.start?.line,
                    };
                    return;
                }
            }
            catch (err) {
                console.error(`Failed to convert HSL value: ${value}`, err);
            }
            configs.dark[varName] = {
                value,
                line: decl.source?.start?.line,
            };
        });
    });
    return configs;
}
function extractColorsFromTailwindConfig(fileContent) {
    try {
        const ast = (0, parser_1.parse)(fileContent, {
            sourceType: 'module',
            plugins: ['typescript'],
        });
        let colors = {};
        (0, traverse_1.default)(ast, {
            ObjectExpression(path) {
                path.node.properties.forEach((prop) => {
                    if (prop.type === 'ObjectProperty' &&
                        prop.key.type === 'Identifier' &&
                        prop.key.name === 'theme') {
                        const theme = prop.value;
                        if (theme.type === 'ObjectExpression') {
                            theme.properties.forEach((themeProp) => {
                                if (themeProp.type === 'ObjectProperty' &&
                                    themeProp.key.type === 'Identifier' &&
                                    themeProp.key.name === 'extend') {
                                    const extend = themeProp.value;
                                    if (extend.type === 'ObjectExpression') {
                                        extend.properties.forEach((extendProp) => {
                                            if (extendProp.type === 'ObjectProperty' &&
                                                extendProp.key.type === 'Identifier' &&
                                                extendProp.key.name === 'colors') {
                                                colors = (0, helpers_2.extractObject)(extendProp.value);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            },
        });
        return colors;
    }
    catch (error) {
        console.error('Error parsing Tailwind config:', error);
        return {};
    }
}
async function updateClassReferences(projectRoot, replacements) {
    const sourceFiles = await (0, helpers_2.findSourceFiles)(projectRoot);
    await Promise.all(sourceFiles.map(async (file) => {
        const content = await (0, files_1.readFile)(file);
        if (!content) {
            return;
        }
        const ast = (0, parser_1.parse)(content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });
        const updates = new Map();
        (0, traverse_1.default)(ast, {
            JSXElement(path) {
                const classResult = (0, classes_1.getNodeClasses)(path.node);
                if (classResult.type !== 'classes') {
                    return;
                }
                const oldClasses = classResult.value;
                let hasChanges = false;
                const newClasses = oldClasses.map((currentClass) => {
                    for (const { oldClass, newClass } of replacements) {
                        const oldClassPattern = new RegExp(`(^|-)${oldClass}(-|$)`);
                        if (oldClassPattern.test(currentClass)) {
                            hasChanges = true;
                            return newClass ? currentClass.replace(oldClass, newClass) : '';
                        }
                    }
                    return currentClass;
                });
                if (hasChanges) {
                    const oid = (0, helpers_1.getOidFromJsxElement)(path.node.openingElement);
                    if (oid) {
                        updates.set(oid, {
                            oid,
                            attributes: { className: newClasses.join(' ') },
                            overrideClasses: true,
                            textContent: null,
                            structureChanges: [],
                        });
                    }
                }
            },
        });
        if (updates.size > 0) {
            (0, transform_1.transformAst)(ast, updates);
            const output = (0, generator_1.default)(ast, { retainLines: true }, content);
            const formattedContent = await (0, files_1.formatContent)(file, output.code);
            await (0, files_1.writeFile)(file, formattedContent);
        }
    }));
}
async function deleteColorGroup({ configPath, cssPath, configContent, cssContent }, groupName, projectRoot, colorName) {
    const camelCaseName = (0, lodash_1.camelCase)(groupName);
    // Update config file
    const updateAst = (0, parser_1.parse)(configContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });
    (0, traverse_1.default)(updateAst, {
        ObjectProperty(path) {
            if ((0, helpers_2.isColorsObjectProperty)(path)) {
                const colorObj = path.node.value;
                if (!(0, helpers_2.isObjectExpression)(colorObj)) {
                    return;
                }
                // Find the group
                const groupProp = colorObj.properties.find((prop) => isValidTailwindConfigProperty(prop, camelCaseName));
                if (groupProp && 'value' in groupProp) {
                    if ((0, helpers_2.isObjectExpression)(groupProp.value)) {
                        if (colorName) {
                            // Delete specific color within group
                            const colorIndex = groupProp.value.properties.findIndex((prop) => isValidTailwindConfigProperty(prop, colorName));
                            if (colorIndex !== -1) {
                                groupProp.value.properties.splice(colorIndex, 1);
                                // If group is empty after deletion, remove the entire group
                                if (groupProp.value.properties.length === 0) {
                                    const groupIndex = colorObj.properties.indexOf(groupProp);
                                    colorObj.properties.splice(groupIndex, 1);
                                }
                            }
                        }
                        else {
                            // Delete entire group
                            const index = colorObj.properties.indexOf(groupProp);
                            colorObj.properties.splice(index, 1);
                        }
                    }
                    else {
                        // Delete entire group if it's direct value
                        const index = colorObj.properties.indexOf(groupProp);
                        colorObj.properties.splice(index, 1);
                    }
                }
            }
        },
    });
    // Update CSS file
    const cssLines = cssContent.split('\n');
    const updatedCssLines = cssLines.filter((line) => {
        const trimmedLine = line.trim();
        if (colorName) {
            // Only remove the specific color variable
            const shouldKeep = !trimmedLine.endsWith(`--${camelCaseName}-${colorName}`);
            if (!shouldKeep) {
                console.log('Removing CSS variable:', trimmedLine);
            }
            return shouldKeep;
        }
        // Remove all variables that start with the group name
        const shouldKeep = !trimmedLine.startsWith(`--${camelCaseName}`);
        if (!shouldKeep) {
            console.log('Removing CSS variable:', trimmedLine);
        }
        return shouldKeep;
    });
    const updatedCssContent = updatedCssLines.join('\n');
    const formattedCssContent = await (0, files_1.formatContent)(cssPath, updatedCssContent);
    await (0, files_1.writeFile)(cssPath, formattedCssContent);
    const output = (0, generator_1.default)(updateAst, {}, configContent);
    const formattedContent = await (0, files_1.formatContent)(configPath, output.code);
    await (0, files_1.writeFile)(configPath, formattedContent);
    // Also delete the color group in the class references
    const replacements = [];
    replacements.push({
        oldClass: camelCaseName,
        newClass: '',
    });
    await updateClassReferences(projectRoot, replacements);
    return { success: true };
}
async function deleteTailwindColorGroup(projectRoot, groupName, colorName) {
    try {
        const colorUpdate = await (0, helpers_2.initializeTailwindColorContent)(projectRoot);
        if (!colorUpdate) {
            return { success: false, error: 'Failed to prepare color update' };
        }
        return deleteColorGroup(colorUpdate, groupName, projectRoot, colorName);
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
async function scanTailwindConfig(projectRoot) {
    try {
        const { configPath, cssPath } = (0, helpers_2.getConfigPath)(projectRoot);
        if (!configPath || !cssPath) {
            return null;
        }
        const configContent = await (0, files_1.readFile)(configPath);
        if (!configContent) {
            console.log('Could not read Tailwind config file');
            return null;
        }
        const cssContent = await (0, files_1.readFile)(cssPath);
        if (!cssContent) {
            console.log('Could not read CSS file');
            return {
                configPath,
                configContent: extractColorsFromTailwindConfig(configContent),
                cssPath,
                cssContent: extractTailwindCssVariables(''),
            };
        }
        return {
            configPath,
            configContent: extractColorsFromTailwindConfig(configContent),
            cssPath,
            cssContent: extractTailwindCssVariables(cssContent),
        };
    }
    catch (error) {
        console.error('Error scanning Tailwind config:', error);
        return null;
    }
}
async function updateDefaultTailwindColor({ configPath, cssPath, configContent, cssContent }, colorFamily, colorIndex, newColor, theme) {
    const updateAst = (0, parser_1.parse)(configContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });
    let isUpdated = false;
    // Update the specific shade base on tailwinds color scale
    // If the colorIndex is 0, we need + 50
    // If the colorIndex is 10, we need - 50
    const shadeKey = colorIndex * 100 + (colorIndex === 0 ? 50 : 0) + (colorIndex === 10 ? -50 : 0);
    const newColorValue = `var(--${colorFamily}-${shadeKey})`;
    // Update the default color in the config file
    (0, traverse_1.default)(updateAst, {
        ObjectProperty(path) {
            if ((0, helpers_2.isColorsObjectProperty)(path)) {
                const colorObj = path.node.value;
                if (!(0, helpers_2.isObjectExpression)(colorObj)) {
                    return;
                }
                // Find the color family object
                const familyProp = colorObj.properties.find((prop) => prop.type === 'ObjectProperty' &&
                    'key' in prop &&
                    prop.key.type === 'Identifier' &&
                    prop.key.name === colorFamily);
                // If the color family object is not found, create it
                if (!familyProp) {
                    colorObj.properties.push({
                        type: 'ObjectProperty',
                        key: { type: 'Identifier', name: colorFamily },
                        value: {
                            type: 'ObjectExpression',
                            properties: [
                                {
                                    type: 'ObjectProperty',
                                    key: { type: 'NumericLiteral', value: shadeKey },
                                    value: { type: 'StringLiteral', value: newColorValue },
                                    computed: false,
                                    shorthand: false,
                                },
                            ],
                        },
                        computed: false,
                        shorthand: false,
                    });
                }
                else if (familyProp &&
                    'value' in familyProp &&
                    (0, helpers_2.isObjectExpression)(familyProp.value)) {
                    const shadeProp = familyProp.value.properties.find((prop) => prop.type === 'ObjectProperty' &&
                        'key' in prop &&
                        prop.key.type === 'NumericLiteral' &&
                        prop.key.value === shadeKey);
                    if (shadeProp && 'value' in shadeProp) {
                        // Marked updated to actually update the value in css file
                        isUpdated = true;
                    }
                    else {
                        familyProp.value.properties.push({
                            type: 'ObjectProperty',
                            key: { type: 'NumericLiteral', value: shadeKey },
                            value: { type: 'StringLiteral', value: newColorValue },
                            computed: false,
                            shorthand: false,
                        });
                    }
                }
            }
        },
    });
    const output = (0, generator_1.default)(updateAst, {}, configContent);
    const formattedContent = await (0, files_1.formatContent)(configPath, output.code);
    await (0, files_1.writeFile)(configPath, formattedContent);
    if (!isUpdated) {
        const newCssVarName = `${colorFamily}-${shadeKey}`;
        const updatedCssContent = await addTailwindCssVariable(cssContent, newCssVarName, newColor);
        const formattedCssContent = await (0, files_1.formatContent)(cssPath, updatedCssContent);
        await (0, files_1.writeFile)(cssPath, formattedCssContent);
    }
    else {
        // Update the CSS file
        const originalName = `${colorFamily}-${shadeKey}`;
        const updatedCssContent = await updateTailwindCssVariable(cssContent, originalName, undefined, newColor, theme);
        const formattedCssContent = await (0, files_1.formatContent)(cssPath, updatedCssContent);
        await (0, files_1.writeFile)(cssPath, formattedCssContent);
    }
    return isUpdated;
}
/**
 * Check if the property is a valid tailwind config property
 * @param prop - The property to check
 * @param keyName - The key name to check against (can be a string or a number)
 * @returns True if the property is a valid tailwind config property, false otherwise
 */
function isValidTailwindConfigProperty(prop, keyName) {
    return (prop.type === 'ObjectProperty' &&
        'key' in prop &&
        (prop.key.type === 'Identifier' || prop.key.type === 'NumericLiteral') &&
        (prop.key.type === 'Identifier'
            ? prop.key.name === keyName
            : String(prop.key.value) === keyName));
}
//# sourceMappingURL=styles.js.map