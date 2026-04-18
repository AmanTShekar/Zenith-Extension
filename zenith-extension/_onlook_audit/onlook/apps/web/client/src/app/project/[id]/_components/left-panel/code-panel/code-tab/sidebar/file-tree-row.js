"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileTreeRow = void 0;
const utils_1 = require("@onlook/ui/utils");
const FileTreeRow = ({ attrs, children, isHighlighted }) => {
    return (<div {...attrs} className={(0, utils_1.cn)('outline-none h-6 cursor-pointer min-w-0 w-auto rounded', attrs['aria-selected'] ? [
            'bg-red-500/90 dark:bg-red-500/90',
            'text-primary dark:text-primary',
        ] : [
            isHighlighted && 'bg-background-onlook text-foreground-primary',
        ], isHighlighted ?
            'text-foreground-primary bg-red-500/90 hover:bg-red-500' :
            'text-foreground-onlook/70 hover:bg-red-500/30 hover:text-foreground-primary')}>
            {children}
        </div>);
};
exports.FileTreeRow = FileTreeRow;
//# sourceMappingURL=file-tree-row.js.map