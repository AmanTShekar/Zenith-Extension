"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreestyleAdapter = void 0;
const freestyle_1 = require("../freestyle");
class FreestyleAdapter {
    async deploy(request) {
        const sdk = (0, freestyle_1.initializeFreestyleSdk)();
        const res = await sdk.deployWeb({
            files: request.files,
            kind: 'files',
        }, request.config);
        const freestyleResponse = res;
        if (freestyleResponse.error) {
            throw new Error(freestyleResponse.error.message ||
                freestyleResponse.message ||
                'Unknown error');
        }
        return {
            deploymentId: freestyleResponse.data?.deploymentId ?? '',
            success: true
        };
    }
}
exports.FreestyleAdapter = FreestyleAdapter;
//# sourceMappingURL=freestyle.js.map