"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
const server_1 = require("@/trpc/server");
const constants_1 = require("@/utils/constants");
const constants_2 = require("@onlook/constants");
const index_1 = require("@onlook/ui/icons/index");
const link_1 = __importDefault(require("next/link"));
async function Layout({ params, children }) {
    const projectId = (await params).id;
    const hasAccess = await server_1.api.project.hasAccess({ projectId });
    if (!hasAccess) {
        return <NoAccess />;
    }
    return <>{children}</>;
}
const NoAccess = () => {
    return (<main className="flex flex-1 flex-col items-center justify-center h-screen w-screen p-4 text-center">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground-primary">Access denied</h1>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground-primary">{`Please contact the project owner to request access.`}</h2>
                    <p className="text-foreground-secondary">
                        {`Please email `}
                        <link_1.default href={`mailto:${constants_2.SUPPORT_EMAIL}`} className="text-primary underline">
                            {constants_2.SUPPORT_EMAIL}
                        </link_1.default>
                        {` if you believe this is an error.`}
                    </p>
                </div>

                <link_1.default className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href={constants_1.Routes.PROJECTS}>
                    <index_1.Icons.ArrowLeft className="h-4 w-4"/>
                    Back to projects
                </link_1.default>
            </div>
        </main>);
};
//# sourceMappingURL=layout.js.map