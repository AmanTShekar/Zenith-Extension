"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlSection = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const sonner_1 = require("@onlook/ui/sonner");
const utility_1 = require("@onlook/utility");
const link_1 = __importDefault(require("next/link"));
const react_1 = require("react");
const UrlSection = ({ url, isCopyable }) => {
    const [isCopied, setIsCopied] = (0, react_1.useState)(false);
    const validUrl = (0, utility_1.getValidUrl)(url);
    const copyUrl = () => {
        navigator.clipboard.writeText(validUrl);
        sonner_1.toast.success('Copied to clipboard');
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    };
    return (<div className="flex flex-row items-center justify-between gap-2">
            <input_1.Input className="bg-background-secondary w-full text-xs" value={url} readOnly/>
            {isCopyable ? (<button_1.Button onClick={copyUrl} variant="outline" size="icon">
                    {isCopied ? <icons_1.Icons.Check className="h-4 w-4"/> : <icons_1.Icons.Copy className="h-4 w-4"/>}
                </button_1.Button>) : (<link_1.default href={validUrl} target="_blank" className="text-sm">
                    <button_1.Button variant="outline" size="icon">
                        <icons_1.Icons.ExternalLink className="h-4 w-4"/>
                    </button_1.Button>
                </link_1.default>)}
        </div>);
};
exports.UrlSection = UrlSection;
//# sourceMappingURL=url.js.map