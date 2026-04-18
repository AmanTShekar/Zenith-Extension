"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Templates = Templates;
const client_1 = require("@/utils/supabase/client");
const constants_1 = require("@onlook/constants");
const react_1 = require("motion/react");
const react_2 = require("react");
const carousel_1 = require("../carousel");
const template_card_1 = require("./template-card");
function Templates({ templateProjects, searchQuery, onTemplateClick, onToggleStar, starredTemplates = new Set() }) {
    const filteredTemplatesData = (0, react_2.useMemo)(() => {
        const filtered = templateProjects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (project.metadata.description && project.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())));
        const sorted = filtered.sort((a, b) => {
            const aIsStarred = starredTemplates.has(a.id);
            const bIsStarred = starredTemplates.has(b.id);
            if (aIsStarred && !bIsStarred)
                return -1;
            if (!aIsStarred && bIsStarred)
                return 1;
            return 0;
        });
        return sorted.slice(0, 8);
    }, [searchQuery, starredTemplates, templateProjects]);
    return (<div className="mb-12">
            <h2 className="text-2xl text-foreground font-normal mb-[12px]">
                Templates
            </h2>

            <carousel_1.Carousel gap="gap-6">
                <react_1.AnimatePresence mode="popLayout">
                    {filteredTemplatesData.length > 0 ? (filteredTemplatesData.map((project, index) => (<react_1.motion.div key={project.id} className="flex-shrink-0" initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                },
            }} exit={{
                opacity: 0,
                y: -20,
                filter: "blur(10px)",
                transition: { duration: 0.2 },
            }} layout>
                                <template_card_1.TemplateCard title={project.name} description={project.metadata.description || 'No description available'} image={project.metadata.previewImg?.url ||
                (project.metadata.previewImg?.storagePath
                    ? (0, client_1.getFileUrlFromStorage)(project.metadata.previewImg.storagePath.bucket || constants_1.STORAGE_BUCKETS.PREVIEW_IMAGES, project.metadata.previewImg.storagePath.path) || undefined
                    : undefined)} isNew={false} isStarred={starredTemplates.has(project.id)} onToggleStar={() => onToggleStar(project.id)} onClick={() => onTemplateClick(project)}/>
                            </react_1.motion.div>))) : searchQuery ? (<react_1.motion.div className="flex flex-col items-center justify-center w-full py-12 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                            <div className="text-foreground-secondary mb-2 text-lg">
                                No templates found
                            </div>
                            <div className="text-foreground-tertiary text-sm">
                                Try adjusting your search terms
                            </div>
                        </react_1.motion.div>) : null}
                </react_1.AnimatePresence>
            </carousel_1.Carousel>
        </div>);
}
//# sourceMappingURL=index.js.map