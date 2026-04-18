"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForHostingMessages = listenForHostingMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const hosting_1 = __importDefault(require("../hosting"));
const domains_1 = require("../hosting/domains");
function listenForHostingMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.PUBLISH_TO_DOMAIN, async (_e, args) => {
        return await hosting_1.default.publish(args);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.UNPUBLISH_DOMAIN, async (e, args) => {
        const { urls } = args;
        return await hosting_1.default.unpublish(urls);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.CREATE_DOMAIN_VERIFICATION, async (_e, args) => {
        const { domain } = args;
        return await (0, domains_1.createDomainVerification)(domain);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.VERIFY_DOMAIN, async (_e, args) => {
        const { domain } = args;
        return await (0, domains_1.verifyDomain)(domain);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_OWNED_DOMAINS, async (_e) => {
        return await (0, domains_1.getOwnedDomains)();
    });
}
//# sourceMappingURL=hosting.js.map