"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoCustomDomain = void 0;
const button_1 = require("@onlook/ui/button");
const provider_1 = require("./provider");
const NoCustomDomain = () => {
    const { openCustomDomain } = (0, provider_1.useCustomDomainContext)();
    return (<>
            <div className="flex items-center w-full">
                <h3 className="">Custom Domain</h3>
                <span className="ml-auto rounded-full bg-blue-400 text-white px-1.5 py-0.5 text-xs">
                    PRO
                </span>
            </div>

            <button_1.Button onClick={openCustomDomain} className="w-full rounded-md p-3 bg-blue-600 border-blue border hover:bg-blue-700 text-white">
                Link a Custom Domain
            </button_1.Button>
        </>);
};
exports.NoCustomDomain = NoCustomDomain;
//# sourceMappingURL=no-domain.js.map