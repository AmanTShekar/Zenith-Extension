"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_1 = require("@onlook/models/element");
const input_1 = require("@onlook/ui/input");
const TextProp = ({ prop, onChange, onBlur, type }) => {
    return (<input_1.Input className="w-32 px-2 h-8 text-xs rounded border-none text-foreground-active bg-background-secondary focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" onChange={(e) => onChange(e.target.value)} value={prop.value} type={type === element_1.PropsType.Number ? 'number' : 'text'} onBlur={(e) => onBlur(e.target.value)}/>);
};
exports.default = TextProp;
//# sourceMappingURL=TextProp.js.map