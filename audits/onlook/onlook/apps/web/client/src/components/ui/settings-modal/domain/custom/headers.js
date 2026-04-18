"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureHeader = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const use_domain_verification_1 = require("./use-domain-verification");
exports.ConfigureHeader = (0, mobx_react_lite_1.observer)(() => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { verifyVerificationRequest } = (0, use_domain_verification_1.useDomainVerification)();
    async function verifyDomain() {
        setIsLoading(true);
        await verifyVerificationRequest();
        setIsLoading(false);
    }
    return (<div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <p className="text-regularPlus text-muted-foreground">Configure</p>
                    <p className="text-small text-muted-foreground">
                        Your DNS records must be set up with these values.
                    </p>
                </div>
                <button_1.Button variant="secondary" size="sm" className="h-8 px-3 text-sm" onClick={verifyDomain} disabled={isLoading}>
                    {isLoading && (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin mr-2"/>)}
                    Verify Setup
                </button_1.Button>
            </div>
        </div>);
});
//# sourceMappingURL=headers.js.map