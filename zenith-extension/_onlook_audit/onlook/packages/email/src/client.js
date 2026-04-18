"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResendClient = void 0;
const resend_1 = require("resend");
const getResendClient = ({ apiKey }) => {
    return new resend_1.Resend(apiKey);
};
exports.getResendClient = getResendClient;
//# sourceMappingURL=client.js.map