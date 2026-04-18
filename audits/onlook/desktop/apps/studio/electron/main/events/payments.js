"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForPaymentMessages = listenForPaymentMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const payment_1 = require("../payment");
function listenForPaymentMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.CREATE_STRIPE_CHECKOUT, async (e, args) => {
        return await (0, payment_1.checkoutWithStripe)();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.MANAGE_SUBSCRIPTION, async (e, args) => {
        return await (0, payment_1.manageSubscription)();
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.CHECK_SUBSCRIPTION, async (e, args) => {
        return await (0, payment_1.checkSubscription)();
    });
}
//# sourceMappingURL=payments.js.map