"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeRow = ({ innerRef, attrs, children }) => {
    return (<div ref={innerRef} {...attrs} className="outline-none">
            {children}
        </div>);
};
exports.default = TreeRow;
//# sourceMappingURL=TreeRow.js.map