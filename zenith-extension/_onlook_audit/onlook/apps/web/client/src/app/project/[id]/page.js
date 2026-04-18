"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;
const server_1 = require("@/trpc/server");
const main_1 = require("./_components/main");
const providers_1 = require("./providers");
async function Page({ params }) {
    const projectId = (await params).id;
    if (!projectId) {
        return <div>Invalid project ID</div>;
    }
    try {
        // Fetch required project data before initializing providers
        const [project, branches] = await Promise.all([
            server_1.api.project.get({ projectId }),
            server_1.api.branch.getByProjectId({ projectId }),
        ]);
        if (!project) {
            return <div>Project not found</div>;
        }
        return (<providers_1.ProjectProviders project={project} branches={branches}>
                <main_1.Main />
            </providers_1.ProjectProviders>);
    }
    catch (error) {
        console.error('Failed to load project data:', error);
        return (<div className="h-screen w-screen flex items-center justify-center">
                <div>Failed to load project: {error instanceof Error ? error.message : 'Unknown error'}</div>
            </div>);
    }
}
//# sourceMappingURL=page.js.map