"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputRadio = void 0;
const utils_1 = require("@onlook/ui/utils");
const InputRadio = ({ options, value, onChange, className }) => {
    const isIconOption = (option) => {
        return 'icon' in option;
    };
    return (<div className={(0, utils_1.cn)('flex flex-1', className)}>
            {options.map((option, index) => (<button key={option.value} className={(0, utils_1.cn)("px-1 h-9 text-sm flex-1 cursor-pointer transition-colors", value === option.value
                ? "bg-background-tertiary text-white"
                : "bg-background-tertiary/50 text-muted-foreground hover:bg-background-tertiary/70 hover:text-white", index === 0 && "rounded-l-md", index === options.length - 1 && "rounded-r-md")} onClick={() => onChange(option.value)}>
                    {isIconOption(option) ? (<div className="mx-auto w-fit">{option.icon}</div>) : (option.label)}
                </button>))}
        </div>);
};
exports.InputRadio = InputRadio;
//# sourceMappingURL=input-radio.js.map