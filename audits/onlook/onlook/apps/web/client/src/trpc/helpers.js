"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.links = void 0;
exports.getBaseUrl = getBaseUrl;
const client_1 = require("@trpc/client");
const superjson_1 = __importDefault(require("superjson"));
function getBaseUrl() {
    if (typeof window !== 'undefined')
        return window.location.origin;
    if (process.env.VERCEL_URL)
        return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT ?? 3000}`;
}
exports.links = [
    (0, client_1.loggerLink)({
        enabled: (op) => process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
    }),
    (0, client_1.httpBatchStreamLink)({
        transformer: superjson_1.default,
        url: getBaseUrl() + '/api/trpc',
        headers: () => {
            const headers = new Headers();
            headers.set('x-trpc-source', 'vanilla-client');
            return headers;
        },
    }),
];
//# sourceMappingURL=helpers.js.map