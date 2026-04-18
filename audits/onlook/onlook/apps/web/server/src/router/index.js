"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const sandbox_1 = require("./routes/sandbox");
const trpc_1 = require("./trpc");
exports.appRouter = (0, trpc_1.router)({
    sandbox: sandbox_1.sandboxRouter,
});
//# sourceMappingURL=index.js.map