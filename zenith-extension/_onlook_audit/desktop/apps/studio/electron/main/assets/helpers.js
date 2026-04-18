"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigPath = getConfigPath;
exports.extractObject = extractObject;
exports.isColorsObjectProperty = isColorsObjectProperty;
exports.isObjectExpression = isObjectExpression;
exports.initializeTailwindColorContent = initializeTailwindColorContent;
exports.addTailwindRootColor = addTailwindRootColor;
exports.findSourceFiles = findSourceFiles;
exports.modifyTailwindConfig = modifyTailwindConfig;
const constants_1 = require("@onlook/models/constants");
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const files_1 = require("../code/files");
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const generator_1 = __importDefault(require("@babel/generator"));
function getConfigPath(projectRoot) {
    const possiblePaths = [
        path_1.default.join(projectRoot, 'tailwind.config.js'),
        path_1.default.join(projectRoot, 'tailwind.config.ts'),
        path_1.default.join(projectRoot, 'tailwind.config.cjs'),
        path_1.default.join(projectRoot, 'tailwind.config.mjs'),
    ];
    let configPath = null;
    for (const filePath of possiblePaths) {
        if (fs_1.default.existsSync(filePath)) {
            configPath = filePath;
            break;
        }
    }
    if (!configPath) {
        console.log('No Tailwind config file found');
        return { configPath: null, cssPath: null };
    }
    const possibleCssPaths = [
        path_1.default.join(projectRoot, 'app/globals.css'),
        path_1.default.join(projectRoot, 'src/app/globals.css'),
        path_1.default.join(projectRoot, 'styles/globals.css'),
        path_1.default.join(projectRoot, 'src/styles/globals.css'),
    ];
    let cssPath = null;
    for (const filePath of possibleCssPaths) {
        if (fs_1.default.existsSync(filePath)) {
            cssPath = filePath;
            break;
        }
    }
    if (!cssPath) {
        console.log('No globals.css file found');
        return { configPath, cssPath: null };
    }
    return { configPath, cssPath };
}
function extractObject(node) {
    if (node.type !== 'ObjectExpression') {
        return {};
    }
    const result = {};
    node.properties.forEach((prop) => {
        if (prop.type === 'ObjectProperty') {
            let key;
            if (prop.key.type === 'Identifier') {
                key = prop.key.name;
            }
            else if (prop.key.type === 'NumericLiteral') {
                key = prop.key.value.toString();
            }
            else if (prop.key.type === 'StringLiteral') {
                key = prop.key.value;
            }
            else {
                return;
            }
            if (prop.value.type === 'StringLiteral') {
                result[key] = {
                    value: prop.value.value,
                    line: prop.loc?.start?.line,
                };
            }
            else if (prop.value.type === 'ObjectExpression') {
                result[key] = extractObject(prop.value);
            }
        }
    });
    return result;
}
function isColorsObjectProperty(path) {
    return (path.parent.type === 'ObjectExpression' &&
        path.node.key.type === 'Identifier' &&
        path.node.key.name === 'colors' &&
        path.node.value.type === 'ObjectExpression');
}
function isObjectExpression(node) {
    return node.type === 'ObjectExpression';
}
async function initializeTailwindColorContent(projectRoot) {
    const { configPath, cssPath } = getConfigPath(projectRoot);
    if (!configPath || !cssPath) {
        return null;
    }
    const configContent = await (0, files_1.readFile)(configPath);
    const cssContent = await (0, files_1.readFile)(cssPath);
    if (!configContent || !cssContent) {
        return null;
    }
    return { configPath, cssPath, configContent, cssContent };
}
function addTailwindRootColor(colorObj, newName, newCssVarName) {
    colorObj.properties.push({
        type: 'ObjectProperty',
        key: {
            type: 'Identifier',
            name: newName,
        },
        value: {
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
                        value: `var(--${newCssVarName})`,
                    },
                    computed: false,
                    shorthand: false,
                },
            ],
        },
        computed: false,
        shorthand: false,
    });
}
async function findSourceFiles(projectRoot) {
    const pattern = path_1.default.join(projectRoot, '**/*.{ts,tsx,js,jsx}');
    return fast_glob_1.default
        .sync(pattern)
        .filter((file) => !file.includes('node_modules') &&
        !file.includes('dist') &&
        !file.includes('.next') &&
        !file.includes('build'));
}
/**
 * Generic utility to modify Tailwind config files
 * @param configContent - The content of the tailwind config file
 * @param modifier - A visitor function that will modify the AST
 * @returns The modification result with updated code and whether an update was made
 */
function modifyTailwindConfig(configContent, modifier) {
    const updateAst = (0, parser_1.parse)(configContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });
    let isUpdated = false;
    (0, traverse_1.default)(updateAst, {
        ObjectProperty(path) {
            // Call the visitor function, which might return true if it updated anything
            const wasUpdated = modifier.visitor(path);
            // If the visitor returns true, it made an update
            if (wasUpdated) {
                isUpdated = true;
            }
        },
    });
    const output = (0, generator_1.default)(updateAst, { retainLines: true, compact: false }, configContent).code;
    return { isUpdated, output };
}
//# sourceMappingURL=helpers.js.map