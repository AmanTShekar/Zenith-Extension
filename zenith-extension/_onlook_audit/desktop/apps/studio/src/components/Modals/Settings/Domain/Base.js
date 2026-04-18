"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDomain = void 0;
const Context_1 = require("@/components/Context");
const utils_1 = require("@/lib/utils");
const constants_1 = require("@onlook/models/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
exports.BaseDomain = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    if (!projectsManager.project) {
        return null;
    }
    const baseDomain = projectsManager.project?.domains?.base;
    const lastUpdated = baseDomain?.publishedAt ? (0, utility_1.timeAgo)(baseDomain.publishedAt) : null;
    const baseUrl = baseDomain?.url
        ? `${(0, utility_1.getValidSubdomain)(projectsManager.project.id)}.${constants_1.HOSTING_DOMAIN}`
        : null;
    const openUrl = () => {
        if (!baseUrl) {
            console.error('No URL found');
            return;
        }
        const url = (0, utility_1.getValidUrl)(baseUrl);
        (0, utils_1.invokeMainChannel)(constants_1.MainChannels.OPEN_EXTERNAL_WINDOW, url);
    };
    return (<div className="space-y-4 flex flex-col">
            <h2 className="text-lg">Base Domain</h2>
            <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                    <div className="w-1/3">
                        <p className="text-regularPlus text-muted-foreground">URL</p>
                        <p className="text-small text-muted-foreground">
                            {lastUpdated ? `Updated ${lastUpdated} ago` : 'Not published'}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-1">
                        <input_1.Input value={baseDomain?.url ?? ''} disabled className="bg-muted"/>
                        <button_1.Button onClick={openUrl} variant="ghost" size="icon" className="text-sm">
                            <icons_1.Icons.ExternalLink className="h-4 w-4"/>
                        </button_1.Button>
                    </div>
                </div>
            </div>
        </div>);
});
//# sourceMappingURL=Base.js.map