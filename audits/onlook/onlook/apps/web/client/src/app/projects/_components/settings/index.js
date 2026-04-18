"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsDropdown = SettingsDropdown;
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const clone_project_1 = require("./clone-project");
const create_template_1 = require("./create-template");
const delete_project_1 = require("./delete-project");
const rename_project_1 = require("./rename-project");
function SettingsDropdown({ project, refetch }) {
    return (<dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
                <button_1.Button size="default" variant="ghost" className="w-8 h-8 p-0 flex items-center justify-center hover:bg-background-onlook cursor-pointer backdrop-blur-lg" onClick={(e) => e.stopPropagation()}>
                    <icons_1.Icons.DotsHorizontal />
                </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent className="z-50" align="end" alignOffset={-4} sideOffset={8} onClick={(e) => e.stopPropagation()}>
                <rename_project_1.RenameProject project={project} refetch={refetch}/>
                <clone_project_1.CloneProject project={project} refetch={refetch}/>
                <create_template_1.CreateTemplate project={project} refetch={refetch}/>
                <delete_project_1.DeleteProject project={project} refetch={refetch}/>
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
}
//# sourceMappingURL=index.js.map