"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useImportGithubProject = exports.ImportGithubProjectProvider = void 0;
const constants_1 = require("@/utils/constants");
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const _hooks_1 = require("../_hooks");
const ImportGithubProjectProvider = ({ children, totalSteps = 1, }) => {
    const router = (0, navigation_1.useRouter)();
    // Step management
    const [currentStep, setCurrentStep] = (0, react_1.useState)(0);
    // Repository data
    const [repoUrl, setRepoUrl] = (0, react_1.useState)('');
    const [branch, setBranch] = (0, react_1.useState)('');
    const [selectedRepo, setSelectedRepo] = (0, react_1.useState)(null);
    const [selectedOrg, setSelectedOrg] = (0, react_1.useState)(null);
    // Hook instances
    const installation = (0, _hooks_1.useGitHubAppInstallation)();
    const githubData = (0, _hooks_1.useGitHubData)();
    const repositoryImport = (0, _hooks_1.useRepositoryImport)();
    const repositoryValidation = (0, _hooks_1.useRepositoryValidation)();
    (0, react_1.useEffect)(() => {
        installation.refetch();
    }, []);
    (0, react_1.useEffect)(() => {
        if (installation.hasInstallation) {
            githubData.fetchOrganizations();
            githubData.fetchRepositories();
        }
    }, [installation.hasInstallation]);
    const nextStep = async () => {
        if (currentStep === 0 && !installation.hasInstallation) {
            installation.redirectToInstallation();
            return;
        }
        if (currentStep === 1) {
            setCurrentStep(2);
            if (selectedRepo) {
                await repositoryImport.importRepository(selectedRepo);
            }
        }
        else if (currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };
    const prevStep = () => {
        if (currentStep === 0) {
            router.push(constants_1.Routes.IMPORT_PROJECT);
            return;
        }
        setCurrentStep((prev) => prev - 1);
    };
    const validateRepository = async (owner, repo) => {
        const result = await repositoryValidation.validateRepository(owner, repo);
        if (result) {
            setBranch(result.branch);
        }
        return result;
    };
    const clearErrors = () => {
        installation.clearError();
        githubData.clearErrors();
        repositoryImport.clearError();
        repositoryValidation.clearError();
    };
    const clearData = () => {
        setSelectedRepo(null);
        setSelectedOrg(null);
        setRepoUrl('');
        setBranch('');
    };
    const retry = () => {
        setCurrentStep(1);
    };
    const cancel = () => {
        clearData();
        setCurrentStep(1);
    };
    const contextValue = {
        // Step management
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
        // Repository data
        repoUrl,
        setRepoUrl,
        branch,
        setBranch,
        selectedRepo,
        setSelectedRepo,
        selectedOrg,
        setSelectedOrg,
        // Hook instances (exposed directly)
        installation,
        githubData,
        repositoryImport,
        repositoryValidation,
        // Utility functions
        validateRepository,
        clearErrors,
        retry,
        cancel,
    };
    return (<ImportGithubProjectContext.Provider value={contextValue}>
            {children}
        </ImportGithubProjectContext.Provider>);
};
exports.ImportGithubProjectProvider = ImportGithubProjectProvider;
const ImportGithubProjectContext = (0, react_1.createContext)(null);
const useImportGithubProject = () => {
    const context = (0, react_1.useContext)(ImportGithubProjectContext);
    if (!context) {
        throw new Error('useImportGithubProject must be used within ImportGithubProjectProvider');
    }
    return context;
};
exports.useImportGithubProject = useImportGithubProject;
//# sourceMappingURL=index.js.map