"use strict";
/**
 * Common utilities and patterns shared between grep, glob, and other tool handlers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_TYPE_MAP = exports.DEFAULT_EXCLUDED_PATTERNS = void 0;
exports.buildShellExclusionPattern = buildShellExclusionPattern;
exports.addFindExclusions = addFindExclusions;
exports.filterExcludedPaths = filterExcludedPaths;
exports.getFileTypePattern = getFileTypePattern;
exports.escapeForShell = escapeForShell;
exports.isPathExcluded = isPathExcluded;
// Common directories and files to exclude by default
exports.DEFAULT_EXCLUDED_PATTERNS = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    '.cache',
    'coverage',
    '.nyc_output',
    'tmp',
    'temp',
    '.temp',
    '.tmp',
    'logs',
    '*.log',
    '.DS_Store',
    'Thumbs.db'
];
// File type to extension mapping for filtering by language/type
exports.FILE_TYPE_MAP = {
    'js': '*.js',
    'ts': '*.ts',
    'jsx': '*.jsx',
    'tsx': '*.tsx',
    'py': '*.py',
    'java': '*.java',
    'go': '*.go',
    'rust': '*.rs',
    'cpp': '*.cpp',
    'c': '*.c',
    'html': '*.html',
    'css': '*.css',
    'json': '*.json',
    'xml': '*.xml',
    'yaml': '*.yaml',
    'yml': '*.yml'
};
/**
 * Build shell exclusion pattern for bash/sh glob operations
 * Returns a shell condition string that can be used in bash/sh commands
 */
function buildShellExclusionPattern(excludePatterns = exports.DEFAULT_EXCLUDED_PATTERNS) {
    const conditions = excludePatterns.map(exclude => {
        if (exclude.includes('*')) {
            return `[[ "$f" != ${exclude} ]]`;
        }
        else {
            return `[[ "$f" != */${exclude}/* ]] && [[ "$(basename "$f")" != "${exclude}" ]]`;
        }
    });
    return conditions.join(' && ');
}
/**
 * Add exclusion patterns to a find command
 * Modifies the find command to exclude common directories and files
 */
function addFindExclusions(findCommand, excludePatterns = exports.DEFAULT_EXCLUDED_PATTERNS) {
    let command = findCommand;
    for (const excludeDir of excludePatterns) {
        if (excludeDir.includes('*')) {
            command += ` -not -name "${excludeDir}"`;
        }
        else {
            command += ` -not -path "*/${excludeDir}/*" -not -name "${excludeDir}"`;
        }
    }
    return command;
}
/**
 * Filter file paths to remove excluded patterns
 * Post-processing filter to remove any paths that contain excluded patterns
 */
function filterExcludedPaths(paths, excludePatterns = exports.DEFAULT_EXCLUDED_PATTERNS) {
    return paths.filter(path => {
        const pathParts = path.split('/');
        return !pathParts.some(part => excludePatterns.includes(part));
    });
}
/**
 * Get file extension pattern from type name
 * Converts common file type names to glob patterns
 */
function getFileTypePattern(type) {
    return exports.FILE_TYPE_MAP[type] || `*.${type}`;
}
/**
 * Escape special shell characters in a string
 * Prevents shell injection and ensures proper command execution
 */
function escapeForShell(str) {
    return str.replace(/["`$\\]/g, '\\$&');
}
/**
 * Check if a path contains any excluded patterns
 * Useful for quick validation before processing
 */
function isPathExcluded(path, excludePatterns = exports.DEFAULT_EXCLUDED_PATTERNS) {
    const pathParts = path.split('/');
    return pathParts.some(part => excludePatterns.includes(part));
}
//# sourceMappingURL=cli.js.map