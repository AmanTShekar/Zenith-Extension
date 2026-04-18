"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTemplate = CreateTemplate;
const react_1 = require("@/trpc/react");
const constants_1 = require("@onlook/constants");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("sonner");
function CreateTemplate({ project, refetch }) {
    const utils = react_1.api.useUtils();
    const { mutateAsync: addTag } = react_1.api.project.addTag.useMutation();
    const { mutateAsync: removeTag } = react_1.api.project.removeTag.useMutation();
    const isTemplate = project.metadata.tags.includes(constants_1.Tags.TEMPLATE) || false;
    const handleTemplateToggle = async () => {
        try {
            if (isTemplate) {
                await removeTag({ projectId: project.id, tag: constants_1.Tags.TEMPLATE });
                sonner_1.toast.success('Removed from templates');
            }
            else {
                await addTag({ projectId: project.id, tag: constants_1.Tags.TEMPLATE });
                sonner_1.toast.success('Added to templates');
            }
            // Invalidate and refetch both project lists and template lists
            await Promise.all([
                utils.project.list.invalidate(),
            ]);
            refetch();
        }
        catch (error) {
            sonner_1.toast.error('Failed to update template tag');
        }
    };
    return (<dropdown_menu_1.DropdownMenuItem onSelect={handleTemplateToggle} className="text-foreground-active hover:!bg-background-onlook hover:!text-foreground-active gap-2">
            {isTemplate ? (<icons_1.Icons.CrossL className="w-4 h-4 text-purple-600"/>) : (<icons_1.Icons.FilePlus className="w-4 h-4"/>)}
            {isTemplate ? 'Unmark as template' : 'Convert to template'}
        </dropdown_menu_1.DropdownMenuItem>);
}
//# sourceMappingURL=create-template.js.map