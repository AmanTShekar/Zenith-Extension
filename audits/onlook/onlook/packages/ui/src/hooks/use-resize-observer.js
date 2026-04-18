"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useResizeObserver = useResizeObserver;
const react_1 = require("react");
function useResizeObserver(elementRef) {
    const [entry, setEntry] = (0, react_1.useState)();
    const updateEntry = ([entry]) => {
        setEntry(entry);
    };
    (0, react_1.useEffect)(() => {
        const node = elementRef?.current;
        if (!node)
            return;
        const observer = new ResizeObserver(updateEntry);
        observer.observe(node);
        return () => observer.disconnect();
    }, [elementRef]);
    return entry;
}
//# sourceMappingURL=use-resize-observer.js.map