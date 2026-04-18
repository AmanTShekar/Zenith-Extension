"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeRow = void 0;
const TreeRow = ({ innerRef, attrs, children }) => {
    return (<div ref={innerRef} {...attrs} className="outline-none">
            {children}
        </div>);
};
exports.TreeRow = TreeRow;
//# sourceMappingURL=tree-row.js.map