"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFreestyleSdk = void 0;
const env_1 = require("@/env");
const server_1 = require("@trpc/server");
const freestyle_sandboxes_1 = require("freestyle-sandboxes");
const initializeFreestyleSdk = () => {
    if (!env_1.env.FREESTYLE_API_KEY) {
        throw new server_1.TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'FREESTYLE_API_KEY is not configured. Please set the environment variable to use domain publishing features.',
        });
    }
    return new freestyle_sandboxes_1.FreestyleSandboxes({
        apiKey: env_1.env.FREESTYLE_API_KEY
    });
};
exports.initializeFreestyleSdk = initializeFreestyleSdk;
//# sourceMappingURL=freestyle.js.map