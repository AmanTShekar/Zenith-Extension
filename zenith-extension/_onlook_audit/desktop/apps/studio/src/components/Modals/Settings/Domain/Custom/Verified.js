"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verified = void 0;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utility_1 = require("@onlook/utility");
const Verified = () => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const domainsManager = projectsManager.domains;
    const customDomain = projectsManager.project?.domains?.custom;
    const lastUpdated = customDomain?.publishedAt ? (0, utility_1.timeAgo)(customDomain.publishedAt) : null;
    const baseUrl = customDomain?.url;
    function removeDomain() {
        if (!domainsManager) {
            console.error('No domains manager found');
            return;
        }
        domainsManager.removeCustomDomainFromProject();
    }
    return (<div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
                <div className="w-1/3">
                    <p className="text-regularPlus text-muted-foreground">Custom URL</p>
                    <p className="text-small text-muted-foreground">Updated {lastUpdated} ago</p>
                </div>
                <div className="flex gap-2 flex-1">
                    <input_1.Input value={baseUrl ?? ''} disabled className="bg-muted"/>
                    <div className="flex items-center gap-1">
                        <icons_1.Icons.CheckCircled className="h-4 w-4 text-green-500"/>
                        <span className="text-xs text-muted-foreground">Verified</span>
                    </div>
                    <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" size="icon">
                                <icons_1.Icons.DotsVertical className="h-4 w-4"/>
                            </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                            <dropdown_menu_1.DropdownMenuItem className="hover:bg-muted focus:bg-muted cursor-pointer hidden">
                                <icons_1.Icons.Reset className="mr-2 h-4 w-4"/>
                                Reconfigure DNS
                            </dropdown_menu_1.DropdownMenuItem>
                            <dropdown_menu_1.DropdownMenuItem onClick={removeDomain} className="hover:bg-destructive/10 focus:bg-destructive/10 text-red-500 cursor-pointer">
                                <icons_1.Icons.Trash className="mr-2 h-4 w-4"/>
                                Remove Domain
                            </dropdown_menu_1.DropdownMenuItem>
                        </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                </div>
            </div>
        </div>);
};
exports.Verified = Verified;
//# sourceMappingURL=Verified.js.map