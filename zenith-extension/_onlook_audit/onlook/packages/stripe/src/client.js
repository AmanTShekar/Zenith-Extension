"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeClient = void 0;
const dotenv_1 = require("dotenv");
const stripe_1 = __importDefault(require("stripe"));
(0, dotenv_1.config)({ path: '../.env' });
const createStripeClient = (secretKey) => {
    const apiKey = secretKey || process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        throw new Error('STRIPE_SECRET_KEY is not set');
    }
    return new stripe_1.default(apiKey, { apiVersion: '2025-08-27.basil' });
};
exports.createStripeClient = createStripeClient;
//# sourceMappingURL=client.js.map