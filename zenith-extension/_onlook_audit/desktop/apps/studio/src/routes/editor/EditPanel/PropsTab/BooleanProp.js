"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const button_1 = require("@onlook/ui/button");
const BooleanProp = ({ value, change }) => {
    return (<div className="flex flex-row p-0.5 w-32 h-8 text-xs rounded border-none text-foreground-active bg-background-secondary text-start">
            <button_1.Button className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${value === true ? 'bg-background-tertiary hover:bg-background-tertiary' : 'hover:bg-background-tertiary/50'}`} variant={'ghost'} onClick={() => change(true)}>
                True
            </button_1.Button>
            <button_1.Button className={`h-full w-full px-0.5 py-1.5 bg-background-secondary rounded-sm ${value === false ? 'bg-background-tertiary hover:bg-background-tertiary' : 'hover:bg-background-tertiary/50'}`} variant={'ghost'} onClick={() => change(false)}>
                False
            </button_1.Button>
        </div>);
};
exports.default = BooleanProp;
//# sourceMappingURL=BooleanProp.js.map