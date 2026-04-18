"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCreateBlankProject = useCreateBlankProject;
const auth_context_1 = require("@/app/auth/auth-context");
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const constants_2 = require("@onlook/constants");
const localforage_1 = __importDefault(require("localforage"));
const navigation_1 = require("next/navigation");
const react_2 = require("react");
const sonner_1 = require("sonner");
function useCreateBlankProject() {
    const { data: user } = react_1.api.user.get.useQuery();
    const { mutateAsync: forkSandbox } = react_1.api.sandbox.fork.useMutation();
    const { mutateAsync: createProject } = react_1.api.project.create.useMutation();
    const { setIsAuthModalOpen } = (0, auth_context_1.useAuthContext)();
    const router = (0, navigation_1.useRouter)();
    const [isCreatingProject, setIsCreatingProject] = (0, react_2.useState)(false);
    const handleStartBlankProject = async () => {
        if (!user?.id) {
            // Store the return URL and open auth modal
            await localforage_1.default.setItem(constants_1.LocalForageKeys.RETURN_URL, window.location.pathname);
            setIsAuthModalOpen(true);
            return;
        }
        setIsCreatingProject(true);
        try {
            // Create a blank project using the BLANK template
            const { sandboxId, previewUrl } = await forkSandbox({
                sandbox: constants_2.SandboxTemplates[constants_2.Templates.EMPTY_NEXTJS],
                config: {
                    title: `Blank project - ${user.id}`,
                    tags: ['blank', user.id],
                },
            });
            const newProject = await createProject({
                project: {
                    name: 'New Project',
                    description: 'Your new blank project',
                    tags: ['blank'],
                },
                sandboxId,
                sandboxUrl: previewUrl,
                userId: user.id,
            });
            if (newProject) {
                router.push(`${constants_1.Routes.PROJECT}/${newProject.id}`);
            }
        }
        catch (error) {
            console.error('Error creating blank project:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('502') || errorMessage.includes('sandbox')) {
                sonner_1.toast.error('Sandbox service temporarily unavailable', {
                    description: 'Please try again in a few moments. Our servers may be experiencing high load.',
                });
            }
            else {
                sonner_1.toast.error('Failed to create project', {
                    description: errorMessage,
                });
            }
        }
        finally {
            setIsCreatingProject(false);
        }
    };
    return { handleStartBlankProject, isCreatingProject };
}
//# sourceMappingURL=use-create-blank-project.js.map