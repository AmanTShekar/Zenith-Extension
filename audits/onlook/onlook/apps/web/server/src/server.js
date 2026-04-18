"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const websocket_1 = __importDefault(require("@fastify/websocket"));
const fastify_1 = require("@trpc/server/adapters/fastify");
const fastify_2 = __importDefault(require("fastify"));
const router_1 = require("./router");
const context_1 = require("./router/context");
function createServer(opts) {
    const dev = opts.dev ?? true;
    const port = opts.port ?? 8080;
    const trpcPrefix = opts.prefix ?? '/api/trpc';
    const server = (0, fastify_2.default)({ logger: dev });
    server.register(websocket_1.default);
    server.register(fastify_1.fastifyTRPCPlugin, {
        prefix: trpcPrefix,
        useWSS: true,
        trpcOptions: { router: router_1.appRouter, createContext: context_1.createContext },
    });
    server.get('/', async () => {
        return { hello: 'onlook' };
    });
    const stop = async () => {
        await server.close();
    };
    const start = async () => {
        try {
            await server.listen({ port });
            console.log('listening on port', port);
        }
        catch (err) {
            server.log.error(err);
            process.exit(1);
        }
    };
    return { server, start, stop };
}
//# sourceMappingURL=server.js.map