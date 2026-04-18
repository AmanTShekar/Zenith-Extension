"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRepositoryImport = void 0;
const client_1 = require("@/trpc/client");
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const navigation_1 = require("next/navigation");
const react_2 = require("react");
const useRepositoryImport = () => {
    const router = (0, navigation_1.useRouter)();
    const [isImporting, setIsImporting] = (0, react_2.useState)(false);
    const [error, setError] = (0, react_2.useState)(null);
    const { data: user } = react_1.api.user.get.useQuery();
    const importRepository = async (selectedRepo) => {
        if (!user?.id) {
            setError('No user found');
            return;
        }
        if (!selectedRepo) {
            setError('No repository selected');
            return;
        }
        setIsImporting(true);
        setError(null);
        try {
            const { sandboxId, previewUrl } = await client_1.api.sandbox.createFromGitHub.mutate({
                repoUrl: selectedRepo.clone_url,
                branch: selectedRepo.default_branch,
            });
            const project = await client_1.api.project.create.mutate({
                project: {
                    name: selectedRepo.name ?? 'New project',
                    description: selectedRepo.description || 'Imported from GitHub',
                },
                userId: user.id,
                sandboxId,
                sandboxUrl: previewUrl,
            });
            if (!project) {
                throw new Error('Failed to create project');
            }
            router.push(`${constants_1.Routes.PROJECT}/${project.id}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import repository';
            setError(errorMessage);
            console.error('Error importing repository:', error);
        }
        finally {
            setIsImporting(false);
        }
    };
    const clearError = () => {
        setError(null);
    };
    return {
        isImporting,
        error,
        importRepository,
        clearError,
    };
};
exports.useRepositoryImport = useRepositoryImport;
//# sourceMappingURL=use-repo-import.js.map