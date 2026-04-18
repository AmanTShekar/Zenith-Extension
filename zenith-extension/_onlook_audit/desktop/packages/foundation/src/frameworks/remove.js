"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDependencies = exports.removeViteConfig = exports.removeNextConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("src/constants");
const removeNextConfig = async (targetPath) => {
    const configPath = path_1.default.join(targetPath, `${constants_1.CONFIG_BASE_NAME.NEXTJS}*`);
    const files = await fs_1.default.promises.readdir(path_1.default.dirname(configPath));
    const configFile = files.find((file) => file.startsWith(constants_1.CONFIG_BASE_NAME.NEXTJS));
    if (configFile) {
        const fullPath = path_1.default.join(targetPath, configFile);
        let content = await fs_1.default.promises.readFile(fullPath, 'utf8');
        // Remove the Onlook plugin configuration with any object
        content = content.replace(/swcPlugins:\s*\[\s*\[\s*"@onlook\/nextjs"(,\s*\{[^}]*\})?\s*\]\s*\]/, '');
        // Remove empty swcPlugins array if it exists
        content = content.replace(/swcPlugins:\s*\[\s*\],?\s*/g, '');
        // Remove empty experimental object if it exists
        content = content.replace(/experimental:\s*{\s*},?/, '');
        // Remove trailing commas if any
        content = content.replace(/,(\s*[}\]])/g, '$1');
        await fs_1.default.promises.writeFile(fullPath, content, 'utf8');
        console.log(`Onlook plugin configuration removed from ${fullPath}`);
    }
    else {
        console.log(`No Next.js config file found in ${targetPath}`);
    }
};
exports.removeNextConfig = removeNextConfig;
const removeViteConfig = async (targetPath) => {
    const configPath = path_1.default.join(targetPath, `${constants_1.CONFIG_BASE_NAME.VITEJS}*`);
    const files = await fs_1.default.promises.readdir(path_1.default.dirname(configPath));
    const configFile = files.find((file) => file.startsWith(constants_1.CONFIG_BASE_NAME.VITEJS));
    if (configFile) {
        const fullPath = path_1.default.join(targetPath, configFile);
        let content = await fs_1.default.promises.readFile(fullPath, 'utf8');
        // Remove the Onlook babel plugin from the plugins array
        content = content.replace(/,?\s*"@onlook\/babel-plugin-react"(?=\s*[\],])/g, '');
        // Remove empty babel plugins array if it exists
        content = content.replace(/plugins:\s*\[\s*\],?\s*/g, '');
        // Remove empty babel object if it exists
        content = content.replace(/babel:\s*{\s*},?\s*/g, '');
        // Remove trailing commas if any
        content = content.replace(/,(\s*[}\]])/g, '$1');
        await fs_1.default.promises.writeFile(fullPath, content, 'utf8');
        console.log(`Onlook babel plugin removed from ${fullPath}`);
    }
    else {
        console.log(`No Vite config file found in ${targetPath}`);
    }
};
exports.removeViteConfig = removeViteConfig;
const removeDependencies = async (targetPath, dependencies) => {
    const packageJsonPath = path_1.default.join(targetPath, 'package.json');
    try {
        const content = await fs_1.default.promises.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(content);
        let modified = false;
        // Check and remove from dependencies
        if (packageJson.dependencies) {
            dependencies.forEach((dep) => {
                if (packageJson.dependencies[dep]) {
                    delete packageJson.dependencies[dep];
                    modified = true;
                }
            });
        }
        // Check and remove from devDependencies
        if (packageJson.devDependencies) {
            dependencies.forEach((dep) => {
                if (packageJson.devDependencies[dep]) {
                    delete packageJson.devDependencies[dep];
                    modified = true;
                }
            });
        }
        if (modified) {
            await fs_1.default.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
            console.log(`Removed dependencies from ${packageJsonPath}`);
        }
        else {
            console.log('No matching dependencies found to remove');
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`No package.json found in ${targetPath}`);
        }
        else {
            throw error;
        }
    }
};
exports.removeDependencies = removeDependencies;
//# sourceMappingURL=remove.js.map