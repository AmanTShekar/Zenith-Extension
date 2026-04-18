"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forkBuildSandbox = forkBuildSandbox;
const code_provider_1 = require("@onlook/code-provider");
async function forkBuildSandbox(sandboxId, userId, deploymentId) {
    const CodesandboxProvider = await (0, code_provider_1.getStaticCodeProvider)(code_provider_1.CodeProvider.CodeSandbox);
    const project = await CodesandboxProvider.createProject({
        source: 'template',
        id: sandboxId,
        title: 'Deployment Fork of ' + sandboxId,
        description: 'Forked sandbox for deployment',
        tags: ['deployment', 'preview', userId, deploymentId],
    });
    const forkedProvider = await (0, code_provider_1.createCodeProviderClient)(code_provider_1.CodeProvider.CodeSandbox, {
        providerOptions: {
            codesandbox: {
                sandboxId: project.id,
                userId,
                initClient: true,
            },
        },
    });
    return {
        provider: forkedProvider,
        sandboxId: project.id,
    };
}
//# sourceMappingURL=fork.js.map