"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPRESSION_IMAGE_PRESETS = exports.IMAGE_EXTENSIONS = exports.IGNORED_UPLOAD_FILES = exports.BINARY_EXTENSIONS = exports.SUPPORTED_LOCK_FILES = exports.NEXT_JS_FILE_EXTENSIONS = exports.JS_FILE_EXTENSIONS = exports.EXCLUDED_PUBLISH_DIRECTORIES = exports.IGNORED_UPLOAD_DIRECTORIES = exports.EXCLUDED_SYNC_PATHS = exports.DEFAULT_IMAGE_DIRECTORY = exports.DEPRECATED_PRELOAD_SCRIPT_SRCS = exports.ONLOOK_PRELOAD_SCRIPT_SRC = exports.ONLOOK_DEV_PRELOAD_SCRIPT_PATH = exports.ONLOOK_DEV_PRELOAD_SCRIPT_SRC = exports.ONLOOK_PRELOAD_SCRIPT_FILE = exports.ONLOOK_CACHE_DIRECTORY = exports.CUSTOM_OUTPUT_DIR = void 0;
const isDev = process.env.NODE_ENV === 'development';
const BASE_EXCLUDED_DIRECTORIES = ['node_modules', 'dist', 'build', '.git', '.next'];
exports.CUSTOM_OUTPUT_DIR = '.next-prod';
exports.ONLOOK_CACHE_DIRECTORY = '.onlook';
// Preload script. Fetch from local public folder in dev, fetch from CDN in prod.
exports.ONLOOK_PRELOAD_SCRIPT_FILE = 'onlook-preload-script.js';
// Fetch path to load from local
exports.ONLOOK_DEV_PRELOAD_SCRIPT_SRC = `/${exports.ONLOOK_PRELOAD_SCRIPT_FILE}`;
// Path to write into sandbox
exports.ONLOOK_DEV_PRELOAD_SCRIPT_PATH = `public/${exports.ONLOOK_PRELOAD_SCRIPT_FILE}`;
// Fetch url to load from CDN
const ONLOOK_PROD_PRELOAD_SCRIPT_SRC = 'https://cdn.jsdelivr.net/gh/onlook-dev/onlook@d3887f2/apps/web/client/public/onlook-preload-script.js';
// Officially exported src to load from local or CDN
exports.ONLOOK_PRELOAD_SCRIPT_SRC = isDev ? exports.ONLOOK_DEV_PRELOAD_SCRIPT_SRC : ONLOOK_PROD_PRELOAD_SCRIPT_SRC;
exports.DEPRECATED_PRELOAD_SCRIPT_SRCS = [
    'https://cdn.jsdelivr.net/gh/onlook-dev/onlook@main/apps/web/client/public/onlook-preload-script.js',
    // Intentionally reversed to deprecate non-preferred (local in prod, CDN in dev) usage.
    isDev ? ONLOOK_PROD_PRELOAD_SCRIPT_SRC : exports.ONLOOK_DEV_PRELOAD_SCRIPT_SRC,
];
exports.DEFAULT_IMAGE_DIRECTORY = 'public';
exports.EXCLUDED_SYNC_PATHS = [
    ...BASE_EXCLUDED_DIRECTORIES,
    'static',
    'out',
    exports.CUSTOM_OUTPUT_DIR,
    exports.ONLOOK_CACHE_DIRECTORY,
    exports.ONLOOK_DEV_PRELOAD_SCRIPT_PATH,
];
exports.IGNORED_UPLOAD_DIRECTORIES = [...BASE_EXCLUDED_DIRECTORIES, exports.CUSTOM_OUTPUT_DIR];
exports.EXCLUDED_PUBLISH_DIRECTORIES = [...BASE_EXCLUDED_DIRECTORIES, 'coverage'];
const JSX_FILE_EXTENSIONS = ['.jsx', '.tsx'];
exports.JS_FILE_EXTENSIONS = ['.js', '.ts', '.mjs', '.cjs'];
// Nextjs allow jsx in js and ts files so we need to support both
exports.NEXT_JS_FILE_EXTENSIONS = [...JSX_FILE_EXTENSIONS, ...exports.JS_FILE_EXTENSIONS];
exports.SUPPORTED_LOCK_FILES = [
    'bun.lock',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
];
exports.BINARY_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.svg',
    '.ico',
    '.webp',
    '.pdf',
    '.zip',
    '.tar',
    '.gz',
    '.rar',
    '.7z',
    '.mp3',
    '.mp4',
    '.wav',
    '.avi',
    '.mov',
    '.wmv',
    '.exe',
    '.bin',
    '.dll',
    '.so',
    '.dylib',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.otf',
];
exports.IGNORED_UPLOAD_FILES = [
    '.DS_Store',
    'Thumbs.db',
    'yarn.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'bun.lockb',
    '.env.local',
    '.env.development.local',
    '.env.production.local',
    '.env.test.local',
];
exports.IMAGE_EXTENSIONS = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/ico',
    'image/x-icon',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
];
/**
 * Compression presets for common use cases
 */
exports.COMPRESSION_IMAGE_PRESETS = {
    web: {
        quality: 80,
        format: 'webp',
        progressive: true,
        effort: 4,
    },
    thumbnail: {
        quality: 70,
        width: 300,
        height: 300,
        format: 'webp',
        keepAspectRatio: true,
    },
    highQuality: {
        quality: 95,
        format: 'jpeg',
        progressive: true,
        mozjpeg: true,
    },
    lowFileSize: {
        quality: 60,
        format: 'webp',
        effort: 6,
    },
};
//# sourceMappingURL=files.js.map