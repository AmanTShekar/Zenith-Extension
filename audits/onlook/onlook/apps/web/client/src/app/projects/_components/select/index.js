"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectProject = void 0;
const react_1 = require("react");
const carousel_1 = require("../carousel");
const localforage_1 = __importDefault(require("localforage"));
const react_2 = require("motion/react");
const sonner_1 = require("sonner");
const constants_1 = require("@onlook/constants");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const react_3 = require("@/trpc/react");
const use_create_blank_project_1 = require("@/hooks/use-create-blank-project");
const client_1 = require("@/utils/supabase/client");
const templates_1 = require("../templates");
const template_modal_1 = require("../templates/template-modal");
const highlight_text_1 = require("./highlight-text");
const masonry_layout_1 = require("./masonry-layout");
const project_card_1 = require("./project-card");
const square_project_card_1 = require("./square-project-card");
const STARRED_TEMPLATES_KEY = 'onlook_starred_templates';
const SelectProject = ({ externalSearchQuery } = {}) => {
    // Hooks
    const utils = react_3.api.useUtils();
    const { data: user } = react_3.api.user.get.useQuery();
    const { data: fetchedProjects, isLoading, refetch } = react_3.api.project.list.useQuery();
    const { mutateAsync: removeTag } = react_3.api.project.removeTag.useMutation();
    const { handleStartBlankProject, isCreatingProject } = (0, use_create_blank_project_1.useCreateBlankProject)();
    // Search and filters
    const [internalQuery] = (0, react_1.useState)('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = (0, react_1.useState)('');
    const searchQuery = externalSearchQuery ?? internalQuery;
    const [filesOrderBy, setFilesOrderBy] = (0, react_1.useState)('Newest first');
    const [filesSortBy, setFilesSortBy] = (0, react_1.useState)('Last viewed');
    // Settings
    const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = (0, react_1.useState)(false);
    const settingsDropdownRef = (0, react_1.useRef)(null);
    const [layoutMode, setLayoutMode] = (0, react_1.useState)('masonry');
    const [spacing] = (0, react_1.useState)(24);
    // Templates
    const projects = fetchedProjects?.filter((project) => !project.metadata.tags.includes(constants_1.Tags.TEMPLATE)) ?? [];
    const templateProjects = fetchedProjects?.filter((project) => project.metadata.tags.includes(constants_1.Tags.TEMPLATE)) ?? [];
    const shouldShowTemplate = templateProjects.length > 0;
    const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = (0, react_1.useState)(false);
    const [starredTemplates, setStarredTemplates] = (0, react_1.useState)(new Set());
    // Load starred templates from storage
    const loadStarredTemplates = async () => {
        try {
            const saved = await localforage_1.default.getItem(STARRED_TEMPLATES_KEY);
            if (saved && Array.isArray(saved)) {
                setStarredTemplates(new Set(saved));
            }
        }
        catch (error) {
            console.error('Failed to load starred templates:', error);
        }
    };
    // Save starred templates to storage
    const saveStarredTemplates = async (templateIds) => {
        try {
            await localforage_1.default.setItem(STARRED_TEMPLATES_KEY, Array.from(templateIds));
        }
        catch (error) {
            console.error('Failed to save starred templates:', error);
        }
    };
    const handleTemplateClick = (project) => {
        setSelectedTemplate(project);
        setIsTemplateModalOpen(true);
    };
    const handleCloseTemplateModal = () => {
        setIsTemplateModalOpen(false);
        setSelectedTemplate(null);
    };
    const handleToggleStar = (templateId) => {
        setStarredTemplates((prev) => {
            const newStarred = new Set(prev);
            if (newStarred.has(templateId)) {
                newStarred.delete(templateId);
            }
            else {
                newStarred.add(templateId);
            }
            // Save to storage asynchronously
            saveStarredTemplates(newStarred);
            return newStarred;
        });
        // Note: Selected template star state is handled by the starredTemplates Set
    };
    const handleUnmarkTemplate = async () => {
        if (!selectedTemplate?.id)
            return;
        try {
            await removeTag({
                projectId: selectedTemplate.id,
                tag: constants_1.Tags.TEMPLATE,
            });
            sonner_1.toast.success('Removed from templates');
            setIsTemplateModalOpen(false);
            setSelectedTemplate(null);
            await Promise.all([utils.project.list.invalidate()]);
            refetch();
        }
        catch (error) {
            sonner_1.toast.error('Failed to update template tag');
        }
    };
    // Initialize starred templates from storage
    (0, react_1.useEffect)(() => {
        loadStarredTemplates();
    }, []);
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 100);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    const filteredAndSortedProjects = (0, react_1.useMemo)(() => {
        let filtered = projects;
        if (debouncedSearchQuery) {
            const q = debouncedSearchQuery.toLowerCase();
            filtered = projects.filter((p) => [p.name, p.metadata?.description ?? '', p.metadata.tags.join(', ')].some((s) => (s ?? '').toLowerCase().includes(q)));
        }
        return [...filtered].sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime());
    }, [projects, debouncedSearchQuery]);
    const filesProjects = (0, react_1.useMemo)(() => {
        const sorted = [...filteredAndSortedProjects].sort((a, b) => {
            switch (filesSortBy) {
                case 'Alphabetical':
                    return a.name.localeCompare(b.name);
                case 'Date created':
                    return (new Date(a.metadata.createdAt).getTime() -
                        new Date(b.metadata.createdAt).getTime());
                case 'Last viewed':
                default:
                    return (new Date(b.metadata.updatedAt).getTime() -
                        new Date(a.metadata.updatedAt).getTime());
            }
        });
        return filesOrderBy === 'Oldest first' ? sorted.reverse() : sorted;
    }, [filteredAndSortedProjects, filesSortBy, filesOrderBy]);
    const sortOptions = [
        { value: 'Alphabetical', label: 'Alphabetical' },
        { value: 'Date created', label: 'Date created' },
        { value: 'Last viewed', label: 'Last viewed' },
    ];
    const orderOptions = [
        { value: 'Oldest first', label: 'Oldest first' },
        { value: 'Newest first', label: 'Newest first' },
    ];
    (0, react_1.useEffect)(() => {
        function handleClickOutside(event) {
            if (settingsDropdownRef.current &&
                !settingsDropdownRef.current.contains(event.target)) {
                setIsSettingsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    if (isLoading) {
        return (<div className="flex h-screen w-screen flex-col items-center justify-center">
                <div className="flex flex-row items-center gap-2">
                    <icons_1.Icons.LoadingSpinner className="text-foreground-primary h-6 w-6 animate-spin"/>
                    <div className="text-foreground-secondary text-lg">Loading projects...</div>
                </div>
            </div>);
    }
    if (projects.length === 0) {
        return (<div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <div className="text-foreground-secondary text-xl">No projects found</div>
                <div className="text-md text-foreground-tertiary">
                    Create a new project to get started
                </div>
                <div className="flex justify-center">
                    <button_1.Button onClick={handleStartBlankProject} disabled={isCreatingProject} variant="default">
                        {isCreatingProject ? (<icons_1.Icons.LoadingSpinner className="h-4 w-4 animate-spin"/>) : (<icons_1.Icons.Plus className="h-4 w-4"/>)}
                        Create blank project
                    </button_1.Button>
                </div>
            </div>);
    }
    return (<div className="relative flex h-full w-full flex-col overflow-x-visible px-6 py-8" style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
        }}>
            <div className="mx-auto w-full max-w-6xl overflow-x-visible">
                <div className="mb-12 overflow-x-visible">
                    <h2 className="text-foreground mb-[12px] text-2xl font-normal">
                        Recent projects
                    </h2>

                    <carousel_1.Carousel gap="gap-4" className="h-[202px] pb-4">
                        <react_2.AnimatePresence mode="popLayout">
                            {filteredAndSortedProjects.length === 0 ? (<react_2.motion.div key="no-results" className="flex w-full items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div className="text-center">
                                        <div className="text-foreground-secondary text-base">
                                            No projects found
                                        </div>
                                        <div className="text-foreground-tertiary text-sm">
                                            Try adjusting your search terms
                                        </div>
                                    </div>
                                </react_2.motion.div>) : ([
            <react_2.motion.div key="create-tile" className="w-72 flex-shrink-0" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: {
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    },
                }} exit={{
                    opacity: 0,
                    y: -20,
                    filter: 'blur(10px)',
                    transition: { duration: 0.2 },
                }} layout>
                                        <button onClick={handleStartBlankProject} disabled={isCreatingProject} className="border-border bg-secondary/40 hover:bg-secondary relative flex aspect-[4/2.8] w-full items-center justify-center rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            <div className="text-foreground-tertiary flex flex-col items-center justify-center">
                                                {isCreatingProject ? (<icons_1.Icons.LoadingSpinner className="mb-1 h-7 w-7 animate-spin"/>) : (<icons_1.Icons.Plus className="mb-1 h-7 w-7"/>)}
                                                <span className="text-sm">Create</span>
                                            </div>
                                        </button>
                                    </react_2.motion.div>,
            /* Project cards */
            ...filteredAndSortedProjects.map((project, index) => (<react_2.motion.div key={project.id} className="w-72 flex-shrink-0" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: {
                        duration: 0.4,
                        delay: (index + 1) * 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    },
                }} exit={{
                    opacity: 0,
                    y: -20,
                    filter: 'blur(10px)',
                    transition: { duration: 0.2 },
                }} layout>
                                            <square_project_card_1.SquareProjectCard project={project} searchQuery={debouncedSearchQuery} HighlightText={highlight_text_1.HighlightText}/>
                                        </react_2.motion.div>))
        ])}
                        </react_2.AnimatePresence>
                    </carousel_1.Carousel>
                </div>

                {shouldShowTemplate && (<templates_1.Templates templateProjects={templateProjects} searchQuery={debouncedSearchQuery} onTemplateClick={handleTemplateClick} onToggleStar={handleToggleStar} starredTemplates={starredTemplates}/>)}

                <div>
                    <div className="mb-[12px] flex items-center justify-between">
                        <h2 className="text-foreground text-2xl font-normal">Projects</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setLayoutMode((m) => (m === 'masonry' ? 'grid' : 'masonry'))} className="hover:bg-secondary text-foreground-tertiary hover:text-foreground rounded p-2 transition-colors" aria-label="Toggle layout">
                                {layoutMode === 'masonry' ? (<icons_1.Icons.LayoutWindow className="h-5 w-5"/>) : (<icons_1.Icons.LayoutMasonry className="h-5 w-5"/>)}
                            </button>

                            <div className="relative" ref={settingsDropdownRef}>
                                <button onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)} className="hover:bg-secondary hover:text-foreground text-foreground-tertiary rounded p-2 transition-colors" aria-haspopup="menu" aria-expanded={isSettingsDropdownOpen}>
                                    <icons_1.Icons.Gear className="h-4 w-4"/>
                                </button>

                                <react_2.AnimatePresence>
                                    {isSettingsDropdownOpen && (<react_2.motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{
                duration: 0.18,
                ease: [0.25, 0.46, 0.45, 0.94],
            }} className="bg-background border-border absolute top-full right-0 z-50 mt-2 w-48 rounded-md border shadow-lg">
                                            <div className="p-2">
                                                <div className="text-foreground-tertiary mb-2 px-2 text-xs font-medium">
                                                    Sort by
                                                </div>
                                                {sortOptions.map((option) => (<button key={option.value} onClick={() => {
                    setFilesSortBy(option.value);
                    setIsSettingsDropdownOpen(false);
                }} className={`hover:bg-secondary w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${filesSortBy === option.value
                    ? 'text-foreground bg-secondary'
                    : 'text-foreground-secondary'}`}>
                                                        {option.label}
                                                    </button>))}

                                                <div className="border-border my-2 border-t"></div>

                                                <div className="text-foreground-tertiary mb-2 px-2 text-xs font-medium">
                                                    Order
                                                </div>
                                                {orderOptions.map((option) => (<button key={option.value} onClick={() => {
                    setFilesOrderBy(option.value);
                    setIsSettingsDropdownOpen(false);
                }} className={`hover:bg-secondary w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${filesOrderBy === option.value
                    ? 'text-foreground bg-secondary'
                    : 'text-foreground-secondary'}`}>
                                                        {option.label}
                                                    </button>))}
                                            </div>
                                        </react_2.motion.div>)}
                                </react_2.AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {layoutMode === 'masonry' ? (<masonry_layout_1.MasonryLayout items={filesProjects} spacing={spacing} renderItem={(project, aspectRatio) => (<project_card_1.ProjectCard key={`files-${project.id}`} project={project} refetch={refetch} aspectRatio={aspectRatio} searchQuery={debouncedSearchQuery} HighlightText={highlight_text_1.HighlightText}/>)}/>) : (<react_2.motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filesProjects.map((project) => (<project_card_1.ProjectCard key={`files-${project.id}`} project={project} refetch={refetch} aspectRatio="aspect-[4/2.6]" searchQuery={debouncedSearchQuery} HighlightText={highlight_text_1.HighlightText}/>))}
                        </react_2.motion.div>)}
                </div>
            </div>

            {selectedTemplate && shouldShowTemplate && (<template_modal_1.TemplateModal isOpen={isTemplateModalOpen} onClose={handleCloseTemplateModal} title={selectedTemplate.name} description={selectedTemplate.metadata?.description || 'No description available'} image={selectedTemplate.metadata?.previewImg?.url ||
                (selectedTemplate.metadata?.previewImg?.storagePath?.bucket &&
                    selectedTemplate.metadata.previewImg.storagePath.path
                    ? (0, client_1.getFileUrlFromStorage)(selectedTemplate.metadata.previewImg.storagePath.bucket, selectedTemplate.metadata.previewImg.storagePath.path)
                    : selectedTemplate.metadata?.previewImg?.storagePath?.path
                        ? (0, client_1.getFileUrlFromStorage)(constants_1.STORAGE_BUCKETS.PREVIEW_IMAGES, selectedTemplate.metadata.previewImg.storagePath.path)
                        : null)} isNew={false} isStarred={selectedTemplate ? starredTemplates.has(selectedTemplate.id) : false} onToggleStar={() => selectedTemplate && handleToggleStar(selectedTemplate.id)} templateProject={selectedTemplate} onUnmarkTemplate={handleUnmarkTemplate} user={user}/>)}
        </div>);
};
exports.SelectProject = SelectProject;
//# sourceMappingURL=index.js.map