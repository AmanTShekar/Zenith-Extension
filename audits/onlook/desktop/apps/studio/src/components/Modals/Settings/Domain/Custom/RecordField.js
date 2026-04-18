"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordField = RecordField;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("react");
function RecordField({ value, className, copyable = true, }) {
    const [copied, setCopied] = (0, react_1.useState)(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (<div className={(0, utils_1.cn)('text-sm relative group p-1', className)}>
            <p className="pr-6 overflow-auto text-ellipsis">{value}</p>
            {copyable && (<button_1.Button className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" variant="ghost" size="icon" onClick={copyToClipboard}>
                    {copied ? <icons_1.Icons.Check /> : <icons_1.Icons.Copy />}
                </button_1.Button>)}
        </div>);
}
//# sourceMappingURL=RecordField.js.map