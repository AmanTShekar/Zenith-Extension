"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = Layout;
const server_1 = require("@/utils/supabase/server");
const auth_1 = require("./_components/auth");
exports.metadata = {
    title: 'Onlook',
    description: 'Onlook – Invitation',
};
async function Layout({ children }) {
    const supabase = await (0, server_1.createClient)();
    const { data: { session }, } = await supabase.auth.getSession();
    if (!session) {
        return <auth_1.HandleAuth />;
    }
    return (<div className="w-screen h-screen flex flex-col items-center justify-center">
            {children}
        </div>);
}
//# sourceMappingURL=layout.js.map