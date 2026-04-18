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
exports.modifyBabelrc = exports.isWebpackProject = void 0;
exports.modifyWebpackConfig = modifyWebpackConfig;
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const isWebpackProject = async () => {
    try {
        const configPath = constants_1.CONFIG_FILE_PATTERN[constants_1.BUILD_TOOL_NAME.WEBPACK];
        // Check if the configuration file exists
        if (!(await (0, utils_1.exists)(configPath))) {
            return false;
        }
        // Check if the dependency exists
        if (!(await (0, utils_1.hasDependency)(constants_1.DEPENDENCY_NAME.WEBPACK))) {
            return false;
        }
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
};
exports.isWebpackProject = isWebpackProject;
/**
 * Babel rule to be added to the webpack.config.* file
 */
const babelRule = t.objectExpression([
    t.objectProperty(t.identifier('test'), t.regExpLiteral('\\.(js|mjs|cjs|ts|tsx|jsx)$')),
    t.objectProperty(t.identifier('exclude'), t.regExpLiteral('\\/node_modules\\/')),
    t.objectProperty(t.identifier('use'), t.objectExpression([
        t.objectProperty(t.identifier('loader'), t.stringLiteral('babel-loader')),
        t.objectProperty(t.identifier('options'), t.objectExpression([
            t.objectProperty(t.identifier('presets'), t.arrayExpression([
                t.stringLiteral('@babel/preset-env'),
                t.stringLiteral('@babel/preset-react'),
            ])),
        ])),
    ])),
]);
function modifyWebpackConfig(configFileExtension) {
    if (!(0, utils_1.isSupportFileExtension)(configFileExtension)) {
        console.error('Unsupported file extension');
        return;
    }
    const configFileName = `${constants_1.CONFIG_BASE_NAME.WEBPACK}${configFileExtension}`;
    // Define the path to webpack.config.* file
    const configPath = path.resolve(process.cwd(), configFileName);
    if (!fs.existsSync(configPath)) {
        console.error(`${configFileName} not found`);
        return;
    }
    fs.readFile(configPath, 'utf8', (err, fileContent) => {
        if (err) {
            console.error(`Error reading ${configPath}:`, err);
            return;
        }
        const ast = (0, parser_1.parse)(fileContent, { sourceType: 'module' });
        let rulesArray;
        // Traverse the AST to find the module.rules array
        (0, traverse_1.default)(ast, {
            ObjectProperty(path) {
                // @ts-ignore
                if (path.node.key.name === 'module' && t.isObjectExpression(path.node.value)) {
                    const moduleProperties = path.node.value.properties;
                    moduleProperties.forEach((property) => {
                        if (t.isObjectProperty(property) &&
                            t.isIdentifier(property.key) &&
                            property.key.name === 'rules' &&
                            t.isArrayExpression(property.value)) {
                            rulesArray = property.value.elements;
                        }
                    });
                    // If module.rules does not exist, create it
                    if (!rulesArray) {
                        const rulesProperty = t.objectProperty(t.identifier('rules'), t.arrayExpression([]));
                        path.node.value.properties.push(rulesProperty);
                        rulesArray = rulesProperty.value
                            .elements;
                    }
                }
            },
        });
        // Add the babel rule to the rules array
        if (rulesArray) {
            rulesArray.push(babelRule);
        }
        // Generate the updated code
        const updatedCode = (0, generator_1.default)(ast, {}, fileContent).code;
        // Write the updated content back to next.config.* file
        fs.writeFile(configPath, updatedCode, 'utf8', (err) => {
            if (err) {
                console.error(`Error writing ${configPath}:`, err);
                return;
            }
            console.log(`Successfully updated ${configPath}`);
        });
    });
}
// Path to the .babelrc file
const babelrcPath = path.resolve(constants_1.BABELRC_FILE);
// Default .babelrc content if it doesn't exist
const defaultBabelrcContent = {
    plugins: [],
};
/**
 * Modify the .babelrc file to include the "@onlook/react" plugin
 */
const modifyBabelrc = () => {
    let babelrcContent;
    // Check if .babelrc file exists
    if (fs.existsSync(babelrcPath)) {
        // Read the .babelrc file
        const fileContent = fs.readFileSync(babelrcPath, 'utf8');
        babelrcContent = JSON.parse(fileContent);
    }
    else {
        // Use default .babelrc content if file does not exist
        babelrcContent = defaultBabelrcContent;
    }
    // Ensure plugins array exists
    if (!Array.isArray(babelrcContent.plugins)) {
        babelrcContent.plugins = [];
    }
    // Check if "@onlook/react" is already in the plugins array
    if (!babelrcContent.plugins.includes(constants_1.ONLOOK_PLUGIN.WEBPACK)) {
        // Add "@onlook/react" to the plugins array
        babelrcContent.plugins.push(constants_1.ONLOOK_PLUGIN.WEBPACK);
    }
    // Write the updated content back to the .babelrc file
    fs.writeFileSync(babelrcPath, JSON.stringify(babelrcContent, null, 2), 'utf8');
    console.log('.babelrc has been updated with the "@onlook/react" plugin.');
};
exports.modifyBabelrc = modifyBabelrc;
//# sourceMappingURL=webpack.js.map