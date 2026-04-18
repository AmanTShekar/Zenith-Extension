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
exports.modifyViteConfig = exports.isViteJsProject = void 0;
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
// Function to check if a plugin is already in the array
function hasPlugin(pluginsArray, pluginName) {
    return pluginsArray.some((plugin) => (t.isStringLiteral(plugin) && plugin.value === pluginName) ||
        (t.isIdentifier(plugin) && plugin.name === pluginName) ||
        (t.isCallExpression(plugin) &&
            t.isIdentifier(plugin.callee) &&
            plugin.callee.name === pluginName));
}
const isViteJsProject = async () => {
    try {
        const configPath = constants_1.CONFIG_FILE_PATTERN[constants_1.BUILD_TOOL_NAME.VITE];
        // Check if the configuration file exists
        if (await (0, utils_1.exists)(configPath)) {
            return true;
        }
        // Check if the dependency exists
        if (!(await (0, utils_1.hasDependency)(constants_1.DEPENDENCY_NAME.VITE))) {
            return false;
        }
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
};
exports.isViteJsProject = isViteJsProject;
const modifyViteConfig = (configFileExtension) => {
    if (!(0, utils_1.isViteProjectSupportFileExtension)(configFileExtension)) {
        console.error('Unsupported file extension');
        return;
    }
    const configFileName = `${constants_1.CONFIG_BASE_NAME.VITEJS}${configFileExtension}`;
    const configPath = path.resolve(process.cwd(), configFileName);
    if (!fs.existsSync(configPath)) {
        console.error(`${configFileName} not found`);
        return;
    }
    const viteConfigCode = fs.readFileSync(configPath, 'utf-8');
    const ast = (0, parser_1.parse)(viteConfigCode, (0, utils_1.genASTParserOptionsByFileExtension)(configFileExtension, 'module'));
    let reactPluginAdded = false;
    let onlookBabelPluginAdded = false;
    let reactImportAdded = false;
    // Add import for react plugin if it doesn't exist
    (0, traverse_1.default)(ast, {
        Program(path) {
            const reactImport = path.node.body.find((node) => t.isImportDeclaration(node) && node.source.value === '@vitejs/plugin-react');
            if (!reactImport) {
                path.node.body.unshift(t.importDeclaration([t.importDefaultSpecifier(t.identifier('react'))], t.stringLiteral('@vitejs/plugin-react')));
                reactImportAdded = true;
            }
        },
    });
    (0, traverse_1.default)(ast, {
        CallExpression(path) {
            if (t.isIdentifier(path.node.callee, { name: 'defineConfig' })) {
                const configArg = path.node.arguments[0];
                if (t.isObjectExpression(configArg)) {
                    let pluginsProperty = configArg.properties.find((prop) => t.isObjectProperty(prop) &&
                        t.isIdentifier(prop.key, { name: 'plugins' }));
                    if (!pluginsProperty) {
                        pluginsProperty = t.objectProperty(t.identifier('plugins'), t.arrayExpression([]));
                        configArg.properties.push(pluginsProperty);
                    }
                    const pluginsArray = pluginsProperty.value.elements;
                    // Find the react plugin
                    const reactPluginIndex = pluginsArray.findIndex((plugin) => (t.isIdentifier(plugin) && plugin.name === 'react') ||
                        (t.isCallExpression(plugin) &&
                            t.isIdentifier(plugin.callee) &&
                            plugin.callee.name === 'react'));
                    if (reactPluginIndex === -1) {
                        // If react plugin doesn't exist, add it with the Onlook Babel plugin
                        const reactPlugin = t.callExpression(t.identifier('react'), [
                            t.objectExpression([
                                t.objectProperty(t.identifier('babel'), t.objectExpression([
                                    t.objectProperty(t.identifier('plugins'), t.arrayExpression([
                                        t.stringLiteral(constants_1.ONLOOK_PLUGIN.BABEL),
                                    ])),
                                ])),
                            ]),
                        ]);
                        pluginsArray.push(reactPlugin);
                        reactPluginAdded = true;
                        onlookBabelPluginAdded = true;
                    }
                    else {
                        // If react plugin exists, ensure it has the Onlook Babel plugin
                        const reactPlugin = pluginsArray[reactPluginIndex];
                        if (t.isCallExpression(reactPlugin) && reactPlugin.arguments.length === 0) {
                            // React plugin exists but has no arguments, add the configuration
                            reactPlugin.arguments.push(t.objectExpression([
                                t.objectProperty(t.identifier('babel'), t.objectExpression([
                                    t.objectProperty(t.identifier('plugins'), t.arrayExpression([
                                        t.stringLiteral(constants_1.ONLOOK_PLUGIN.BABEL),
                                    ])),
                                ])),
                            ]));
                            reactPluginAdded = true;
                            onlookBabelPluginAdded = true;
                        }
                        else if (t.isCallExpression(reactPlugin) &&
                            reactPlugin.arguments.length > 0) {
                            // React plugin exists and has arguments, ensure it has the Onlook Babel plugin
                            const reactConfig = reactPlugin.arguments[0];
                            if (t.isObjectExpression(reactConfig)) {
                                let babelProp = reactConfig.properties.find((prop) => t.isObjectProperty(prop) &&
                                    t.isIdentifier(prop.key, { name: 'babel' }));
                                if (!babelProp) {
                                    babelProp = t.objectProperty(t.identifier('babel'), t.objectExpression([
                                        t.objectProperty(t.identifier('plugins'), t.arrayExpression([
                                            t.stringLiteral(constants_1.ONLOOK_PLUGIN.BABEL),
                                        ])),
                                    ]));
                                    reactConfig.properties.push(babelProp);
                                    reactPluginAdded = true;
                                    onlookBabelPluginAdded = true;
                                }
                                else if (t.isObjectExpression(babelProp.value)) {
                                    let pluginsProp = babelProp.value.properties.find((prop) => t.isObjectProperty(prop) &&
                                        t.isIdentifier(prop.key, { name: 'plugins' }));
                                    if (!pluginsProp) {
                                        pluginsProp = t.objectProperty(t.identifier('plugins'), t.arrayExpression([
                                            t.stringLiteral(constants_1.ONLOOK_PLUGIN.BABEL),
                                        ]));
                                        babelProp.value.properties.push(pluginsProp);
                                        reactPluginAdded = true;
                                        onlookBabelPluginAdded = true;
                                    }
                                    else if (t.isArrayExpression(pluginsProp.value)) {
                                        if (!hasPlugin(pluginsProp.value.elements, constants_1.ONLOOK_PLUGIN.BABEL)) {
                                            pluginsProp.value.elements.push(t.stringLiteral(constants_1.ONLOOK_PLUGIN.BABEL));
                                            reactPluginAdded = true;
                                            onlookBabelPluginAdded = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
    });
    const { code: modifiedCode } = (0, generator_1.default)(ast, {}, viteConfigCode);
    fs.writeFileSync(configPath, modifiedCode, 'utf-8');
    if (reactPluginAdded) {
        console.log(`React plugin added to ${configFileName}`);
    }
    if (onlookBabelPluginAdded) {
        console.log(`${constants_1.ONLOOK_PLUGIN.BABEL} plugin added to ${configFileName}`);
    }
    if (reactImportAdded) {
        console.log(`React import added to ${configFileName}`);
    }
    if (!reactPluginAdded && !onlookBabelPluginAdded && !reactImportAdded) {
        console.log(`No changes were necessary in ${configFileName}`);
    }
};
exports.modifyViteConfig = modifyViteConfig;
//# sourceMappingURL=vite.js.map