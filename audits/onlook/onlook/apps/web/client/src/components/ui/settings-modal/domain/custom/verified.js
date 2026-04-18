"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verified = void 0;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utility_1 = require("@onlook/utility");
const react_1 = require("react");
const use_domain_verification_1 = require("./use-domain-verification");
const Verified = () => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { customDomain, removeVerifiedDomain } = (0, use_domain_verification_1.useDomainVerification)();
    if (!customDomain) {
        return <div>No custom domain found</div>;
    }
    const baseUrl = customDomain.url;
    const lastUpdated = customDomain.publishedAt ? (0, utility_1.timeAgo)(customDomain.publishedAt) : null;
    async function removeDomain() {
        setIsLoading(true);
        await removeVerifiedDomain(baseUrl);
        setIsLoading(false);
    }
    return (<div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
                <div className="w-1/3">
                    <p className="text-small text-muted-foreground">Updated {lastUpdated} ago</p>
                </div>
                <div className="flex gap-2 flex-1">
                    <input_1.Input value={baseUrl ?? ''} readOnly className="bg-muted"/>
                    <div className="flex items-center gap-1">
                        <icons_1.Icons.CheckCircled className="h-4 w-4 text-green-500"/>
                        <span className="text-xs ">Verified</span>
                    </div>
                    <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" size="icon">
                                <icons_1.Icons.DotsVertical className="h-4 w-4"/>
                            </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent align="end">
                            <dropdown_menu_1.DropdownMenuItem onClick={removeDomain} className="hover:bg-destructive/10 focus:bg-destructive/10 text-red-500 cursor-pointer" disabled={isLoading}>
                                {isLoading && (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin mr-2"/>)}
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
//# sourceMappingURL=verified.js.map