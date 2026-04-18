"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlSection = void 0;
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const input_1 = require("@onlook/ui/input");
const utility_1 = require("@onlook/utility");
const UrlSection = ({ url }) => {
    const openUrl = () => {
        const lintedUrl = (0, utility_1.getValidUrl)(url);
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_EXTERNAL_WINDOW, lintedUrl);
    };
    return (<div className="flex flex-row items-center justify-between gap-2">
            <input_1.Input className="bg-background-secondary w-full" value={url} disabled={true}/>
            <button_1.Button onClick={openUrl} variant="outline" size="icon">
                <index_1.Icons.ExternalLink className="h-4 w-4"/>
            </button_1.Button>
        </div>);
};
exports.UrlSection = UrlSection;
//# sourceMappingURL=Url.js.map