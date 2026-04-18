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
exports.isViteProjectSupportFileExtension = exports.isSupportFileExtension = exports.checkVariableDeclarationExist = exports.genImportDeclaration = exports.genASTParserOptionsByFileExtension = exports.getFileExtensionByPattern = exports.hasDependency = exports.getPackageManager = exports.installPackages = exports.getFileNamesByPattern = exports.exists = void 0;
const t = __importStar(require("@babel/types"));
const child_process_1 = require("child_process");
const fast_glob_1 = __importDefault(require("fast-glob"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("./constants");
const exists = async (filePattern) => {
    try {
        const pattern = path.resolve(process.cwd(), filePattern);
        const files = (0, exports.getFileNamesByPattern)(pattern);
        return files.length > 0;
    }
    catch (err) {
        console.error(err);
        return false;
    }
};
exports.exists = exists;
const getFileNamesByPattern = (pattern) => fast_glob_1.default.sync(pattern);
exports.getFileNamesByPattern = getFileNamesByPattern;
const installPackages = async (packages) => {
    const packageManager = await (0, exports.getPackageManager)();
    const command = packageManager === constants_1.PACKAGE_MANAGER.YARN ? 'yarn add -D' : `${packageManager} install -D`;
    console.log('Package manager found:', packageManager);
    console.log('\n$', `${command} ${packages.join(' ')}`);
    (0, child_process_1.execSync)(`${command} ${packages.join(' ')}`, { stdio: 'pipe' });
};
exports.installPackages = installPackages;
const getPackageManager = async () => {
    try {
        if (await (0, exports.exists)(constants_1.LOCK_FILE_NAME.YARN)) {
            return constants_1.PACKAGE_MANAGER.YARN;
        }
        if (await (0, exports.exists)(constants_1.LOCK_FILE_NAME.PNPM)) {
            return constants_1.PACKAGE_MANAGER.PNPM;
        }
        if (await (0, exports.exists)(constants_1.LOCK_FILE_NAME.BUN)) {
            return constants_1.PACKAGE_MANAGER.BUN;
        }
        return constants_1.PACKAGE_MANAGER.NPM;
    }
    catch (e) {
        console.error('Error determining package manager, using npm by default', e);
        return constants_1.PACKAGE_MANAGER.NPM;
    }
};
exports.getPackageManager = getPackageManager;
const hasDependency = async (dependencyName, targetPath) => {
    const packageJsonPath = targetPath
        ? path.resolve(targetPath, constants_1.PACKAGE_JSON)
        : path.resolve(constants_1.PACKAGE_JSON);
    if (await (0, exports.exists)(packageJsonPath)) {
        const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        return ((packageJson.dependencies && dependencyName in packageJson.dependencies) ||
            (packageJson.devDependencies && dependencyName in packageJson.devDependencies));
    }
    return false;
};
exports.hasDependency = hasDependency;
const getFileExtensionByPattern = async (dir, filePattern) => {
    const fullDirPattern = path.resolve(dir, filePattern);
    const files = await (0, exports.getFileNamesByPattern)(fullDirPattern);
    if (files.length > 0) {
        return path.extname(files[0]);
    }
    return null;
};
exports.getFileExtensionByPattern = getFileExtensionByPattern;
const genASTParserOptionsByFileExtension = (fileExtension, sourceType = 'module') => {
    switch (fileExtension) {
        case constants_1.FILE_EXTENSION.JS:
            return {
                sourceType: sourceType,
            };
        case constants_1.FILE_EXTENSION.MJS:
            return {
                sourceType: sourceType,
                plugins: ['jsx'],
            };
        case constants_1.FILE_EXTENSION.TS:
            return {
                sourceType: sourceType,
                plugins: ['typescript'],
            };
        default:
            return {};
    }
};
exports.genASTParserOptionsByFileExtension = genASTParserOptionsByFileExtension;
const genImportDeclaration = (fileExtension, dependency) => {
    switch (fileExtension) {
        case constants_1.FILE_EXTENSION.JS:
            return t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier(dependency), t.callExpression(t.identifier('require'), [t.stringLiteral(dependency)])),
            ]);
        case constants_1.FILE_EXTENSION.MJS:
            return t.importDeclaration([t.importDefaultSpecifier(t.identifier(dependency))], t.stringLiteral(dependency));
        default:
            return null;
    }
};
exports.genImportDeclaration = genImportDeclaration;
const checkVariableDeclarationExist = (path, dependency) => {
    return (t.isIdentifier(path.node.id, { name: dependency }) &&
        t.isCallExpression(path.node.init) &&
        path.node.init.callee.name === 'require' &&
        path.node.init.arguments[0].value === dependency);
};
exports.checkVariableDeclarationExist = checkVariableDeclarationExist;
const isSupportFileExtension = (fileExtension) => {
    return ([constants_1.FILE_EXTENSION.JS, constants_1.FILE_EXTENSION.MJS, constants_1.FILE_EXTENSION.TS].indexOf(fileExtension) !== -1);
};
exports.isSupportFileExtension = isSupportFileExtension;
const isViteProjectSupportFileExtension = (fileExtension) => {
    return [constants_1.FILE_EXTENSION.JS, constants_1.FILE_EXTENSION.TS].indexOf(fileExtension) !== -1;
};
exports.isViteProjectSupportFileExtension = isViteProjectSupportFileExtension;
//# sourceMappingURL=utils.js.map