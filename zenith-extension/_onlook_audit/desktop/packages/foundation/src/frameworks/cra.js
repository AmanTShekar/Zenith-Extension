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
exports.modifyStartScript = exports.isCRAProject = exports.ensureConfigOverrides = exports.modifyCRAConfig = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const configOverridesPath = path.resolve(constants_1.CONFIG_OVERRIDES_FILE);
const packageJsonPath = path.resolve(constants_1.PACKAGE_JSON);
const requiredImportSource = 'customize-cra';
// Define the content to be added if the file does not exist
const defaultContent = `
    const { override, addBabelPlugins } = require('${requiredImportSource}');

    module.exports = override(
        ...addBabelPlugins(
            '${constants_1.ONLOOK_PLUGIN.WEBPACK}'
        )
    );
`;
const modifyCRAConfig = () => {
    (0, exports.ensureConfigOverrides)();
    (0, exports.modifyStartScript)();
};
exports.modifyCRAConfig = modifyCRAConfig;
const ensureConfigOverrides = () => {
    // Handle the case when the file does not exist
    if (!fs.existsSync(configOverridesPath)) {
        fs.writeFileSync(configOverridesPath, defaultContent, 'utf8');
        console.log(`${constants_1.CONFIG_OVERRIDES_FILE} has been created with the necessary config.`);
        return;
    }
    // Handle the case when the file exists
    fs.readFile(configOverridesPath, 'utf8', (err, fileContent) => {
        if (err) {
            console.error(`Error reading ${configOverridesPath}:`, err);
            return;
        }
        // Read the existing file
        const ast = (0, parser_1.parse)(fileContent, (0, utils_1.genASTParserOptionsByFileExtension)(constants_1.FILE_EXTENSION.JS));
        let hasCustomizeCraImport = false;
        let hasOnlookReactPlugin = false;
        (0, traverse_1.default)(ast, {
            ImportDeclaration(path) {
                if (path.node.source.value === requiredImportSource) {
                    hasCustomizeCraImport = true;
                }
            },
            VariableDeclarator(path) {
                if (t.isCallExpression(path.node.init) &&
                    t.isIdentifier(path.node.init.callee, { name: 'require' }) &&
                    path.node.init.arguments.length === 1 &&
                    t.isStringLiteral(path.node.init.arguments[0], { value: requiredImportSource })) {
                    hasCustomizeCraImport = true;
                }
            },
            CallExpression(path) {
                if (t.isIdentifier(path.node.callee, { name: 'override' })) {
                    path.node.arguments.forEach((arg) => {
                        if (t.isSpreadElement(arg) &&
                            t.isCallExpression(arg.argument) &&
                            t.isIdentifier(arg.argument.callee, { name: 'addBabelPlugins' }) &&
                            arg.argument.arguments.some((pluginArg) => t.isStringLiteral(pluginArg, { value: constants_1.ONLOOK_PLUGIN.WEBPACK }))) {
                            hasOnlookReactPlugin = true;
                        }
                    });
                }
            },
        });
        if (!hasCustomizeCraImport) {
            const requireDeclaration = t.variableDeclaration('const', [
                t.variableDeclarator(t.objectPattern([
                    t.objectProperty(t.identifier('override'), t.identifier('override')),
                    t.objectProperty(t.identifier('addBabelPlugins'), t.identifier('addBabelPlugins')),
                ]), t.callExpression(t.identifier('require'), [
                    t.stringLiteral(requiredImportSource),
                ])),
            ]);
            ast.program.body.unshift(requireDeclaration);
        }
        if (!hasOnlookReactPlugin) {
            (0, traverse_1.default)(ast, {
                AssignmentExpression(path) {
                    if (t.isMemberExpression(path.node.left) &&
                        t.isIdentifier(path.node.left.object, { name: 'module' }) &&
                        t.isIdentifier(path.node.left.property, { name: 'exports' })) {
                        // @ts-ignore
                        path.node.right.arguments.push(t.spreadElement(t.callExpression(t.identifier('addBabelPlugins'), [
                            t.stringLiteral(constants_1.ONLOOK_PLUGIN.WEBPACK),
                        ])));
                    }
                },
            });
        }
        const updatedCode = (0, generator_1.default)(ast, {}, fileContent).code;
        // Write the updated content back to next.config.* file
        fs.writeFile(configOverridesPath, updatedCode, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing ${configOverridesPath}:`, err);
                return;
            }
            console.log(`Successfully updated ${configOverridesPath}`);
        });
    });
};
exports.ensureConfigOverrides = ensureConfigOverrides;
const isCRAProject = async () => {
    try {
        // Check if the dependency exists
        if (!(await (0, utils_1.hasDependency)(constants_1.DEPENDENCY_NAME.CRA))) {
            return false;
        }
        // Check if one of the directories exists
        const directoryExists = await Promise.all(constants_1.CRA_COMMON_FILES.map(utils_1.exists));
        return directoryExists.some(Boolean);
    }
    catch (err) {
        console.error(err);
        return false;
    }
};
exports.isCRAProject = isCRAProject;
const modifyStartScript = () => {
    fs.readFile(packageJsonPath, 'utf8', (err, fileContent) => {
        if (err) {
            console.error('Error reading package.json:', err);
            return;
        }
        const packageJSON = JSON.parse(fileContent);
        if (!packageJSON.scripts) {
            packageJSON.scripts = {};
        }
        const scriptsToUpdate = ['start', 'test', 'build'];
        scriptsToUpdate.forEach((script) => {
            if (!packageJSON.scripts[script]) {
                packageJSON.scripts[script] = `react-app-rewired ${script}`;
            }
            else {
                packageJSON.scripts[script] = packageJSON.scripts[script].replace(/react-scripts/, 'react-app-rewired');
            }
        });
        fs.writeFile('package.json', JSON.stringify(packageJSON, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing package.json:', err);
                return;
            }
            console.log('Successfully updated the start script in package.json');
        });
    });
};
exports.modifyStartScript = modifyStartScript;
//# sourceMappingURL=cra.js.map