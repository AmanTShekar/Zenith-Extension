"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToSandbox = exports.useProjectCreation = exports.ProjectCreationProvider = void 0;
exports.detectPortFromPackageJson = detectPortFromPackageJson;
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const code_provider_1 = require("@onlook/code-provider");
const constants_1 = require("@onlook/constants");
const models_1 = require("@onlook/models");
const utility_1 = require("@onlook/utility");
const types_1 = require("@/app/projects/types");
const react_2 = require("@/trpc/react");
const constants_2 = require("@/utils/constants");
const ProjectCreationContext = (0, react_1.createContext)(undefined);
function detectPortFromPackageJson(packageJsonFile) {
    const defaultPort = 3000;
    if (!packageJsonFile ||
        typeof packageJsonFile.content !== 'string' ||
        packageJsonFile.type !== types_1.ProcessedFileType.TEXT) {
        return defaultPort;
    }
    try {
        const pkg = JSON.parse(packageJsonFile.content);
        const scripts = pkg.scripts;
        const devScript = scripts?.dev;
        if (!devScript || typeof devScript !== 'string') {
            return defaultPort;
        }
        const portRegex = /(?:PORT=|--port[=\s]|-p\s*?)(\d+)/;
        const portMatch = portRegex.exec(devScript);
        if (portMatch?.[1]) {
            const port = parseInt(portMatch[1], 10);
            if (port > 0 && port <= 65535) {
                return port;
            }
        }
        return defaultPort;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Failed to parse package.json for port detection:', errorMessage);
        return defaultPort;
    }
}
const ProjectCreationProvider = ({ children, totalSteps }) => {
    const router = (0, navigation_1.useRouter)();
    const [currentStep, setCurrentStep] = (0, react_1.useState)(0);
    const [projectData, setProjectDataState] = (0, react_1.useState)({
        name: '',
        folderPath: '',
        files: [],
    });
    const [error, setError] = (0, react_1.useState)(null);
    const [direction, setDirection] = (0, react_1.useState)(0);
    const [isFinalizing, setIsFinalizing] = (0, react_1.useState)(false);
    const { data: user } = react_2.api.user.get.useQuery();
    const { mutateAsync: createProject } = react_2.api.project.create.useMutation();
    const { mutateAsync: forkSandbox } = react_2.api.sandbox.fork.useMutation();
    const { mutateAsync: startSandbox } = react_2.api.sandbox.start.useMutation();
    const setProjectData = (newData) => {
        setProjectDataState((prevData) => ({ ...prevData, ...newData }));
    };
    const finalizeProject = async () => {
        try {
            setIsFinalizing(true);
            if (!user?.id) {
                console.error('No user found');
                return;
            }
            if (!projectData.files) {
                return;
            }
            const packageJsonFile = projectData.files.find((f) => f.path.endsWith('package.json') && f.type === types_1.ProcessedFileType.TEXT);
            const template = constants_1.SandboxTemplates[constants_1.Templates.BLANK];
            const forkedSandbox = await forkSandbox({
                sandbox: {
                    id: template.id,
                    port: detectPortFromPackageJson(packageJsonFile),
                },
                config: {
                    title: `Imported project - ${user.id}`,
                    tags: ['imported', 'local', user.id],
                },
            });
            const provider = await (0, code_provider_1.createCodeProviderClient)(code_provider_1.CodeProvider.CodeSandbox, {
                providerOptions: {
                    codesandbox: {
                        sandboxId: forkedSandbox.sandboxId,
                        userId: user.id,
                        initClient: true,
                        keepActiveWhileConnected: false,
                        getSession: async (sandboxId) => {
                            return startSandbox({ sandboxId });
                        },
                    },
                },
            });
            await (0, exports.uploadToSandbox)(projectData.files, provider);
            await provider.setup({});
            await provider.destroy();
            const project = await createProject({
                project: {
                    name: projectData.name ?? 'New project',
                    description: 'Your new project',
                },
                sandboxId: forkedSandbox.sandboxId,
                sandboxUrl: forkedSandbox.previewUrl,
                userId: user.id,
            });
            if (!project) {
                console.error('Failed to create project');
                return;
            }
            // Open the project
            router.push(`${constants_2.Routes.PROJECT}/${project.id}`);
        }
        catch (error) {
            console.error('Error creating project:', error);
            setError('Failed to create project');
            return;
        }
        finally {
            setIsFinalizing(false);
        }
    };
    const validateNextJsProject = async (files) => {
        const packageJsonFile = files.find((f) => f.path.endsWith('package.json') && f.type === types_1.ProcessedFileType.TEXT);
        if (typeof packageJsonFile?.content !== 'string') {
            return { isValid: false, error: 'Package.json is not a text file' };
        }
        try {
            const packageJson = JSON.parse(packageJsonFile.content);
            const dependencies = packageJson.dependencies;
            const devDependencies = packageJson.devDependencies;
            const hasNext = dependencies?.next ?? devDependencies?.next;
            if (!hasNext) {
                return { isValid: false, error: 'Next.js not found in dependencies' };
            }
            const hasReact = dependencies?.react ?? devDependencies?.react;
            if (!hasReact) {
                return { isValid: false, error: 'React not found in dependencies' };
            }
            let routerType = models_1.RouterType.PAGES;
            const hasAppLayout = files.some((f) => (0, utility_1.isTargetFile)(f.path, {
                fileName: 'layout',
                targetExtensions: constants_1.NEXT_JS_FILE_EXTENSIONS,
                potentialPaths: ['app', 'src/app'],
            }));
            if (hasAppLayout) {
                routerType = models_1.RouterType.APP;
            }
            else {
                // Check for Pages Router (pages directory)
                const hasPagesDir = files.some((f) => f.path.includes('pages/') || f.path.includes('src/pages/'));
                if (!hasPagesDir) {
                    return {
                        isValid: false,
                        error: 'No valid Next.js router structure found (missing app/ or pages/ directory)',
                    };
                }
            }
            return { isValid: true, routerType };
        }
        catch (error) {
            return { isValid: false, error: 'Invalid package.json format' };
        }
    };
    const nextStep = () => {
        if (currentStep < totalSteps - 2) {
            // -2 because we have 2 final steps
            setDirection(1);
            setCurrentStep((prev) => prev + 1);
        }
        else {
            // This is the final step, so we should finalize the project
            setCurrentStep((prev) => prev + 1);
            void finalizeProject();
        }
    };
    const prevStep = () => {
        if (currentStep === 0) {
            resetProjectData();
            return;
        }
        setDirection(-1);
        setCurrentStep((prev) => prev - 1);
    };
    const resetProjectData = () => {
        setProjectData({
            folderPath: undefined,
            name: undefined,
            files: undefined,
        });
        setCurrentStep(0);
        setError(null);
    };
    const retry = () => {
        setError(null);
        void finalizeProject();
    };
    const cancel = () => {
        resetProjectData();
    };
    const value = {
        currentStep,
        projectData,
        direction,
        isFinalizing,
        totalSteps,
        error,
        setProjectData,
        nextStep,
        prevStep,
        setCurrentStep,
        setDirection,
        resetProjectData,
        retry,
        cancel,
        validateNextJsProject,
    };
    return (<ProjectCreationContext.Provider value={value}>{children}</ProjectCreationContext.Provider>);
};
exports.ProjectCreationProvider = ProjectCreationProvider;
const useProjectCreation = () => {
    const context = (0, react_1.useContext)(ProjectCreationContext);
    if (context === undefined) {
        throw new Error('useProjectCreation must be used within a ProjectCreationProvider');
    }
    return context;
};
exports.useProjectCreation = useProjectCreation;
const uploadToSandbox = async (files, provider) => {
    for (const file of files) {
        try {
            if (file.type === types_1.ProcessedFileType.BINARY) {
                const uint8Array = new Uint8Array(file.content);
                await provider.writeFile({
                    args: {
                        path: file.path,
                        content: uint8Array,
                        overwrite: true,
                    },
                });
            }
            else {
                await provider.writeFile({
                    args: {
                        path: file.path,
                        content: file.content,
                        overwrite: true,
                    },
                });
            }
        }
        catch (fileError) {
            console.error(`Error uploading file ${file.path}:`, fileError);
            throw new Error(`Failed to upload file: ${file.path} - ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
    }
};
exports.uploadToSandbox = uploadToSandbox;
//# sourceMappingURL=index.js.map