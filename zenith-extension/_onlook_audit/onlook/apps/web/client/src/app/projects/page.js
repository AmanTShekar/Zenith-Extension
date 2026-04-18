"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const pricing_modal_1 = require("@/components/ui/pricing-modal");
const non_project_1 = require("@/components/ui/settings-modal/non-project");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const select_1 = require("./_components/select");
const top_bar_1 = require("./_components/top-bar");
const Page = (0, mobx_react_lite_1.observer)(() => {
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    return (<div className="w-screen h-screen flex flex-col">
            <top_bar_1.TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery}/>
            <div className="flex justify-center w-full h-full overflow-y-auto overflow-x-visible">
                <select_1.SelectProject externalSearchQuery={searchQuery}/>
            </div>
            <pricing_modal_1.SubscriptionModal />
            <non_project_1.NonProjectSettingsModal />
        </div>);
});
exports.default = Page;
//# sourceMappingURL=page.js.map