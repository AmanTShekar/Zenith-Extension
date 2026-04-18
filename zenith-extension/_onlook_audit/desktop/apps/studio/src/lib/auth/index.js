"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthManager = void 0;
const constants_1 = require("@onlook/models/constants");
const clients_1 = __importDefault(require("@onlook/supabase/clients"));
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
class AuthManager {
    authenticated = false;
    userMetadata = null;
    isAuthEnabled = !!clients_1.default && !!clients_1.default.auth;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        this.fetchUserMetadata();
        this.listenForAuthEvents();
    }
    async fetchUserMetadata() {
        this.userMetadata = (await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_USER_METADATA));
        const signedIn = (await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.IS_USER_SIGNED_IN));
        if (this.userMetadata && signedIn) {
            this.authenticated = true;
        }
    }
    listenForAuthEvents() {
        window.api.on(constants_1.MainChannels.USER_SIGNED_IN, async (e, args) => {
            this.authenticated = true;
            this.fetchUserMetadata();
        });
        window.api.on(constants_1.MainChannels.USER_SIGNED_OUT, async (e, args) => {
            this.authenticated = false;
            this.userMetadata = null;
        });
    }
    async signIn(provider) {
        await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SIGN_IN, { provider });
    }
    async signOut() {
        await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.SIGN_OUT);
    }
}
exports.AuthManager = AuthManager;
//# sourceMappingURL=index.js.map