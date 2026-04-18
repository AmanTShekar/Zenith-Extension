"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateModalPresentation = TemplateModalPresentation;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const tooltip_1 = require("@onlook/ui/tooltip");
const react_1 = require("motion/react");
/**
 * TemplateModalPresentation - Pure presentational version of TemplateModal.
 * Receives all data and callbacks as props instead of using hooks/context.
 */
function TemplateModalPresentation({ isOpen, onClose, title, description, image, isNew = false, isStarred = false, onToggleStar, isCreatingProject = false, onUseTemplate, onPreviewTemplate, onEditTemplate, onUnmarkTemplate, }) {
    return (<react_1.AnimatePresence>
            {isOpen && (<react_1.motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
                    <react_1.motion.div className="bg-background border border-border rounded-2xl max-w-4xl w-full max-h-[80vh] flex relative shadow-2xl" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }} onClick={(e) => e.stopPropagation()}>
                        <button_1.Button onClick={onClose} variant="ghost" size="sm" className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/20 hover:bg-secondary transition-colors">
                            <icons_1.Icons.CrossS className="w-4 h-4"/>
                        </button_1.Button>

                        <div className="w-1/2 bg-secondary relative rounded-l-2xl overflow-hidden">
                            {image ? (<img src={image} alt={`${title} template preview`} className="w-full h-full object-cover"/>) : (<div className="w-full h-full bg-gradient-to-t from-gray-800/40 via-gray-500/40 to-gray-400/40"/>)}

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
                                <button_1.Button className="flex-1" size="lg" onClick={onUseTemplate} disabled={isCreatingProject}>
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
                                        {onPreviewTemplate && (<dropdown_menu_1.DropdownMenuItem onClick={onPreviewTemplate}>
                                                <icons_1.Icons.EyeOpen className="w-4 h-4 mr-3"/>
                                                Preview
                                            </dropdown_menu_1.DropdownMenuItem>)}
                                        {onEditTemplate && (<dropdown_menu_1.DropdownMenuItem onClick={onEditTemplate}>
                                                <icons_1.Icons.Edit className="w-4 h-4 mr-3"/>
                                                Edit
                                            </dropdown_menu_1.DropdownMenuItem>)}
                                        {onUnmarkTemplate && (<>
                                                <dropdown_menu_1.DropdownMenuSeparator />
                                                <dropdown_menu_1.DropdownMenuItem onClick={onUnmarkTemplate} className="text-foreground-secondary focus:text-foreground">
                                                    <icons_1.Icons.CrossL className="w-4 h-4 mr-3"/>
                                                    Remove Template
                                                </dropdown_menu_1.DropdownMenuItem>
                                            </>)}
                                    </dropdown_menu_1.DropdownMenuContent>
                                </dropdown_menu_1.DropdownMenu>
                            </div>
                        </div>
                    </react_1.motion.div>
                </react_1.motion.div>)}
        </react_1.AnimatePresence>);
}
//# sourceMappingURL=template-modal-presentation.js.map