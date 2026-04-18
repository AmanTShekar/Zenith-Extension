"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.string = string;
exports.boolean = boolean;
exports.number = number;
exports.enum = enum_;
exports.object = object;
function string() {
    return {
        type: 'string',
        default: '',
    };
}
function boolean() {
    return {
        type: 'boolean',
        default: false,
    };
}
function number() {
    return {
        type: 'number',
        default: 0,
    };
}
function enum_(options) {
    return {
        type: 'enum',
        default: options[0],
        options,
    };
}
function object(props) {
    const defaultValue = Object.fromEntries(Object.entries(props).map(([key, value]) => [
        key,
        value.default,
    ]));
    return {
        type: 'object',
        props,
        default: defaultValue,
    };
}
//# sourceMappingURL=props.js.map