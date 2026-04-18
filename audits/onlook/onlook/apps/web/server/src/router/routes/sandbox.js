"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sandboxRouter = void 0;
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
exports.sandboxRouter = (0, trpc_1.router)({
    create: trpc_1.publicProcedure
        .input(zod_1.z.string())
        .mutation(({ input }) => {
        return `hi ${input}`;
    }),
    start: trpc_1.publicProcedure
        .input(zod_1.z.string())
        .mutation(({ input }) => {
        return `hi ${input}`;
    }),
    stop: trpc_1.publicProcedure
        .input(zod_1.z.string())
        .mutation(({ input }) => {
        return {
            success: true,
            message: `Sandbox ${input} stopped`,
            timestamp: new Date().toISOString(),
        };
    }),
    status: trpc_1.publicProcedure
        .input(zod_1.z.string())
        .query(({ input }) => {
        return {
            id: input,
            status: 'running',
            details: { cpu: '5%', memory: '120MB' },
            uptime: 1200,
        };
    }),
});
//# sourceMappingURL=sandbox.js.map