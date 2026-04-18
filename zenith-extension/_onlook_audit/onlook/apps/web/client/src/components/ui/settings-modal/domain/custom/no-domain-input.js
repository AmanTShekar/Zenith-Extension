"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExistingDomains = exports.NoDomainInput = void 0;
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const react_1 = require("react");
const use_domain_verification_1 = require("./use-domain-verification");
const NoDomainInput = () => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { domainInput, setDomainInput, customDomain, verification, verificationState, ownedDomains, createVerificationRequest, removeVerificationRequest } = (0, use_domain_verification_1.useDomainVerification)();
    function getInputButtonText() {
        switch (verificationState) {
            case use_domain_verification_1.VerificationState.INPUTTING_DOMAIN:
                return 'Setup';
            case use_domain_verification_1.VerificationState.VERIFYING:
                return 'Loading...';
            default:
                return 'Edit';
        }
    }
    const handleEnter = async () => {
        setIsLoading(true);
        await createVerificationRequest();
        setIsLoading(false);
    };
    const handleButtonClick = async () => {
        setIsLoading(true);
        if (verificationState === use_domain_verification_1.VerificationState.INPUTTING_DOMAIN) {
            await createVerificationRequest();
        }
        else {
            await removeVerificationRequest();
        }
        setIsLoading(false);
    };
    return (<div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
                <div className="w-1/3">
                    <p className="text-regularPlus text-muted-foreground">Custom URL</p>
                    <p className="text-small text-muted-foreground">
                        {`Input your domain  ${verificationState === use_domain_verification_1.VerificationState.INPUTTING_DOMAIN && ownedDomains.length > 0
            ? 'or use previous'
            : ''}`}
                    </p>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                    <div className="flex gap-2">
                        <input_1.Input disabled={verificationState !== use_domain_verification_1.VerificationState.INPUTTING_DOMAIN} value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="example.com" className="bg-background placeholder:text-muted-foreground" onKeyDown={async (e) => {
            if (e.key === 'Enter') {
                handleEnter();
            }
        }}/>
                        <button_1.Button onClick={handleButtonClick} variant="secondary" size="sm" className="h-9 text-smallPlus" disabled={isLoading}>
                            {isLoading && (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin mr-2"/>)}
                            {getInputButtonText()}
                        </button_1.Button>
                    </div>
                    <exports.ExistingDomains />
                </div>
            </div>
        </div>);
};
exports.NoDomainInput = NoDomainInput;
const ExistingDomains = () => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { ownedDomains, verificationState, reuseDomain } = (0, use_domain_verification_1.useDomainVerification)();
    if (ownedDomains.length === 0 || verificationState !== use_domain_verification_1.VerificationState.INPUTTING_DOMAIN) {
        return null;
    }
    const addExistingDomain = async (url) => {
        setIsLoading(true);
        await reuseDomain(url);
        setIsLoading(false);
    };
    return (<div className="flex flex-col gap-2 flex-1">
            {ownedDomains.length > 0 && (<p className="text-small text-muted-foreground">
                    You previously used these domains:
                </p>)}
            {ownedDomains.map((domain) => (<div key={domain} className="flex items-center text-small text-muted-foreground">
                    <p>{domain}</p>
                    <button_1.Button variant="outline" size="sm" className="ml-auto" onClick={() => {
                addExistingDomain(domain);
            }} disabled={isLoading}>
                        {isLoading && (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin mr-2"/>)}
                        Reuse Domain
                    </button_1.Button>
                </div>))}
        </div>);
};
exports.ExistingDomains = ExistingDomains;
//# sourceMappingURL=no-domain-input.js.map