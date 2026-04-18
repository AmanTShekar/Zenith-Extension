"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishButton = void 0;
const editor_1 = require("@/components/store/editor");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const mobx_react_lite_1 = require("mobx-react-lite");
const dropdown_1 = require("./dropdown");
const trigger_button_1 = require("./trigger-button");
exports.PublishButton = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    return (<dropdown_menu_1.DropdownMenu modal={false} open={editorEngine.state.publishOpen} onOpenChange={(open) => {
            editorEngine.state.publishOpen = open;
        }}>
            <trigger_button_1.TriggerButton />
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-96 p-0 text-sm">
                <dropdown_1.PublishDropdown />
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=index.js.map