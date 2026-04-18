"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const cli_1 = require("@onlook/ai/src/tools/shared/helpers/cli");
(0, bun_test_1.describe)('Tool Helpers', () => {
    (0, bun_test_1.describe)('DEFAULT_EXCLUDED_PATTERNS', () => {
        (0, bun_test_1.test)('should contain common directories and files to exclude', () => {
            (0, bun_test_1.expect)(cli_1.DEFAULT_EXCLUDED_PATTERNS).toContain('node_modules');
            (0, bun_test_1.expect)(cli_1.DEFAULT_EXCLUDED_PATTERNS).toContain('.git');
            (0, bun_test_1.expect)(cli_1.DEFAULT_EXCLUDED_PATTERNS).toContain('.next');
            (0, bun_test_1.expect)(cli_1.DEFAULT_EXCLUDED_PATTERNS).toContain('dist');
            (0, bun_test_1.expect)(cli_1.DEFAULT_EXCLUDED_PATTERNS).toContain('build');
            (0, bun_test_1.expect)(cli_1.DEFAULT_EXCLUDED_PATTERNS).toContain('*.log');
            (0, bun_test_1.expect)(cli_1.DEFAULT_EXCLUDED_PATTERNS).toContain('.DS_Store');
        });
        (0, bun_test_1.test)('should be an array of strings', () => {
            (0, bun_test_1.expect)(Array.isArray(cli_1.DEFAULT_EXCLUDED_PATTERNS)).toBe(true);
            cli_1.DEFAULT_EXCLUDED_PATTERNS.forEach(pattern => {
                (0, bun_test_1.expect)(typeof pattern).toBe('string');
            });
        });
    });
    (0, bun_test_1.describe)('FILE_TYPE_MAP', () => {
        (0, bun_test_1.test)('should map common file types to extensions', () => {
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.js).toBe('*.js');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.ts).toBe('*.ts');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.jsx).toBe('*.jsx');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.tsx).toBe('*.tsx');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.py).toBe('*.py');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.java).toBe('*.java');
        });
        (0, bun_test_1.test)('should handle various programming languages', () => {
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.rust).toBe('*.rs');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.go).toBe('*.go');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.cpp).toBe('*.cpp');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.html).toBe('*.html');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.css).toBe('*.css');
            (0, bun_test_1.expect)(cli_1.FILE_TYPE_MAP.json).toBe('*.json');
        });
    });
    (0, bun_test_1.describe)('buildShellExclusionPattern', () => {
        (0, bun_test_1.test)('should build exclusion pattern for default patterns', () => {
            const pattern = (0, cli_1.buildShellExclusionPattern)();
            (0, bun_test_1.expect)(pattern).toContain('[[ "$f" != */node_modules/* ]]');
            (0, bun_test_1.expect)(pattern).toContain('[[ "$f" != */.git/* ]]');
            (0, bun_test_1.expect)(pattern).toContain('[[ "$f" != *.log ]]');
            (0, bun_test_1.expect)(pattern).toContain('&&');
        });
        (0, bun_test_1.test)('should handle custom exclusion patterns', () => {
            const customPatterns = ['test', '*.tmp'];
            const pattern = (0, cli_1.buildShellExclusionPattern)(customPatterns);
            (0, bun_test_1.expect)(pattern).toContain('[[ "$f" != */test/* ]]');
            (0, bun_test_1.expect)(pattern).toContain('[[ "$f" != *.tmp ]]');
        });
        (0, bun_test_1.test)('should handle patterns with wildcards differently', () => {
            const patterns = ['test_dir', '*.log'];
            const pattern = (0, cli_1.buildShellExclusionPattern)(patterns);
            // Wildcard pattern
            (0, bun_test_1.expect)(pattern).toContain('[[ "$f" != *.log ]]');
            // Regular directory pattern
            (0, bun_test_1.expect)(pattern).toContain('[[ "$f" != */test_dir/* ]]');
            (0, bun_test_1.expect)(pattern).toContain('[[ "$(basename "$f")" != "test_dir" ]]');
        });
        (0, bun_test_1.test)('should join conditions with &&', () => {
            const patterns = ['dir1', 'dir2'];
            const pattern = (0, cli_1.buildShellExclusionPattern)(patterns);
            (0, bun_test_1.expect)(pattern.includes('&&')).toBe(true);
        });
        (0, bun_test_1.test)('should handle empty patterns array', () => {
            const pattern = (0, cli_1.buildShellExclusionPattern)([]);
            (0, bun_test_1.expect)(pattern).toBe('');
        });
        (0, bun_test_1.test)('should handle single pattern', () => {
            const pattern = (0, cli_1.buildShellExclusionPattern)(['test']);
            (0, bun_test_1.expect)(pattern).toContain('[[ "$f" != */test/* ]]');
            (0, bun_test_1.expect)(pattern).toContain('[[ "$(basename "$f")" != "test" ]]');
            (0, bun_test_1.expect)(pattern).toContain('&&'); // Single non-wildcard patterns still use && for path and basename checks
        });
    });
    (0, bun_test_1.describe)('addFindExclusions', () => {
        (0, bun_test_1.test)('should add exclusions to find command', () => {
            const command = (0, cli_1.addFindExclusions)('find . -type f');
            (0, bun_test_1.expect)(command).toContain('-not -path "*/node_modules/*"');
            (0, bun_test_1.expect)(command).toContain('-not -name "node_modules"');
            (0, bun_test_1.expect)(command).toContain('-not -path "*/.git/*"');
            (0, bun_test_1.expect)(command).toContain('-not -name "*.log"');
        });
        (0, bun_test_1.test)('should handle custom exclusion patterns', () => {
            const customPatterns = ['test', '*.tmp'];
            const command = (0, cli_1.addFindExclusions)('find . -type f', customPatterns);
            (0, bun_test_1.expect)(command).toContain('-not -path "*/test/*"');
            (0, bun_test_1.expect)(command).toContain('-not -name "test"');
            (0, bun_test_1.expect)(command).toContain('-not -name "*.tmp"');
        });
        (0, bun_test_1.test)('should handle patterns with wildcards', () => {
            const patterns = ['*.log', 'cache'];
            const command = (0, cli_1.addFindExclusions)('find . -type f', patterns);
            (0, bun_test_1.expect)(command).toContain('-not -name "*.log"');
            (0, bun_test_1.expect)(command).toContain('-not -path "*/cache/*"');
            (0, bun_test_1.expect)(command).toContain('-not -name "cache"');
        });
        (0, bun_test_1.test)('should preserve original find command', () => {
            const originalCommand = 'find /some/path -type f';
            const command = (0, cli_1.addFindExclusions)(originalCommand, ['test']);
            (0, bun_test_1.expect)(command).toContain(originalCommand);
        });
        (0, bun_test_1.test)('should handle empty exclusions', () => {
            const originalCommand = 'find . -type f';
            const command = (0, cli_1.addFindExclusions)(originalCommand, []);
            (0, bun_test_1.expect)(command).toBe(originalCommand);
        });
    });
    (0, bun_test_1.describe)('filterExcludedPaths', () => {
        (0, bun_test_1.test)('should filter out excluded paths', () => {
            const paths = [
                'src/index.ts',
                'node_modules/lib/index.js',
                'src/utils.ts',
                '.git/config',
                'dist/bundle.js',
                'app.log'
            ];
            const filtered = (0, cli_1.filterExcludedPaths)(paths);
            (0, bun_test_1.expect)(filtered).toContain('src/index.ts');
            (0, bun_test_1.expect)(filtered).toContain('src/utils.ts');
            (0, bun_test_1.expect)(filtered).not.toContain('node_modules/lib/index.js');
            (0, bun_test_1.expect)(filtered).not.toContain('.git/config');
            (0, bun_test_1.expect)(filtered).not.toContain('dist/bundle.js');
        });
        (0, bun_test_1.test)('should handle custom exclusion patterns', () => {
            const paths = ['src/file.ts', 'test/file.test.ts', 'docs/readme.md'];
            const customPatterns = ['test', 'docs'];
            const filtered = (0, cli_1.filterExcludedPaths)(paths, customPatterns);
            (0, bun_test_1.expect)(filtered).toContain('src/file.ts');
            (0, bun_test_1.expect)(filtered).not.toContain('test/file.test.ts');
            (0, bun_test_1.expect)(filtered).not.toContain('docs/readme.md');
        });
        (0, bun_test_1.test)('should handle nested paths correctly', () => {
            const paths = [
                'project/src/index.ts',
                'project/node_modules/lib/index.js',
                'project/build/dist/app.js'
            ];
            const filtered = (0, cli_1.filterExcludedPaths)(paths);
            (0, bun_test_1.expect)(filtered).toContain('project/src/index.ts');
            (0, bun_test_1.expect)(filtered).not.toContain('project/node_modules/lib/index.js');
            (0, bun_test_1.expect)(filtered).not.toContain('project/build/dist/app.js');
        });
        (0, bun_test_1.test)('should handle paths with dots correctly', () => {
            const paths = [
                'src/.env.example',
                '.git/hooks/pre-commit',
                '.DS_Store',
                'src/.gitignore'
            ];
            const filtered = (0, cli_1.filterExcludedPaths)(paths);
            (0, bun_test_1.expect)(filtered).toContain('src/.env.example');
            (0, bun_test_1.expect)(filtered).toContain('src/.gitignore');
            (0, bun_test_1.expect)(filtered).not.toContain('.git/hooks/pre-commit');
            (0, bun_test_1.expect)(filtered).not.toContain('.DS_Store');
        });
        (0, bun_test_1.test)('should return empty array for empty input', () => {
            const filtered = (0, cli_1.filterExcludedPaths)([]);
            (0, bun_test_1.expect)(filtered).toEqual([]);
        });
        (0, bun_test_1.test)('should return all paths if no exclusions match', () => {
            const paths = ['src/app.ts', 'lib/utils.ts'];
            const customPatterns = ['nonexistent'];
            const filtered = (0, cli_1.filterExcludedPaths)(paths, customPatterns);
            (0, bun_test_1.expect)(filtered).toEqual(paths);
        });
    });
    (0, bun_test_1.describe)('getFileTypePattern', () => {
        (0, bun_test_1.test)('should return pattern for known file types', () => {
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('js')).toBe('*.js');
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('ts')).toBe('*.ts');
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('tsx')).toBe('*.tsx');
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('py')).toBe('*.py');
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('rust')).toBe('*.rs');
        });
        (0, bun_test_1.test)('should return custom pattern for unknown file types', () => {
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('custom')).toBe('*.custom');
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('xyz')).toBe('*.xyz');
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('unknown')).toBe('*.unknown');
        });
        (0, bun_test_1.test)('should handle empty string', () => {
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('')).toBe('*.');
        });
        (0, bun_test_1.test)('should handle special characters in type', () => {
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('test-type')).toBe('*.test-type');
            (0, bun_test_1.expect)((0, cli_1.getFileTypePattern)('type_1')).toBe('*.type_1');
        });
    });
    (0, bun_test_1.describe)('escapeForShell', () => {
        (0, bun_test_1.test)('should escape backticks', () => {
            (0, bun_test_1.expect)((0, cli_1.escapeForShell)('echo `date`')).toBe('echo \\`date\\`');
        });
        (0, bun_test_1.test)('should escape double quotes', () => {
            (0, bun_test_1.expect)((0, cli_1.escapeForShell)('echo "hello"')).toBe('echo \\"hello\\"');
        });
        (0, bun_test_1.test)('should escape dollar signs', () => {
            (0, bun_test_1.expect)((0, cli_1.escapeForShell)('echo $USER')).toBe('echo \\$USER');
        });
        (0, bun_test_1.test)('should escape backslashes', () => {
            (0, bun_test_1.expect)((0, cli_1.escapeForShell)('path\\to\\file')).toBe('path\\\\to\\\\file');
        });
        (0, bun_test_1.test)('should escape multiple special characters', () => {
            const input = 'echo "Hello $USER" `date`';
            const expected = 'echo \\"Hello \\$USER\\" \\`date\\`';
            (0, bun_test_1.expect)((0, cli_1.escapeForShell)(input)).toBe(expected);
        });
        (0, bun_test_1.test)('should handle empty string', () => {
            (0, bun_test_1.expect)((0, cli_1.escapeForShell)('')).toBe('');
        });
        (0, bun_test_1.test)('should not modify safe strings', () => {
            const safeString = 'hello world 123';
            (0, bun_test_1.expect)((0, cli_1.escapeForShell)(safeString)).toBe(safeString);
        });
        (0, bun_test_1.test)('should handle strings with only special characters', () => {
            (0, bun_test_1.expect)((0, cli_1.escapeForShell)('$"`\\')).toBe('\\$\\"\\`\\\\');
        });
    });
    (0, bun_test_1.describe)('isPathExcluded', () => {
        (0, bun_test_1.test)('should return true for excluded paths', () => {
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('src/node_modules/lib.js')).toBe(true);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('project/.git/config')).toBe(true);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('build/app.js')).toBe(true);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('.DS_Store')).toBe(true);
        });
        (0, bun_test_1.test)('should return false for non-excluded paths', () => {
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('src/index.ts')).toBe(false);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('lib/utils.js')).toBe(false);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('components/App.tsx')).toBe(false);
        });
        (0, bun_test_1.test)('should handle custom exclusion patterns', () => {
            const customPatterns = ['test', 'docs'];
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('src/test/file.ts', customPatterns)).toBe(true);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('project/docs/readme.md', customPatterns)).toBe(true);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('src/index.ts', customPatterns)).toBe(false);
        });
        (0, bun_test_1.test)('should handle nested paths', () => {
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('project/deep/node_modules/lib/index.js')).toBe(true);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('project/src/components/App.tsx')).toBe(false);
        });
        (0, bun_test_1.test)('should handle root-level excluded items', () => {
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('node_modules')).toBe(true);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('.git')).toBe(true);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('dist')).toBe(true);
        });
        (0, bun_test_1.test)('should handle empty paths', () => {
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('')).toBe(false);
        });
        (0, bun_test_1.test)('should handle paths with similar but different names', () => {
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('node_modules_backup/lib.js')).toBe(false);
            (0, bun_test_1.expect)((0, cli_1.isPathExcluded)('src/build_tools/webpack.js')).toBe(false);
        });
    });
});
//# sourceMappingURL=helpers.test.js.map