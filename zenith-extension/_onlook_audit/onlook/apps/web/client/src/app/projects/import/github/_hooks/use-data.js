"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGitHubData = void 0;
const client_1 = require("@/trpc/client");
const react_1 = require("react");
const useGitHubData = () => {
    const [organizations, setOrganizations] = (0, react_1.useState)([]);
    const [repositories, setRepositories] = (0, react_1.useState)([]);
    const [isLoadingOrganizations, setIsLoadingOrganizations] = (0, react_1.useState)(false);
    const [isLoadingRepositories, setIsLoadingRepositories] = (0, react_1.useState)(false);
    const [organizationsError, setOrganizationsError] = (0, react_1.useState)(null);
    const [repositoriesError, setRepositoriesError] = (0, react_1.useState)(null);
    const fetchOrganizations = async () => {
        setIsLoadingOrganizations(true);
        setOrganizationsError(null);
        try {
            const organizationsData = await client_1.api.github.getOrganizations.query();
            setOrganizations(organizationsData);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organizations';
            setOrganizationsError(errorMessage);
            console.error('Error fetching organizations:', error);
        }
        finally {
            setIsLoadingOrganizations(false);
        }
    };
    const fetchRepositories = async () => {
        setIsLoadingRepositories(true);
        setRepositoriesError(null);
        try {
            const repositoriesData = await client_1.api.github.getRepositoriesWithApp.query();
            setRepositories(repositoriesData);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repositories';
            setRepositoriesError(errorMessage);
            console.error('Error fetching repositories:', error);
        }
        finally {
            setIsLoadingRepositories(false);
        }
    };
    const clearOrganizationsError = () => {
        setOrganizationsError(null);
    };
    const clearRepositoriesError = () => {
        setRepositoriesError(null);
    };
    const clearErrors = () => {
        setOrganizationsError(null);
        setRepositoriesError(null);
    };
    return {
        organizations,
        repositories,
        isLoadingOrganizations,
        isLoadingRepositories,
        organizationsError,
        repositoriesError,
        fetchOrganizations,
        fetchRepositories,
        clearOrganizationsError,
        clearRepositoriesError,
        clearErrors,
    };
};
exports.useGitHubData = useGitHubData;
//# sourceMappingURL=use-data.js.map