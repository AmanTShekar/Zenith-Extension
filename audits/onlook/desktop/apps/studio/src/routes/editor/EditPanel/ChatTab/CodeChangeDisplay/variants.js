"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VARIANTS = void 0;
exports.VARIANTS = {
    minimal: {
        fontSize: 12,
        lineNumbers: 'off',
        // @ts-expect-error - This exists
        tabSize: 1,
        padding: {
            top: 10,
            bottom: 10,
        },
        minimap: {
            enabled: false,
        },
        scrollbar: {
            vertical: 'hidden',
            horizontal: 'hidden',
            alwaysConsumeMouseWheel: false,
        },
    },
    normal: {
        fontSize: 14,
        lineNumbers: 'on',
        // @ts-expect-error - This exists
        tabSize: 2,
        padding: {
            top: 12,
            bottom: 12,
        },
        minimap: {
            enabled: false,
        },
    },
};
//# sourceMappingURL=variants.js.map