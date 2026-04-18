"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGitHubAppInstallation = void 0;
const react_1 = require("@/trpc/react");
const react_2 = require("react");
const useGitHubAppInstallation = () => {
    const generateInstallationUrl = react_1.api.github.generateInstallationUrl.useMutation();
    const { data: installationId, refetch: checkInstallation, isFetching: isChecking, error: checkInstallationError } = react_1.api.github.checkGitHubAppInstallation.useQuery(undefined, {
        refetchOnWindowFocus: true,
    });
    const [error, setError] = (0, react_2.useState)(null);
    const hasInstallation = !!installationId;
    (0, react_2.useEffect)(() => {
        setError(checkInstallationError?.message || null);
    }, [checkInstallationError]);
    const clearError = () => {
        setError(null);
    };
    const redirectToInstallation = async (redirectUrl) => {
        try {
            const finalRedirectUrl = redirectUrl;
            const result = await generateInstallationUrl.mutateAsync({
                redirectUrl: finalRedirectUrl,
            });
            if (result?.url) {
                window.open(result.url, '_blank');
            }
        }
        catch (error) {
            console.error('Error generating GitHub App installation URL:', error);
        }
    };
    return {
        hasInstallation,
        installationId: installationId || null,
        isChecking,
        error,
        redirectToInstallation,
        refetch: checkInstallation,
        clearError,
    };
};
exports.useGitHubAppInstallation = useGitHubAppInstallation;
//# sourceMappingURL=use-installation.js.map