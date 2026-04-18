"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainTab = void 0;
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const custom_1 = require("./custom");
const danger_zone_1 = require("./danger-zone");
const preview_1 = require("./preview");
exports.DomainTab = (0, mobx_react_lite_1.observer)(() => {
    return (<div className="flex flex-col gap-2">
            <div className="p-6">
                <preview_1.PreviewDomain />
            </div>
            <separator_1.Separator />
            <div className="p-6">
                <custom_1.CustomDomain />
            </div>
            <separator_1.Separator />
            <div className="p-6">
                <danger_zone_1.DangerZone />
            </div>
        </div>);
});
exports.default = exports.DomainTab;
//# sourceMappingURL=index.js.map