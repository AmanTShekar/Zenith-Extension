"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const client_1 = require("@trpc/client");
const helpers_1 = require("./helpers");
exports.api = (0, client_1.createTRPCClient)({
    links: helpers_1.links,
});
//# sourceMappingURL=client.js.map