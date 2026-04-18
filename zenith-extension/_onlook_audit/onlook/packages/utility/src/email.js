"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFreeEmail = void 0;
const free_email_domains_1 = __importDefault(require("free-email-domains"));
const isFreeEmail = (email) => {
    const domain = email.split('@').at(-1);
    return free_email_domains_1.default.includes(domain ?? '');
};
exports.isFreeEmail = isFreeEmail;
//# sourceMappingURL=email.js.map