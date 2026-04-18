"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const path_1 = require("../src/path");
(0, bun_test_1.describe)('isSubdirectory', () => {
    (0, bun_test_1.test)('returns true for direct subdirectory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', ['/project/sandbox/foo'])).toBe(true);
    });
    (0, bun_test_1.test)('returns true for nested subdirectory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar/baz.txt', ['/project/sandbox/foo'])).toBe(true);
    });
    (0, bun_test_1.test)('returns false for file outside directory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox2/foo/bar.txt', ['/project/sandbox/foo'])).toBe(false);
    });
    (0, bun_test_1.test)('returns true for file in the directory itself', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo', ['/project/sandbox/foo'])).toBe(true);
    });
    (0, bun_test_1.test)('returns false for file in sibling directory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/bar/baz.txt', ['/project/sandbox/foo'])).toBe(false);
    });
    (0, bun_test_1.test)('returns true for multiple directories (one matches)', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', [
            '/project/sandbox/other',
            '/project/sandbox/foo',
        ])).toBe(true);
    });
    (0, bun_test_1.test)('returns false for multiple directories (none match)', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', [
            '/project/sandbox/other',
            '/project/sandbox/else',
        ])).toBe(false);
    });
    (0, bun_test_1.test)('handles relative file paths', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('foo/bar.txt', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('foo/bar/baz.txt', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('bar/baz.txt', ['foo'])).toBe(false);
    });
    (0, bun_test_1.test)('handles relative directory paths', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', ['foo/bar'])).toBe(false);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', ['bar'])).toBe(false);
    });
    (0, bun_test_1.test)('returns false for empty directories array', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', [])).toBe(false);
    });
    (0, bun_test_1.test)('returns true for root directory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo.txt', ['/project/sandbox'])).toBe(true);
    });
    (0, bun_test_1.test)('handles Windows-style paths', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('C:/project/sandbox/foo/bar.txt', ['C:/project/sandbox/foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('C:/project/sandbox/foo/bar.txt', ['C:/project/sandbox/other'])).toBe(false);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('C:\\project\\sandbox\\foo\\bar.txt', ['C:\\project\\sandbox\\foo'])).toBe(true);
    });
    (0, bun_test_1.test)('returns true if filePath is exactly the directory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo', ['/project/sandbox/foo'])).toBe(true);
    });
    (0, bun_test_1.test)('returns false if filePath is parent of directory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox', ['/project/sandbox/foo'])).toBe(false);
    });
    (0, bun_test_1.test)('handles .git directory with parent path', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('../home/csb-session-000000000000013wf4ua/workspace/.git/FETCH_HEAD', [
            '.git',
        ])).toBe(true);
    });
    (0, bun_test_1.test)('absolute file and directory paths (POSIX)', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/file.txt', ['/a/b/c'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/d/file.txt', ['/a/b/c'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c', ['/a/b/c'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c', ['/a/b/c/'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/', ['/a/b/c'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/../c/file.txt', ['/a/b/c'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/d/file.txt', ['/a/b/c'])).toBe(false);
    });
    (0, bun_test_1.test)('relative file and directory paths', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('foo/bar.txt', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('foo/bar/baz.txt', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('foo', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('foo/', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('foo/../foo/bar.txt', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('bar/baz.txt', ['foo'])).toBe(false);
    });
    (0, bun_test_1.test)('absolute file, relative directory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', ['foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/project/sandbox/foo/bar.txt', ['bar'])).toBe(false);
    });
    (0, bun_test_1.test)('relative file, absolute directory', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('sandbox/foo/bar.txt', ['/sandbox/foo'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('sandbox/bar.txt', ['/sandbox/foo'])).toBe(false);
    });
    (0, bun_test_1.test)('mixed absolute and relative paths', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/file.txt', ['b/c'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('a/b/c/file.txt', ['/a/b'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/file.txt', ['a/b'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('a/b/c/file.txt', ['/a/b/c'])).toBe(true);
    });
    (0, bun_test_1.test)('edge cases: trailing slashes, dot segments, case sensitivity', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/A/B/C/file.txt', ['/A/B/C'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/A/B/C/file.txt', ['/a/b/c'])).toBe(false); // case sensitive
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/./file.txt', ['/a/b/c'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/../c/file.txt', ['/a/b/c'])).toBe(true);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c', ['/a/b/c/.'])).toBe(true);
    });
    (0, bun_test_1.test)('negative cases: file outside, above, or in sibling directories', () => {
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/file.txt', ['/a/b/c'])).toBe(false);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/c/../../file.txt', ['/a/b/c'])).toBe(false);
        (0, bun_test_1.expect)((0, path_1.isSubdirectory)('/a/b/d/file.txt', ['/a/b/c'])).toBe(false);
    });
});
(0, bun_test_1.describe)('isTargetFile', () => {
    (0, bun_test_1.test)('returns true for a valid file in a primary potential path', () => {
        const targetFile = 'src/app/layout.tsx';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(true);
    });
    (0, bun_test_1.test)('returns true for a valid file in a secondary potential path', () => {
        const targetFile = 'app/layout.tsx';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(true);
    });
    (0, bun_test_1.test)('returns true for a valid file with an alternative valid extension', () => {
        const targetFile = 'app/layout.jsx';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(true);
    });
    (0, bun_test_1.test)('returns false for a file in a non-specified subdirectory', () => {
        const targetFile = 'app/test/layout.jsx';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(false);
    });
    (0, bun_test_1.test)('returns false for a file with an invalid extension', () => {
        const targetFile = 'app/layout.md';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(false);
    });
    (0, bun_test_1.test)('returns false for a file with a different name', () => {
        const targetFile = 'app/layout2.jsx';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(false);
    });
    (0, bun_test_1.test)('handles extensions with or without leading dot', () => {
        const targetFile = 'src/app/layout.tsx';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(true);
    });
    (0, bun_test_1.test)('returns false when targetFile has no extension', () => {
        const targetFile = 'src/app/layout';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(false);
    });
    (0, bun_test_1.test)('returns false for a file in a completely different directory', () => {
        const targetFile = 'src/components/layout.tsx';
        (0, bun_test_1.expect)((0, path_1.isRootLayoutFile)(targetFile)).toBe(false);
    });
});
//# sourceMappingURL=path.test.js.map