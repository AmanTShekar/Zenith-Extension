"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = Layout;
const constants_1 = require("@/utils/constants");
const server_1 = require("@/utils/supabase/server");
const navigation_1 = require("next/navigation");
const _context_1 = require("./_context");
exports.metadata = {
    title: 'Onlook',
    description: 'Onlook – Import Local Project',
};
async function Layout({ children }) {
    const supabase = await (0, server_1.createClient)();
    const { data: { session }, } = await supabase.auth.getSession();
    if (!session) {
        (0, navigation_1.redirect)(constants_1.Routes.LOGIN);
    }
    return <_context_1.ProjectCreationProvider totalSteps={2}>{children} </_context_1.ProjectCreationProvider>;
}
//# sourceMappingURL=layout.js.map