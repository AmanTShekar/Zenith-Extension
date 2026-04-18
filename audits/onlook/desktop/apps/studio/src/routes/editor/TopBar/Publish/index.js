"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const Dropdown_1 = require("./Dropdown");
const TriggerButton_1 = require("./TriggerButton");
const Publish = (0, mobx_react_lite_1.observer)(() => {
    const userManager = (0, Context_1.useUserManager)();
    const editorEngine = (0, Context_1.useEditorEngine)();
    (0, react_1.useEffect)(() => {
        userManager.subscription.getPlanFromServer();
    }, [editorEngine.isPublishOpen]);
    return (<dropdown_menu_1.DropdownMenu open={editorEngine.isPublishOpen} onOpenChange={(open) => {
            editorEngine.isPublishOpen = open;
        }}>
            <TriggerButton_1.PublishButton />
            <dropdown_menu_1.DropdownMenuContent align="end" className="w-96 p-0 text-sm">
                <Dropdown_1.PublishDropdown />
            </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>);
});
exports.default = Publish;
//# sourceMappingURL=index.js.map