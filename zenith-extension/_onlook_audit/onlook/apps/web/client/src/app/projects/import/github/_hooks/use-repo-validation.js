"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRepositoryValidation = void 0;
const react_1 = require("@/trpc/react");
const react_2 = require("react");
const useRepositoryValidation = () => {
    const [isValidating, setIsValidating] = (0, react_2.useState)(false);
    const [error, setError] = (0, react_2.useState)(null);
    const validateRepo = react_1.api.github.validate.useMutation();
    const validateRepository = async (owner, repo) => {
        setIsValidating(true);
        setError(null);
        try {
            const result = await validateRepo.mutateAsync({ owner, repo });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to validate repository';
            setError(errorMessage);
            console.error('Error validating repository:', error);
            return null;
        }
        finally {
            setIsValidating(false);
        }
    };
    const clearError = () => {
        setError(null);
    };
    return {
        isValidating,
        error,
        validateRepository,
        clearError,
    };
};
exports.useRepositoryValidation = useRepositoryValidation;
//# sourceMappingURL=use-repo-validation.js.map