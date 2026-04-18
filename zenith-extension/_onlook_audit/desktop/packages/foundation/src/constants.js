"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBPACK_DEPENDENCIES = exports.VITE_DEPENDENCIES = exports.CRA_DEPENDENCIES = exports.NEXT_DEPENDENCIES = exports.FILE_EXTENSION = exports.BABELRC_FILE = exports.CONFIG_OVERRIDES_FILE = exports.CRA_COMMON_FILES = exports.NEXTJS_COMMON_FILES = exports.ONLOOK_PLUGIN = exports.PACKAGE_MANAGER = exports.LOCK_FILE_NAME = exports.PACKAGE_JSON = exports.CONFIG_FILE_PATTERN = exports.CONFIG_BASE_NAME = exports.DEPENDENCY_NAME = exports.BUILD_TOOL_NAME = void 0;
var BUILD_TOOL_NAME;
(function (BUILD_TOOL_NAME) {
    BUILD_TOOL_NAME["NEXT"] = "next";
    BUILD_TOOL_NAME["WEBPACK"] = "webpack";
    BUILD_TOOL_NAME["CRA"] = "cra";
    BUILD_TOOL_NAME["VITE"] = "vite";
})(BUILD_TOOL_NAME || (exports.BUILD_TOOL_NAME = BUILD_TOOL_NAME = {}));
var DEPENDENCY_NAME;
(function (DEPENDENCY_NAME) {
    DEPENDENCY_NAME["NEXT"] = "next";
    DEPENDENCY_NAME["WEBPACK"] = "webpack";
    DEPENDENCY_NAME["CRA"] = "react-scripts";
    DEPENDENCY_NAME["VITE"] = "vite";
})(DEPENDENCY_NAME || (exports.DEPENDENCY_NAME = DEPENDENCY_NAME = {}));
var CONFIG_BASE_NAME;
(function (CONFIG_BASE_NAME) {
    CONFIG_BASE_NAME["NEXTJS"] = "next.config";
    CONFIG_BASE_NAME["WEBPACK"] = "webpack.config";
    CONFIG_BASE_NAME["VITEJS"] = "vite.config";
})(CONFIG_BASE_NAME || (exports.CONFIG_BASE_NAME = CONFIG_BASE_NAME = {}));
exports.CONFIG_FILE_PATTERN = {
    [BUILD_TOOL_NAME.NEXT]: `${CONFIG_BASE_NAME.NEXTJS}.*`,
    [BUILD_TOOL_NAME.WEBPACK]: `${CONFIG_BASE_NAME.WEBPACK}.*`,
    [BUILD_TOOL_NAME.VITE]: `${CONFIG_BASE_NAME.VITEJS}.*`,
    [BUILD_TOOL_NAME.CRA]: '',
};
exports.PACKAGE_JSON = 'package.json';
var LOCK_FILE_NAME;
(function (LOCK_FILE_NAME) {
    LOCK_FILE_NAME["YARN"] = "yarn.lock";
    LOCK_FILE_NAME["BUN"] = "bun.lockb";
    LOCK_FILE_NAME["PNPM"] = "pnpm-lock.yaml";
})(LOCK_FILE_NAME || (exports.LOCK_FILE_NAME = LOCK_FILE_NAME = {}));
var PACKAGE_MANAGER;
(function (PACKAGE_MANAGER) {
    PACKAGE_MANAGER["YARN"] = "yarn";
    PACKAGE_MANAGER["NPM"] = "npm";
    PACKAGE_MANAGER["PNPM"] = "pnpm";
    PACKAGE_MANAGER["BUN"] = "bun";
})(PACKAGE_MANAGER || (exports.PACKAGE_MANAGER = PACKAGE_MANAGER = {}));
var ONLOOK_PLUGIN;
(function (ONLOOK_PLUGIN) {
    ONLOOK_PLUGIN["NEXTJS"] = "@onlook/nextjs";
    ONLOOK_PLUGIN["WEBPACK"] = "@onlook/react";
    ONLOOK_PLUGIN["BABEL"] = "@onlook/babel-plugin-react";
})(ONLOOK_PLUGIN || (exports.ONLOOK_PLUGIN = ONLOOK_PLUGIN = {}));
exports.NEXTJS_COMMON_FILES = ['pages', 'app', 'src/pages', 'src/app'];
exports.CRA_COMMON_FILES = ['public', 'src'];
exports.CONFIG_OVERRIDES_FILE = 'config-overrides.js';
exports.BABELRC_FILE = '.babelrc';
var FILE_EXTENSION;
(function (FILE_EXTENSION) {
    FILE_EXTENSION["JS"] = ".js";
    FILE_EXTENSION["MJS"] = ".mjs";
    FILE_EXTENSION["TS"] = ".ts";
})(FILE_EXTENSION || (exports.FILE_EXTENSION = FILE_EXTENSION = {}));
exports.NEXT_DEPENDENCIES = [ONLOOK_PLUGIN.NEXTJS];
exports.CRA_DEPENDENCIES = [ONLOOK_PLUGIN.BABEL, 'customize-cra', 'react-app-rewired'];
exports.VITE_DEPENDENCIES = [ONLOOK_PLUGIN.BABEL];
exports.WEBPACK_DEPENDENCIES = [
    ONLOOK_PLUGIN.BABEL,
    'babel-loader',
    '@babel/preset-react',
    '@babel/core',
    '@babel/preset-env',
    'webpack',
];
//# sourceMappingURL=constants.js.map