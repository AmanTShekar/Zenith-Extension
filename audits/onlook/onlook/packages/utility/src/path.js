"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRootLayoutFile = exports.isTargetFile = void 0;
exports.isSubdirectory = isSubdirectory;
exports.pathsEqual = pathsEqual;
exports.pathMatchesAny = pathMatchesAny;
exports.findMatchingPath = findMatchingPath;
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const is_subdir_1 = __importDefault(require("is-subdir"));
const path_1 = __importDefault(require("path"));
// Utility to normalize paths for comparison (handles Windows and POSIX)
function normalize(p) {
    if (typeof p !== 'string' || !p)
        return '';
    let np = p.replace(/\\/g, '/');
    // Lowercase drive letter for Windows
    if (typeof np === 'string' && np.length > 0 && /^[A-Za-z]:\//.test(np)) {
        np = np[0]?.toLowerCase() + np.slice(1);
    }
    return np;
}
// See: https://www.npmjs.com/package/is-subdir
// isSubdir(parentDir, subdir) returns true if subdir is the same as or inside parentDir
function isSubdirectory(filePath, directories) {
    const absFilePath = path_1.default.resolve(filePath);
    const normFilePath = normalize(absFilePath);
    for (const directory of directories) {
        const absDirectory = path_1.default.resolve(directory);
        const normDirectory = normalize(absDirectory);
        // Standard is-subdir check
        if ((0, is_subdir_1.default)(normDirectory, normFilePath)) {
            return true;
        }
        // If directory is a simple name (like 'foo' or '.git'), check if filePath contains it as a segment
        if (!directory.includes(path_1.default.sep) &&
            !directory.includes('/') &&
            !directory.includes('\\')) {
            const segments = normFilePath.split('/');
            if (segments.includes(directory)) {
                return true;
            }
        }
        // Enhanced: handle mixed absolute/relative by checking if directory segments appear in file path
        const dirSegments = normalize(directory).split('/').filter(Boolean);
        const fileSegments = normFilePath.split('/').filter(Boolean);
        if (dirSegments.length > 0 && fileSegments.length >= dirSegments.length) {
            for (let i = 0; i <= fileSegments.length - dirSegments.length; i++) {
                let match = true;
                for (let j = 0; j < dirSegments.length; j++) {
                    if (fileSegments[i + j] !== dirSegments[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    return true;
                }
            }
        }
    }
    return false;
}
// Utility to check if a file matches the conditions
const isTargetFile = (targetFile, conditions) => {
    const { fileName, targetExtensions, potentialPaths } = conditions;
    const fileExtWithDot = path_1.default.extname(targetFile);
    if (!fileExtWithDot) {
        return false;
    }
    const hasValidExtension = targetExtensions.some((ext) => ext.startsWith('.') ? ext === fileExtWithDot : ext === fileExtWithDot.slice(1));
    if (!hasValidExtension) {
        return false;
    }
    const baseName = path_1.default.basename(targetFile, fileExtWithDot);
    if (baseName !== fileName) {
        return false;
    }
    const dirName = normalize(path_1.default.dirname(targetFile));
    return potentialPaths.some((p) => normalize(p) === dirName);
};
exports.isTargetFile = isTargetFile;
const isRootLayoutFile = (filePath, routerType = models_1.RouterType.APP) => {
    const potentialPaths = routerType === models_1.RouterType.APP ? ['app', 'src/app'] : ['pages', 'src/pages'];
    return (0, exports.isTargetFile)(filePath, {
        fileName: 'layout',
        targetExtensions: constants_1.NEXT_JS_FILE_EXTENSIONS,
        potentialPaths,
    });
};
exports.isRootLayoutFile = isRootLayoutFile;
/**
 * Compare two file paths for equality, handling different formats robustly
 * Normalizes both paths before comparison to handle leading slashes, double slashes, etc.
 *
 * Examples:
 * - pathsEqual('/src/app/page.tsx', 'src/app/page.tsx') => true
 * - pathsEqual('src//app/page.tsx', 'src/app/page.tsx') => true
 * - pathsEqual('./src/app/page.tsx', 'src/app/page.tsx') => true
 */
function pathsEqual(path1, path2) {
    if (!path1 || !path2)
        return false;
    const normalizeForComparison = (p) => {
        const clean = p.startsWith('/') ? p.substring(1) : p;
        return path_1.default.posix.normalize(clean);
    };
    return normalizeForComparison(path1) === normalizeForComparison(path2);
}
function pathMatchesAny(targetPath, paths) {
    return paths.some(p => pathsEqual(targetPath, p));
}
function findMatchingPath(targetPath, paths) {
    return paths.find(p => pathsEqual(targetPath, p));
}
//# sourceMappingURL=path.js.map