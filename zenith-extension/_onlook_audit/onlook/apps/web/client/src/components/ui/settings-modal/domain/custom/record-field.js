"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnsRecords = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const use_domain_verification_1 = require("./use-domain-verification");
exports.DnsRecords = (0, mobx_react_lite_1.observer)(() => {
    const { verification } = (0, use_domain_verification_1.useDomainVerification)();
    const txtRecord = verification?.txtRecord;
    const aRecords = verification?.aRecords ?? [];
    const records = [txtRecord, ...aRecords].filter((record) => !!record);
    if (records.length === 0) {
        return null;
    }
    return (<div className="grid grid-cols-7 gap-4 rounded-lg border p-4">
            <div className="text-sm font-medium col-span-1">Type</div>
            <div className="text-sm font-medium col-span-3">Host</div>
            <div className="text-sm font-medium col-span-3">Value</div>

            {records.map((record, index) => (<react_1.Fragment key={`${record.type}-${record.name}-${index}`}>
                    <RecordField value={record.type} className="col-span-1" copyable={false}/>
                    <RecordField value={record.name} className="col-span-3"/>
                    <RecordField value={record.value} className="col-span-3"/>
                </react_1.Fragment>))}
        </div>);
});
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
//# sourceMappingURL=record-field.js.map