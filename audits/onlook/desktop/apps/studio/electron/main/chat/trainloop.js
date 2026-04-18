"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@onlook/models/constants");
const sdk_1 = require("@trainloop/sdk");
const auth_1 = require("../auth");
class TrainLoopManager {
    static instance;
    constructor() { }
    async getClient() {
        const proxyUrl = `${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_PROXY_ROUTE}${constants_1.ProxyRoutes.TRAINLOOP}`;
        const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
        if (!authTokens) {
            throw new Error('No auth tokens found');
        }
        return new sdk_1.Client(authTokens.accessToken, proxyUrl);
    }
    static getInstance() {
        if (!TrainLoopManager.instance) {
            TrainLoopManager.instance = new TrainLoopManager();
        }
        return TrainLoopManager.instance;
    }
    async saveApplyResult(messages, type) {
        const client = await this.getClient();
        await client.sendData(messages, type, 'onlook-apply-set');
    }
}
exports.default = TrainLoopManager.getInstance();
//# sourceMappingURL=trainloop.js.map