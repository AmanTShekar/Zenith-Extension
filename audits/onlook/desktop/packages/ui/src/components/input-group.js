"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputGroup = void 0;
const react_1 = require("react");
const utils_1 = require("../utils");
const InputGroup = ({ className, children }) => {
    const childrenArray = react_1.Children.toArray(children);
    const totalInputs = childrenArray.length;
    return (<div className={(0, utils_1.cn)('flex w-fit min-w-0', className)}>
            {childrenArray.map((child, index) => {
            const isFirst = index === 0;
            const isLast = index === totalInputs - 1;
            return (0, react_1.cloneElement)(child, {
                className: (0, utils_1.cn)(child.props.className, {
                    'rounded-l-none': !isFirst,
                    'rounded-r-none': !isLast,
                    'rounded-none': !isFirst && !isLast,
                    'border-l-0': !isFirst,
                    'border-r-0': !isLast,
                }),
            });
        })}
        </div>);
};
exports.InputGroup = InputGroup;
//# sourceMappingURL=input-group.js.map