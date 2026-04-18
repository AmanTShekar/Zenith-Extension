"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorForwardRouter = void 0;
const rpc_1 = require("@onlook/rpc");
const client_1 = require("@trpc/client");
const superjson_1 = __importDefault(require("superjson"));
const zod_1 = require("zod");
const trpc_1 = require("../../trpc");
const { port, prefix } = rpc_1.editorServerConfig;
const urlEnd = `localhost:${port}${prefix}`;
const wsClient = (0, client_1.createWSClient)({ url: `ws://${urlEnd}` });
const editorClient = (0, client_1.createTRPCClient)({
    links: [
        (0, client_1.splitLink)({
            condition(op) {
                return op.type === 'subscription';
            },
            true: (0, client_1.wsLink)({ client: wsClient, transformer: superjson_1.default }),
            false: (0, client_1.httpBatchLink)({
                url: `http://${urlEnd}`,
                transformer: superjson_1.default,
            }),
        }),
    ],
});
// Export the router with all the forwarded procedures
exports.editorForwardRouter = (0, trpc_1.createTRPCRouter)({
    sandbox: (0, trpc_1.createTRPCRouter)({
        create: trpc_1.publicProcedure.input(zod_1.z.string()).mutation(({ input }) => {
            return editorClient.sandbox.create.mutate(input);
        }),
        start: trpc_1.publicProcedure.input(zod_1.z.string()).mutation(({ input }) => {
            return editorClient.sandbox.start.mutate(input);
        }),
        stop: trpc_1.publicProcedure.input(zod_1.z.string()).mutation(({ input }) => {
            return editorClient.sandbox.stop.mutate(input);
        }),
        status: trpc_1.publicProcedure.input(zod_1.z.string()).query(({ input }) => {
            return editorClient.sandbox.status.query(input);
        }),
    }),
});
//# sourceMappingURL=editor.js.map