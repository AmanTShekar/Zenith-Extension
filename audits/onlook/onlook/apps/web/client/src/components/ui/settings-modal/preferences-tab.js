"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreferencesTab = void 0;
const mobx_react_lite_1 = require("mobx-react-lite");
const user_delete_section_1 = require("./user-delete-section");
exports.PreferencesTab = (0, mobx_react_lite_1.observer)(() => {
    return (<div className="flex flex-col gap-8 p-6">
            <user_delete_section_1.UserDeleteSection />
        </div>);
});
//# sourceMappingURL=preferences-tab.js.map