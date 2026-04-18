"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Section = exports.CustomDomainSection = void 0;
const mobx_react_lite_1 = require("mobx-react-lite");
const domain_1 = require("./domain");
const no_domain_1 = require("./no-domain");
const provider_1 = require("./provider");
exports.CustomDomainSection = (0, mobx_react_lite_1.observer)(() => {
    return (<provider_1.CustomDomainProvider>
            <exports.Section />
        </provider_1.CustomDomainProvider>);
});
const Section = () => {
    const { customDomain } = (0, provider_1.useCustomDomainContext)();
    return (<div className="p-4 flex flex-col items-center gap-2">
            {customDomain?.url
            ? <domain_1.DomainSection />
            : <no_domain_1.NoCustomDomain />}
        </div>);
};
exports.Section = Section;
//# sourceMappingURL=index.js.map