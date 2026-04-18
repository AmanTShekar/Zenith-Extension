"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customTwMerge = void 0;
const tailwind_merge_1 = require("tailwind-merge");
const BG_PATTERNS = {
    color: /^bg-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)|transparent|current|inherit|black|white|\[.*?\])$/,
    repeat: /^bg-(?:repeat|no-repeat|repeat-x|repeat-y|repeat-round|repeat-space)$/,
    size: /^bg-(?:auto|cover|contain)$/,
    position: /^bg-(?:bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/,
    attachment: /^bg-(?:fixed|local|scroll)$/,
};
const dedupBackgroundClasses = (classes) => {
    const categories = {
        color: [],
        repeat: [],
        size: [],
        position: [],
        attachment: [],
    };
    const nonBgClasses = [];
    for (const cls of classes) {
        let categorized = false;
        for (const [category, pattern] of Object.entries(BG_PATTERNS)) {
            if (pattern.test(cls)) {
                categories[category].push(cls);
                categorized = true;
                break;
            }
        }
        if (!categorized) {
            nonBgClasses.push(cls);
        }
    }
    const deduplicated = [
        ...nonBgClasses,
        ...Object.values(categories)
            .map((arr) => arr.pop())
            .filter(Boolean),
    ];
    return deduplicated;
};
const customTwMerge = (...classLists) => {
    const merged = (0, tailwind_merge_1.twMerge)(...classLists);
    const classes = merged.split(/\s+/).filter(Boolean);
    const dedupedBgClasses = dedupBackgroundClasses(classes);
    return (0, tailwind_merge_1.twMerge)(dedupedBgClasses.join(' '));
};
exports.customTwMerge = customTwMerge;
//# sourceMappingURL=tw-merge.js.map