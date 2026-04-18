"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
exports.TRPCReactProvider = TRPCReactProvider;
const react_query_1 = require("@tanstack/react-query");
const react_query_2 = require("@trpc/react-query");
const react_1 = require("react");
const helpers_1 = require("./helpers");
const query_client_1 = require("./query-client");
let clientQueryClientSingleton = undefined;
const getQueryClient = () => {
    if (typeof window === 'undefined') {
        // Server: always make a new query client
        return (0, query_client_1.createQueryClient)();
    }
    // Browser: use singleton pattern to keep the same query client
    clientQueryClientSingleton ??= (0, query_client_1.createQueryClient)();
    return clientQueryClientSingleton;
};
exports.api = (0, react_query_2.createTRPCReact)();
function TRPCReactProvider(props) {
    const queryClient = getQueryClient();
    const [trpcClient] = (0, react_1.useState)(() => exports.api.createClient({
        links: helpers_1.links,
    }));
    return (<react_query_1.QueryClientProvider client={queryClient}>
            <exports.api.Provider client={trpcClient} queryClient={queryClient}>
                {props.children}
            </exports.api.Provider>
        </react_query_1.QueryClientProvider>);
}
//# sourceMappingURL=react.js.map