"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNextBuildConfig = void 0;
const constants_1 = require("@onlook/constants");
const helpers_1 = require("../helpers");
const packages_1 = require("../packages");
var CONFIG_BASE_NAME;
(function (CONFIG_BASE_NAME) {
    CONFIG_BASE_NAME["NEXTJS"] = "next.config";
    CONFIG_BASE_NAME["WEBPACK"] = "webpack.config";
    CONFIG_BASE_NAME["VITEJS"] = "vite.config";
})(CONFIG_BASE_NAME || (CONFIG_BASE_NAME = {}));
const addConfigProperty = (ast, propertyName, propertyValue) => {
    let propertyExists = false;
    (0, packages_1.traverse)(ast, {
        ObjectExpression(path) {
            // Check if this ObjectExpression is part of an export or variable declaration
            // related to 'nextConfig'. This is a heuristic to find the main config object.
            let isConfigObject = false;
            // Skip objects that are property values (like options: {})
            if (packages_1.t.isObjectProperty(path.parent) && path.parent.value === path.node) {
                return;
            }
            //
            // case: `module.exports = { ... }`
            //
            if (packages_1.t.isAssignmentExpression(path.parent) &&
                packages_1.t.isMemberExpression(path.parent.left) &&
                packages_1.t.isIdentifier(path.parent.left.object, { name: 'module' }) &&
                packages_1.t.isIdentifier(path.parent.left.property, { name: 'exports' })) {
                isConfigObject = true;
            }
            //
            // case: `export default { ... }`
            //
            if (packages_1.t.isExportDefaultDeclaration(path.parent)) {
                isConfigObject = true;
            }
            //
            // case: `const nextConfig = { ... }` or `const somethingElse = { ... }`
            //
            if (packages_1.t.isVariableDeclarator(path.parent) && packages_1.t.isIdentifier(path.parent.id)) {
                // More specific check - look for common Next.js config variable names
                const varName = path.parent.id.name.toLowerCase();
                if (varName.includes('config') ||
                    varName === 'somethingelse' ||
                    varName.includes('next')) {
                    isConfigObject = true;
                }
            }
            //
            // case: `module.exports = () => { return { ... } }`
            //
            if (packages_1.t.isReturnStatement(path.parent)) {
                // This is a bit of a weak check, but should work for most cases.
                isConfigObject = true;
            }
            //
            // case: `module.exports = withSomePlugin({ ... })`
            //
            if (packages_1.t.isCallExpression(path.parent) && packages_1.t.isIdentifier(path.parent.callee)) {
                // Only treat as config object if this is the first argument to the call
                // and this call is being assigned/exported (not a nested plugin setup)
                if (path.parent.arguments[0] === path.node) {
                    // Check if this call is being exported or assigned to module.exports
                    if (packages_1.t.isAssignmentExpression(path.parentPath?.parent) ||
                        packages_1.t.isExportDefaultDeclaration(path.parentPath?.parent)) {
                        isConfigObject = true;
                    }
                }
            }
            if (!isConfigObject) {
                return; // Not the config object, skip.
            }
            const properties = path.node.properties;
            let hasProperty = false;
            // Check if property already exists
            properties.forEach((prop) => {
                if (packages_1.t.isObjectProperty(prop) && packages_1.t.isIdentifier(prop.key, { name: propertyName })) {
                    hasProperty = true;
                    propertyExists = true;
                    // If the property value is an object expression, merge properties
                    if (packages_1.t.isObjectExpression(prop.value) && packages_1.t.isObjectExpression(propertyValue)) {
                        const existingProps = new Map(prop.value.properties
                            .filter((p) => packages_1.t.isObjectProperty(p) && packages_1.t.isIdentifier(p.key))
                            .map((p) => [p.key.name, p]));
                        // Add or update properties from propertyValue
                        propertyValue.properties.forEach((newProp) => {
                            if (packages_1.t.isObjectProperty(newProp) && packages_1.t.isIdentifier(newProp.key)) {
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
                properties.push(packages_1.t.objectProperty(packages_1.t.identifier(propertyName), propertyValue));
                propertyExists = true;
            }
            // Stop traversing after the modification
            path.stop();
        },
    });
    return propertyExists;
};
const addTypescriptConfig = (ast) => {
    return addConfigProperty(ast, 'typescript', packages_1.t.objectExpression([
        packages_1.t.objectProperty(packages_1.t.identifier('ignoreBuildErrors'), packages_1.t.booleanLiteral(true)),
    ]));
};
const addEslintConfig = (ast) => {
    return addConfigProperty(ast, 'eslint', packages_1.t.objectExpression([
        packages_1.t.objectProperty(packages_1.t.identifier('ignoreDuringBuilds'), packages_1.t.booleanLiteral(true)),
    ]));
};
const addDistDirConfig = (ast) => {
    return addConfigProperty(ast, 'distDir', packages_1.t.conditionalExpression(packages_1.t.binaryExpression('===', packages_1.t.memberExpression(packages_1.t.memberExpression(packages_1.t.identifier('process'), packages_1.t.identifier('env')), packages_1.t.identifier('NODE_ENV')), packages_1.t.stringLiteral('production')), packages_1.t.stringLiteral(constants_1.CUSTOM_OUTPUT_DIR), packages_1.t.stringLiteral('.next')));
};
const addNextBuildConfig = async (fileOps) => {
    // Find any config file
    let configPath = null;
    let configFileExtension = null;
    // Try each possible extension
    for (const ext of constants_1.JS_FILE_EXTENSIONS) {
        const fileName = `${CONFIG_BASE_NAME.NEXTJS}${ext}`;
        const testPath = fileName;
        if (await fileOps.fileExists(testPath)) {
            configPath = testPath;
            configFileExtension = ext;
            break;
        }
    }
    if (!configPath || !configFileExtension) {
        console.error('No Next.js config file found');
        return false;
    }
    console.log(`Adding standalone output configuration to ${configPath}...`);
    try {
        const data = await fileOps.readFile(configPath);
        if (!data) {
            console.error(`Error reading ${configPath}: file content not found`);
            return false;
        }
        const astParserOption = (0, helpers_1.genASTParserOptionsByFileExtension)(configFileExtension);
        const ast = (0, packages_1.parse)(data, astParserOption);
        // Add both configurations
        const outputExists = addConfigProperty(ast, 'output', packages_1.t.stringLiteral('standalone'));
        const distDirExists = addDistDirConfig(ast);
        const typescriptExists = addTypescriptConfig(ast);
        const eslintExists = addEslintConfig(ast);
        // Generate the modified code from the AST
        const updatedCode = (0, packages_1.generate)(ast, {
            retainLines: true,
            compact: false,
        }, data).code;
        const success = await fileOps.writeFile(configPath, updatedCode);
        if (!success) {
            console.error(`Error writing ${configPath}`);
            return false;
        }
        console.log(`Successfully updated ${configPath} with standalone output, typescript configuration, eslint configuration, and distDir`);
        return outputExists && typescriptExists && distDirExists && eslintExists;
    }
    catch (error) {
        console.error(`Error processing ${configPath}:`, error);
        return false;
    }
};
exports.addNextBuildConfig = addNextBuildConfig;
//# sourceMappingURL=next-config.js.map