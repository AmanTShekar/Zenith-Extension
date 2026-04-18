"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verification = void 0;
const mobx_react_lite_1 = require("mobx-react-lite");
const headers_1 = require("./headers");
const no_domain_input_1 = require("./no-domain-input");
const record_field_1 = require("./record-field");
const use_domain_verification_1 = require("./use-domain-verification");
exports.Verification = (0, mobx_react_lite_1.observer)(() => {
    const { verificationState, error } = (0, use_domain_verification_1.useDomainVerification)();
    return (<div className="space-y-4">
            <no_domain_input_1.NoDomainInput />
            {(verificationState === use_domain_verification_1.VerificationState.VERIFICATION_CREATED || verificationState === use_domain_verification_1.VerificationState.VERIFYING) && (<>
                    <headers_1.ConfigureHeader />
                    <record_field_1.DnsRecords />
                </>)}
            {error && <p className="text-sm text-red-500 whitespace-pre-wrap">{error}</p>}
        </div>);
});
//# sourceMappingURL=verification.js.map