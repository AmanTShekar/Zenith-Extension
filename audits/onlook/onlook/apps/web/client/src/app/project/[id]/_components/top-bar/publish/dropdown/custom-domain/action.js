"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionSection = void 0;
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const utils_1 = require("@onlook/ui/utils");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const url_1 = require("../url");
const provider_1 = require("./provider");
const ActionSection = () => {
    const { customDomain, deployment, publish, retry, isDeploying, isLoading } = (0, provider_1.useCustomDomainContext)();
    const failedOrCancelled = deployment?.status === models_1.DeploymentStatus.FAILED || deployment?.status === models_1.DeploymentStatus.CANCELLED;
    if (!customDomain) {
        return 'Something went wrong';
    }
    return (<div className="w-full flex flex-col gap-2">
            <url_1.UrlSection url={customDomain.url} isCopyable={false}/>
            {!failedOrCancelled && (<button_1.Button onClick={publish} variant="outline" className={(0, utils_1.cn)('w-full rounded-md p-3', !customDomain.publishedAt &&
                'bg-blue-400 hover:bg-blue-500 text-white')} disabled={isDeploying || isLoading}>
                    {isLoading && <index_1.Icons.LoadingSpinner className="w-4 h-4 mr-2 animate-spin"/>}
                    {deployment?.updatedAt ? 'Update' : `Publish to ${customDomain.url}`}
                </button_1.Button>)}
            {failedOrCancelled && (<div className="w-full flex flex-col gap-2">
                    {deployment?.error && <p className="text-red-500 max-h-20 overflow-y-auto">{(0, strip_ansi_1.default)(deployment?.error)}</p>}
                    <button_1.Button variant="outline" className="w-full rounded-md p-3" onClick={retry}>
                        Try Updating Again
                    </button_1.Button>
                </div>)}
        </div>);
};
exports.ActionSection = ActionSection;
//# sourceMappingURL=action.js.map