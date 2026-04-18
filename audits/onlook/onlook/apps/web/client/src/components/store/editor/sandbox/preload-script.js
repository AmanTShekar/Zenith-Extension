"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyPreloadScriptToPublic = copyPreloadScriptToPublic;
exports.injectPreloadScriptIntoLayout = injectPreloadScriptIntoLayout;
exports.getLayoutPath = getLayoutPath;
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const parser_1 = require("@onlook/parser");
const utility_1 = require("@onlook/utility");
const path_1 = __importDefault(require("path"));
async function copyPreloadScriptToPublic(provider, routerConfig) {
    try {
        try {
            await provider.createDirectory({ args: { path: 'public' } });
        }
        catch {
            // Directory might already exist, ignore error
        }
        const scriptResponse = await fetch(constants_1.ONLOOK_DEV_PRELOAD_SCRIPT_SRC);
        await provider.writeFile({
            args: {
                path: constants_1.ONLOOK_DEV_PRELOAD_SCRIPT_PATH,
                content: await scriptResponse.text(),
                overwrite: true
            }
        });
        await injectPreloadScriptIntoLayout(provider, routerConfig);
    }
    catch (error) {
        console.error('[PreloadScript] Failed to copy preload script:', error);
    }
}
async function injectPreloadScriptIntoLayout(provider, routerConfig) {
    if (!routerConfig) {
        throw new Error('Could not detect router type for script injection. This is required for iframe communication.');
    }
    const result = await provider.listFiles({ args: { path: routerConfig.basePath } });
    const [layoutFile] = result.files.filter(file => file.type === 'file' && (0, utility_1.isRootLayoutFile)(`${routerConfig.basePath}/${file.name}`, routerConfig.type));
    if (!layoutFile) {
        throw new Error(`No layout files found in ${routerConfig.basePath}`);
    }
    const layoutPath = `${routerConfig.basePath}/${layoutFile.name}`;
    const layoutResponse = await provider.readFile({ args: { path: layoutPath } });
    if (typeof layoutResponse.file.content !== 'string') {
        throw new Error(`Layout file ${layoutPath} is not a text file`);
    }
    const content = layoutResponse.file.content;
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        throw new Error(`Failed to parse layout file: ${layoutPath}`);
    }
    (0, parser_1.injectPreloadScript)(ast);
    const modifiedContent = await (0, parser_1.getContentFromAst)(ast, content);
    await provider.writeFile({
        args: {
            path: layoutPath,
            content: modifiedContent,
            overwrite: true
        }
    });
}
async function getLayoutPath(routerConfig, fileExists) {
    if (!routerConfig) {
        console.log('Could not detect Next.js router type');
        return null;
    }
    let layoutFileName;
    if (routerConfig.type === models_1.RouterType.PAGES) {
        layoutFileName = '_app';
    }
    else {
        layoutFileName = 'layout';
    }
    for (const extension of constants_1.NEXT_JS_FILE_EXTENSIONS) {
        const layoutPath = path_1.default.join(routerConfig.basePath, `${layoutFileName}${extension}`);
        if (await fileExists(layoutPath)) {
            return (0, utility_1.normalizePath)(layoutPath);
        }
    }
    console.log('Could not find layout file');
    return null;
}
//# sourceMappingURL=preload-script.js.map