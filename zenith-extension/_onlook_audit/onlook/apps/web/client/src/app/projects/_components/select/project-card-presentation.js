"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCardPresentation = ProjectCardPresentation;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const utility_1 = require("@onlook/utility");
const react_1 = require("motion/react");
const react_2 = require("react");
/**
 * ProjectCardPresentation - Pure presentational version of ProjectCard.
 * Takes all data as props, including pre-resolved image URLs.
 */
function ProjectCardPresentation({ project, imageUrl, aspectRatio = "aspect-[4/2.6]", searchQuery = "", HighlightText, onEdit, onRename, onClone, onToggleTemplate, onDelete, isTemplate = false, }) {
    const SHOW_DESCRIPTION = false;
    const lastUpdated = (0, react_2.useMemo)(() => (0, utility_1.timeAgo)(project.metadata.updatedAt), [project.metadata.updatedAt]);
    const handleEdit = () => {
        onEdit?.(project);
    };
    return (<react_1.motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="w-full break-inside-avoid cursor-pointer" onClick={handleEdit}>
            <div className={`relative ${aspectRatio} rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/20 transition-all duration-300 group`}>
                {imageUrl ? (<img src={imageUrl} alt={project.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>) : (<>
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-gray-800/40 via-gray-500/40 to-gray-400/40"/>
                        <div className="absolute inset-0 rounded-lg border-[0.5px] border-gray-500/70" style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}/>
                    </>)}

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"/>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                    <dropdown_menu_1.DropdownMenu>
                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button size="default" variant="ghost" className="w-8 h-8 p-0 flex items-center justify-center hover:bg-background-onlook cursor-pointer backdrop-blur-lg" onClick={(e) => e.stopPropagation()}>
                                <icons_1.Icons.DotsHorizontal />
                            </button_1.Button>
                        </dropdown_menu_1.DropdownMenuTrigger>
                        <dropdown_menu_1.DropdownMenuContent className="z-50" align="end" alignOffset={-4} sideOffset={8} onClick={(e) => e.stopPropagation()}>
                            {onRename && (<dropdown_menu_1.DropdownMenuItem onSelect={(event) => {
                event.preventDefault();
                onRename(project);
            }} className="text-foreground-active hover:!bg-background-onlook hover:!text-foreground-active gap-2">
                                    <icons_1.Icons.Pencil className="w-4 h-4"/>
                                    Rename Project
                                </dropdown_menu_1.DropdownMenuItem>)}
                            {onClone && (<dropdown_menu_1.DropdownMenuItem onSelect={(event) => {
                event.preventDefault();
                onClone(project);
            }} className="text-foreground-active hover:!bg-background-onlook hover:!text-foreground-active gap-2">
                                    <icons_1.Icons.Copy className="w-4 h-4"/>
                                    Clone Project
                                </dropdown_menu_1.DropdownMenuItem>)}
                            {onToggleTemplate && (<dropdown_menu_1.DropdownMenuItem onSelect={(event) => {
                event.preventDefault();
                onToggleTemplate(project);
            }} className="text-foreground-active hover:!bg-background-onlook hover:!text-foreground-active gap-2">
                                    {isTemplate ? (<>
                                            <icons_1.Icons.CrossL className="w-4 h-4 text-purple-600"/>
                                            Unmark as template
                                        </>) : (<>
                                            <icons_1.Icons.FilePlus className="w-4 h-4"/>
                                            Convert to template
                                        </>)}
                                </dropdown_menu_1.DropdownMenuItem>)}
                            {onDelete && (<dropdown_menu_1.DropdownMenuItem onSelect={(event) => {
                event.preventDefault();
                onDelete(project);
            }} className="gap-2 text-red-400 hover:!bg-red-200/80 hover:!text-red-700 dark:text-red-200 dark:hover:!bg-red-800 dark:hover:!text-red-100">
                                    <icons_1.Icons.Trash className="w-4 h-4"/>
                                    Delete Project
                                </dropdown_menu_1.DropdownMenuItem>)}
                        </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                </div>

                {onEdit && (<div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20">
                        <button_1.Button size="default" onClick={handleEdit} className="gap-2 border border-gray-300 w-auto cursor-pointer bg-white text-black hover:bg-gray-100">
                            <icons_1.Icons.PencilPaper />
                            <p>Edit App</p>
                        </button_1.Button>
                    </div>)}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/20 to-transparent p-4 h-32 transition-all duration-300 group-hover:from-background group-hover:via-background/40" style={{ bottom: "-1px", left: "-1px", right: "-1px" }}>
                    <div className="flex justify-between items-end h-full">
                        <div>
                            <div className="text-white font-medium text-base mb-1 truncate drop-shadow-lg">
                                {HighlightText ? (<HighlightText text={project.name} searchQuery={searchQuery}/>) : (project.name)}
                            </div>
                            <div className="text-white/70 text-xs mb-1 drop-shadow-lg flex items-center">
                                <span>{lastUpdated} ago</span>
                            </div>
                            {SHOW_DESCRIPTION && project.metadata?.description && (<div className="text-white/60 text-xs line-clamp-1 drop-shadow-lg">
                                    {HighlightText ? (<HighlightText text={project.metadata.description} searchQuery={searchQuery}/>) : (project.metadata.description)}
                                </div>)}
                        </div>
                    </div>
                </div>
            </div>
        </react_1.motion.div>);
}
//# sourceMappingURL=project-card-presentation.js.map