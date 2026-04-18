#!/usr/bin/env node
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
exports.addNextBuildConfig = exports.removeNextCache = exports.modifyNextConfig = exports.isNextJsProject = void 0;
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const constants_1 = require("@onlook/models/constants");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("../utils");
const constants_2 = require("../constants");
const isNextJsProject = async () => {
    try {
        const configPath = constants_2.CONFIG_FILE_PATTERN[constants_2.BUILD_TOOL_NAME.NEXT];
        // Check if the configuration file exists
        if (await (0, utils_1.exists)(configPath)) {
            return true;
        }
        // Check if the dependency exists
        if (!(await (0, utils_1.hasDependency)(constants_2.DEPENDENCY_NAME.NEXT))) {
            return false;
        }
        // Check if one of the directories exists
        const directoryExists = await Promise.all(constants_2.NEXTJS_COMMON_FILES.map(utils_1.exists));
        return directoryExists.some(Boolean);
    }
    catch (err) {
        console.error(err);
        return false;
    }
};
exports.isNextJsProject = isNextJsProject;
const modifyNextConfig = (configFileExtension) => {
    if (!(0, utils_1.isSupportFileExtension)(configFileExtension)) {
        console.error('Unsupported file extension');
        return;
    }
    const configFileName = `${constants_2.CONFIG_BASE_NAME.NEXTJS}${configFileExtension}`;
    // Define the path to next.config.* file
    const configPath = path.resolve(process.cwd(), configFileName);
    if (!fs.existsSync(configPath)) {
        console.error(`${configFileName} not found`);
        return;
    }
    console.log(`Adding ${constants_2.ONLOOK_PLUGIN.NEXTJS} plugin into ${configFileName} file...`);
    // Read the existing next.config.* file
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${configPath}:`, err);
            return;
        }
        const astParserOption = (0, utils_1.genASTParserOptionsByFileExtension)(configFileExtension);
        // Parse the file content to an AST
        const ast = (0, parser_1.parse)(data, astParserOption);
        let hasPathImport = false;
        // Traverse the AST to find the experimental.swcPlugins array
        (0, traverse_1.default)(ast, {
            VariableDeclarator(path) {
                // check if path is imported in .js file
                if ((0, utils_1.checkVariableDeclarationExist)(path, 'path')) {
                    hasPathImport = true;
                }
            },
            ImportDeclaration(path) {
                // check if path is imported in .mjs file
                if (path.node.source.value === 'path') {
                    hasPathImport = true;
                }
            },
            ObjectExpression(path) {
                const properties = path.node.properties;
                let experimentalProperty;
                // Find the experimental property
                properties.forEach((prop) => {
                    if (t.isObjectProperty(prop) &&
                        t.isIdentifier(prop.key, { name: 'experimental' })) {
                        experimentalProperty = prop;
                    }
                });
                if (!experimentalProperty) {
                    // If experimental property is not found, create it
                    experimentalProperty = t.objectProperty(t.identifier('experimental'), t.objectExpression([]));
                    properties.push(experimentalProperty);
                }
                // Ensure experimental is an ObjectExpression
                if (!t.isObjectExpression(experimentalProperty.value)) {
                    experimentalProperty.value = t.objectExpression([]);
                }
                const experimentalProperties = experimentalProperty.value.properties;
                let swcPluginsProperty;
                // Find the swcPlugins property
                experimentalProperties.forEach((prop) => {
                    if (t.isObjectProperty(prop) &&
                        t.isIdentifier(prop.key, { name: 'swcPlugins' })) {
                        swcPluginsProperty = prop;
                    }
                });
                if (!swcPluginsProperty) {
                    // If swcPlugins property is not found, create it
                    swcPluginsProperty = t.objectProperty(t.identifier('swcPlugins'), t.arrayExpression([]));
                    experimentalProperties.push(swcPluginsProperty);
                }
                // Ensure swcPlugins is an ArrayExpression
                if (!t.isArrayExpression(swcPluginsProperty.value)) {
                    swcPluginsProperty.value = t.arrayExpression([]);
                }
                // Add the new plugin configuration to swcPlugins array
                const pluginConfig = t.arrayExpression([
                    t.stringLiteral(constants_2.ONLOOK_PLUGIN.NEXTJS),
                    t.objectExpression([
                        t.objectProperty(t.identifier('root'), t.callExpression(t.memberExpression(t.identifier('path'), t.identifier('resolve')), [t.stringLiteral('.')])),
                    ]),
                ]);
                swcPluginsProperty.value.elements.push(pluginConfig);
                // Stop traversing after the modification
                path.stop();
            },
        });
        // If 'path' is not imported, add the import statement
        if (!hasPathImport) {
            const importDeclaration = (0, utils_1.genImportDeclaration)(configFileExtension, 'path');
            importDeclaration && ast.program.body.unshift(importDeclaration);
        }
        // Generate the modified code from the AST
        const updatedCode = (0, generator_1.default)(ast, {}, data).code;
        // Write the updated content back to next.config.* file
        fs.writeFile(configPath, updatedCode, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing ${configPath}:`, err);
                return;
            }
            console.log(`Successfully updated ${configPath}`);
        });
    });
};
exports.modifyNextConfig = modifyNextConfig;
const removeNextCache = () => {
    const nextCachePath = '.next';
    if (fs.existsSync(nextCachePath)) {
        console.log('Removing Nextjs cache...');
        fs.rmSync(nextCachePath, { recursive: true });
        console.log('Next.js cache removed successfully');
    }
    else {
        console.log('No Next.js cache found, skipping cleanup...');
    }
};
exports.removeNextCache = removeNextCache;
const addConfigProperty = (ast, propertyName, propertyValue) => {
    let propertyExists = false;
    (0, traverse_1.default)(ast, {
        ObjectExpression(path) {
            const properties = path.node.properties;
            let hasProperty = false;
            // Check if property already exists
            properties.forEach((prop) => {
                if (t.isObjectProperty(prop) && t.isIdentifier(prop.key, { name: propertyName })) {
                    hasProperty = true;
                    propertyExists = true;
                    // If the property value is an object expression, merge properties
                    if (t.isObjectExpression(prop.value) && t.isObjectExpression(propertyValue)) {
                        const existingProps = new Map(prop.value.properties
                            .filter((p) => t.isObjectProperty(p) && t.isIdentifier(p.key))
                            .map((p) => [p.key.name, p]));
                        // Add or update properties from propertyValue
                        propertyValue.properties.forEach((newProp) => {
                            if (t.isObjectProperty(newProp) && t.isIdentifier(newProp.key)) {
                                existingProps.set(newProp.key.name, newProp);
                            }
                        });
                        // Update the property value with merged properties
                        prop.value.properties = Array.from(existingProps.values());
                    }
                    else {
                        // For non-object properties, just replace the value
                        prop.value = propertyValue;
                    }
                }
            });
            if (!hasProperty) {
                // Add the new property if it doesn't exist
                properties.push(t.objectProperty(t.identifier(propertyName), propertyValue));
                propertyExists = true;
            }
            // Stop traversing after the modification
            path.stop();
        },
    });
    return propertyExists;
};
const addTypescriptConfig = (ast) => {
    return addConfigProperty(ast, 'typescript', t.objectExpression([
        t.objectProperty(t.identifier('ignoreBuildErrors'), t.booleanLiteral(true)),
    ]));
};
const addDistDirConfig = (ast) => {
    return addConfigProperty(ast, 'distDir', t.conditionalExpression(t.binaryExpression('===', t.memberExpression(t.memberExpression(t.identifier('process'), t.identifier('env')), t.identifier('NODE_ENV')), t.stringLiteral('production')), t.stringLiteral(constants_1.CUSTOM_OUTPUT_DIR), t.stringLiteral('.next')));
};
const addNextBuildConfig = (projectDir) => {
    return new Promise((resolve) => {
        // Find any config file
        const possibleExtensions = ['.js', '.ts', '.mjs', '.cjs'];
        let configPath = null;
        let configFileExtension = null;
        // Try each possible extension
        for (const ext of possibleExtensions) {
            const fileName = `${constants_2.CONFIG_BASE_NAME.NEXTJS}${ext}`;
            const testPath = path.resolve(projectDir, fileName);
            if (fs.existsSync(testPath)) {
                configPath = testPath;
                configFileExtension = ext;
                break;
            }
        }
        if (!configPath || !configFileExtension) {
            console.error('No Next.js config file found');
            resolve(false);
            return;
        }
        console.log(`Adding standalone output configuration to ${path.basename(configPath)}...`);
        fs.readFile(configPath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading ${configPath}:`, err);
                resolve(false);
                return;
            }
            const astParserOption = (0, utils_1.genASTParserOptionsByFileExtension)(configFileExtension);
            const ast = (0, parser_1.parse)(data, astParserOption);
            // Add both configurations
            const outputExists = addConfigProperty(ast, 'output', t.stringLiteral('standalone'));
            const distDirExists = addDistDirConfig(ast);
            const typescriptExists = addTypescriptConfig(ast);
            // Generate the modified code from the AST
            const updatedCode = (0, generator_1.default)(ast, {}, data).code;
            fs.writeFile(configPath, updatedCode, 'utf8', (err) => {
                if (err) {
                    console.error(`Error writing ${configPath}:`, err);
                    resolve(false);
                    return;
                }
                console.log(`Successfully updated ${configPath} with standalone output, typescript configuration, and distDir`);
                resolve(outputExists && typescriptExists && distDirExists);
            });
        });
    });
};
exports.addNextBuildConfig = addNextBuildConfig;
//# sourceMappingURL=next.js.map