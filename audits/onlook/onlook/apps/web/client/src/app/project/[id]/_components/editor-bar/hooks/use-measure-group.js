"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMeasureGroup = void 0;
const react_1 = require("react");
// Pre-calculated approximate widths for each group type
const GROUP_WIDTHS = {
    // Div groups
    'dimensions': 160, // Width + Height
    'base': 180, // Color + Border + Radius
    'layout': 180, // Display + Padding + Margin
    'typography': 320, // Font Family + Weight + Size
    'text-color': 40, // Text Color
    'opacity': 80, // Opacity
    // Text groups (wider due to more components)
    'text-typography': 360, // Font Family + Weight + Size + Color + Align + Advanced
    'text-dimensions': 160, // Width + Height
    'text-base': 180, // Color + Border + Radius
    'text-layout': 180, // Display + Padding + Margin
    'text-opacity': 80, // Opacity
};
const useMeasureGroup = ({ availableWidth = 0, count = 0 }) => {
    const [visibleCount, setVisibleCount] = (0, react_1.useState)(count);
    // Update visible count based on available width
    const updateVisibleCount = (0, react_1.useCallback)(() => {
        if (!availableWidth)
            return;
        const OVERFLOW_BUTTON_WIDTH = 32;
        const SEPARATOR_WIDTH = 8;
        const BUFFER_WIDTH = 10;
        let used = 0;
        let count = 0;
        // Get all group keys in order
        const groupKeys = Object.keys(GROUP_WIDTHS);
        for (let i = 0; i < groupKeys.length; i++) {
            const width = GROUP_WIDTHS[groupKeys[i]];
            // Add separator width if this isn't the first group
            const totalWidth = width + (count > 0 ? SEPARATOR_WIDTH : 0);
            if (used + totalWidth <= availableWidth - OVERFLOW_BUTTON_WIDTH - BUFFER_WIDTH) {
                used += totalWidth;
                count++;
            }
            else {
                break;
            }
        }
        setVisibleCount(count);
    }, [availableWidth]);
    // Update visible count when available width changes
    (0, react_1.useEffect)(() => {
        updateVisibleCount();
    }, [updateVisibleCount]);
    return {
        visibleCount,
    };
};
exports.useMeasureGroup = useMeasureGroup;
//# sourceMappingURL=use-measure-group.js.map