"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateModal = TemplateModal;
exports.TemplateStats = TemplateStats;
const auth_context_1 = require("@/app/auth/auth-context");
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const constants_2 = require("@onlook/constants");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const localforage_1 = __importDefault(require("localforage"));
const react_2 = require("motion/react");
const navigation_1 = require("next/navigation");
const react_3 = require("react");
const sonner_1 = require("sonner");
const lazy_image_1 = require("./lazy-image");
function TemplateModal({ isOpen, onClose, title, description, image, isNew = false, isStarred = false, onToggleStar, templateProject, onUnmarkTemplate, user, }) {
    const { mutateAsync: forkTemplate } = react_1.api.project.fork.useMutation();
    const { data: branches } = react_1.api.branch.getByProjectId.useQuery({ projectId: templateProject.id, onlyDefault: true });
    const { setIsAuthModalOpen } = (0, auth_context_1.useAuthContext)();
    const [isCreatingProject, setIsCreatingProject] = (0, react_3.useState)(false);
    const router = (0, navigation_1.useRouter)();
    const handleUseTemplate = async () => {
        if (!user?.id) {
            await localforage_1.default.setItem(constants_1.LocalForageKeys.RETURN_URL, window.location.pathname);
            setIsAuthModalOpen(true);
            return;
        }
        if (!templateProject) {
            sonner_1.toast.error('Template data not available');
            return;
        }
        setIsCreatingProject(true);
        try {
            const newProject = await forkTemplate({
                projectId: templateProject.id,
            });
            if (newProject) {
                sonner_1.toast.success(`Created new project from ${title} template!`);
                onClose();
                router.push(`${constants_1.Routes.PROJECT}/${newProject.id}`);
            }
        }
        catch (error) {
            console.error('Error creating project from template:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('502') || errorMessage.includes('sandbox')) {
                sonner_1.toast.error('Sandbox service temporarily unavailable', {
                    description: 'Please try again in a few moments. Our servers may be experiencing high load.',
                });
            }
            else {
                sonner_1.toast.error('Failed to create project from template', {
                    description: errorMessage,
                });
            }
        }
        finally {
            setIsCreatingProject(false);
        }
    };
    const handlePreviewTemplate = () => {
        if (!branches || branches.length === 0 || !branches[0]?.sandbox.id) {
            sonner_1.toast.error('No branches found for this template');
            return;
        }
        const sandboxUrl = (0, constants_2.getSandboxPreviewUrl)(branches[0].sandbox.id, 3000);
        window.open(sandboxUrl, '_blank');
    };
    const handleEditTemplate = () => {
        router.push(`${constants_1.Routes.PROJECT}/${templateProject.id}`);
    };
    return (<react_2.AnimatePresence>
            {isOpen && (<react_2.motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
                    <react_2.motion.div className="bg-background border border-border rounded-2xl max-w-4xl w-full max-h-[80vh] flex relative shadow-2xl" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }} onClick={(e) => e.stopPropagation()}>
                        <button_1.Button onClick={onClose} variant="ghost" size="sm" className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/20 hover:bg-secondary transition-colors">
                            <icons_1.Icons.CrossS className="w-4 h-4"/>
                        </button_1.Button>

                        <div className="w-1/2 bg-secondary relative rounded-l-2xl overflow-hidden">
                            <lazy_image_1.LazyImage src={image} alt={`${title} template preview`} className="w-full h-full object-cover"/>

                            {isNew && (<div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                    New
                                </div>)}
                        </div>

                        <div className="w-1/2 p-8 flex flex-col overflow-visible min-h-80">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">
                                {title}
                            </h2>

                            <p className="text-foreground-secondary text-base leading-relaxed mb-8 flex-1">
                                {description}
                            </p>

                            <div className="flex items-center gap-3 overflow-visible">
                                <button_1.Button className="flex-1" size="lg" onClick={handleUseTemplate} disabled={isCreatingProject}>
                                    {isCreatingProject ? (<div className="flex items-center gap-2">
                                            <icons_1.Icons.LoadingSpinner className="w-4 h-4 animate-spin"/>
                                            Creating...
                                        </div>) : ('Use Template')}
                                </button_1.Button>

                                {onToggleStar && (<tooltip_1.Tooltip>
                                        <tooltip_1.TooltipTrigger asChild>
                                            <button_1.Button variant="outline" size="lg" onClick={onToggleStar} aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}>
                                                {isStarred ? (<icons_1.Icons.BookmarkFilled className="w-5 h-5 text-white"/>) : (<icons_1.Icons.Bookmark className="w-5 h-5 text-foreground-tertiary"/>)}
                                            </button_1.Button>
                                        </tooltip_1.TooltipTrigger>
                                        <tooltip_1.TooltipContent>
                                            <p>Mark as favorite</p>
                                        </tooltip_1.TooltipContent>
                                    </tooltip_1.Tooltip>)}

                                <dropdown_menu_1.DropdownMenu>
                                    <dropdown_menu_1.DropdownMenuTrigger asChild>
                                        <button_1.Button variant="outline" size="lg" aria-label="Template options">
                                            <icons_1.Icons.DotsHorizontal className="w-5 h-5"/>
                                        </button_1.Button>
                                    </dropdown_menu_1.DropdownMenuTrigger>
                                    <dropdown_menu_1.DropdownMenuContent align="end" className="w-48">
                                        <dropdown_menu_1.DropdownMenuItem onClick={handlePreviewTemplate}>
                                            <icons_1.Icons.EyeOpen className="w-4 h-4 mr-3"/>
                                            Preview
                                        </dropdown_menu_1.DropdownMenuItem>
                                        {/* <DropdownMenuItem>
                <Icons.Share className="w-4 h-4 mr-3" />
                Share
            </DropdownMenuItem>
            <DropdownMenuItem>
                <Icons.Download className="w-4 h-4 mr-3" />
                Download Code
            </DropdownMenuItem> */}
                                        <dropdown_menu_1.DropdownMenuItem onClick={handleEditTemplate}>
                                            <icons_1.Icons.Edit className="w-4 h-4 mr-3"/>
                                            Edit
                                        </dropdown_menu_1.DropdownMenuItem>
                                        <dropdown_menu_1.DropdownMenuSeparator />
                                        {onUnmarkTemplate && (<dropdown_menu_1.DropdownMenuItem onClick={onUnmarkTemplate} className="text-foreground-secondary focus:text-foreground">
                                                <icons_1.Icons.CrossL className="w-4 h-4 mr-3"/>
                                                Remove Template
                                            </dropdown_menu_1.DropdownMenuItem>)}
                                    </dropdown_menu_1.DropdownMenuContent>
                                </dropdown_menu_1.DropdownMenu>
                            </div>
                            <TemplateStats />
                        </div>
                    </react_2.motion.div>
                </react_2.motion.div>)}
        </react_2.AnimatePresence>);
}
function TemplateStats() {
    // TODO: Add stats
    return null;
    return (<div className="mt-6 pt-6 border-t border-border hidden">
            <div className="text-sm text-foreground-tertiary">
                Used 24 times • Created 24 days ago
            </div>
        </div>);
}
//# sourceMappingURL=template-modal.js.map