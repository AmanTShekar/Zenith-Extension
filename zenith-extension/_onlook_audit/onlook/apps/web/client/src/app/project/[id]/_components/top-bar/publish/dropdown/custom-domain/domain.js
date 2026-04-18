"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainSection = void 0;
const models_1 = require("@onlook/models");
const utility_1 = require("@onlook/utility");
const action_1 = require("./action");
const no_domain_1 = require("./no-domain");
const provider_1 = require("./provider");
const DomainSection = () => {
    const { isPro, customDomain, deployment, isDeploying } = (0, provider_1.useCustomDomainContext)();
    if (!customDomain) {
        return 'Something went wrong';
    }
    if (!isPro) {
        return <no_domain_1.NoCustomDomain />;
    }
    return (<>
            <div className="flex items-center w-full">
                <h3 className="">
                    Custom Domain
                </h3>
                {deployment && deployment?.status === models_1.DeploymentStatus.COMPLETED && (<div className="ml-auto flex items-center gap-2">
                        <p className="text-green-300">Live</p>
                        <p>•</p>
                        <p>Updated {(0, utility_1.timeAgo)(deployment.updatedAt)} ago</p>
                    </div>)}
                {deployment?.status === models_1.DeploymentStatus.FAILED && (<div className="ml-auto flex items-center gap-2">
                        <p className="text-red-500">Error</p>
                    </div>)}
                {deployment?.status === models_1.DeploymentStatus.CANCELLED && (<div className="ml-auto flex items-center gap-2">
                        <p className="text-foreground-secondary">Cancelled</p>
                    </div>)}
                {isDeploying && (<div className="ml-auto flex items-center gap-2">
                        <p className="">Updating • In progress</p>
                    </div>)}
            </div>
            <action_1.ActionSection />
        </>);
};
exports.DomainSection = DomainSection;
//# sourceMappingURL=domain.js.map