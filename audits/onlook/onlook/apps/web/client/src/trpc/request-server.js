"use strict";
"use server";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = exports.createTRPCContext = void 0;
const request_server_1 = require("@/utils/supabase/request-server");
const client_1 = require("@onlook/db/src/client");
const rsc_1 = require("@trpc/react-query/rsc");
const server_1 = require("@trpc/server");
const react_1 = require("react");
const root_1 = require("~/server/api/root");
const query_client_1 = require("./query-client");
const createTRPCContext = async (req, opts) => {
    const supabase = await (0, request_server_1.createClient)(req);
    const { data: { user }, error, } = await supabase.auth.getUser();
    if (error) {
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: error.message });
    }
    return {
        db: client_1.db,
        supabase,
        user,
        ...opts,
    };
};
exports.createTRPCContext = createTRPCContext;
const createContext = async (req) => {
    return (0, exports.createTRPCContext)(req, { headers: req.headers });
};
const getQueryClient = (0, react_1.cache)(query_client_1.createQueryClient);
/**
 * Used for API routes without using next headers lib
 */
const createClient = async (req) => {
    const context = await createContext(req);
    const caller = (0, root_1.createCaller)(context);
    const { trpc: api, HydrateClient } = (0, rsc_1.createHydrationHelpers)(caller, getQueryClient);
    return { api, HydrateClient };
};
exports.createClient = createClient;
//# sourceMappingURL=request-server.js.map