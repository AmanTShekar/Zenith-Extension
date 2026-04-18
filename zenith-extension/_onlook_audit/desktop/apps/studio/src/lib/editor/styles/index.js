"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompoundStyleImpl = exports.SingleStyleImpl = void 0;
class SingleStyleImpl {
    key;
    defaultValue;
    displayName;
    type;
    params;
    elStyleType = 'single';
    constructor(key, defaultValue, displayName, type, params) {
        this.key = key;
        this.defaultValue = defaultValue;
        this.displayName = displayName;
        this.type = type;
        this.params = params;
    }
    getValue(styleRecord) {
        return styleRecord[this.key] ?? this.defaultValue;
    }
}
exports.SingleStyleImpl = SingleStyleImpl;
class CompoundStyleImpl {
    key;
    head;
    children;
    elStyleType = 'compound';
    constructor(key, head, children) {
        this.key = key;
        this.head = head;
        this.children = children;
    }
    isHeadSameAsChildren(style) {
        const headValue = this.head.getValue(style);
        const childrenValues = this.children.map((child) => child.getValue(style));
        return !childrenValues.every((value) => value === headValue);
    }
}
exports.CompoundStyleImpl = CompoundStyleImpl;
//# sourceMappingURL=index.js.map