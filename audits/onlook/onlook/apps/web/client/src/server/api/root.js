"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCaller = exports.appRouter = void 0;
const trpc_1 = require("~/server/api/trpc");
const routers_1 = require("./routers");
const branch_1 = require("./routers/project/branch");
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
exports.appRouter = (0, trpc_1.createTRPCRouter)({
    sandbox: routers_1.sandboxRouter,
    user: routers_1.userRouter,
    invitation: routers_1.invitationRouter,
    project: routers_1.projectRouter,
    branch: branch_1.branchRouter,
    settings: routers_1.settingsRouter,
    chat: routers_1.chatRouter,
    frame: routers_1.frameRouter,
    userCanvas: routers_1.userCanvasRouter,
    utils: routers_1.utilsRouter,
    member: routers_1.memberRouter,
    domain: routers_1.domainRouter,
    github: routers_1.githubRouter,
    subscription: routers_1.subscriptionRouter,
    usage: routers_1.usageRouter,
    publish: routers_1.publishRouter,
});
/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
exports.createCaller = (0, trpc_1.createCallerFactory)(exports.appRouter);
//# sourceMappingURL=root.js.map