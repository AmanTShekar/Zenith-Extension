"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const vite_1 = require("vite");
const simple_1 = __importDefault(require("vite-plugin-electron/simple"));
const package_json_1 = __importDefault(require("./package.json"));
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)(({ command }) => {
    (0, node_fs_1.rmSync)('dist-electron', {
        recursive: true,
        force: true,
    });
    const isServe = command === 'serve';
    const isBuild = command === 'build';
    const sourcemap = isServe || !!process.env.VSCODE_DEBUG;
    try {
        (0, node_fs_1.cpSync)('resources', 'dist-electron/main/resources', { recursive: true });
        console.log('✓ Resources folder copied to dist-electron');
    }
    catch (err) {
        console.error('Failed to copy resources folder:', err);
    }
    return {
        resolve: {
            alias: {
                '@': node_path_1.default.join(__dirname, 'src'),
                common: node_path_1.default.join(__dirname, 'common'),
            },
        },
        optimizeDeps: {
            exclude: ['node_modules/.vite/deps'],
        },
        plugins: [
            (0, plugin_react_1.default)(),
            (0, simple_1.default)({
                main: {
                    // Shortcut of `build.lib.entry`
                    entry: 'electron/main/index.ts',
                    onstart(args) {
                        if (process.env.VSCODE_DEBUG) {
                            console.log(
                            /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App');
                        }
                        else {
                            args.startup();
                        }
                    },
                    vite: {
                        build: {
                            sourcemap: sourcemap ? 'inline' : undefined,
                            minify: isBuild,
                            outDir: 'dist-electron/main',
                            rollupOptions: {
                                external: Object.keys('dependencies' in package_json_1.default ? package_json_1.default.dependencies : {}),
                            },
                        },
                    },
                },
                preload: {
                    input: {
                        index: 'electron/preload/browserview/index.ts',
                        webview: 'electron/preload/webview/index.ts',
                    },
                    vite: {
                        build: {
                            sourcemap: sourcemap ? 'inline' : undefined,
                            minify: isBuild,
                            outDir: 'dist-electron/preload',
                            rollupOptions: {
                                external: Object.keys(package_json_1.default.dependencies ?? {}),
                                output: {
                                    format: 'cjs',
                                    entryFileNames: '[name].js',
                                    inlineDynamicImports: false,
                                },
                            },
                        },
                    },
                },
                // Ployfill the Electron and Node.js API for Renderer process.
                // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
                // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
                renderer: {},
            }),
        ],
        server: process.env.VSCODE_DEBUG
            ? (() => {
                const url = new URL(package_json_1.default.debug.env.VITE_DEV_SERVER_URL);
                return {
                    host: url.hostname,
                    port: +url.port,
                };
            })()
            : undefined,
        clearScreen: false,
    };
});
//# sourceMappingURL=vite.config.js.map