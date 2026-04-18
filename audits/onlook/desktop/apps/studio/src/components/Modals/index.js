"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modals = void 0;
const Announcement_1 = require("./Announcement");
const Quitting_1 = require("./Quitting");
const Settings_1 = require("./Settings");
const PricingPage_1 = require("./Subscription/PricingPage");
const Modals = () => {
    return (<>
            <Settings_1.SettingsModal />
            <Quitting_1.QuittingModal />
            <PricingPage_1.SubscriptionModal />
            <Announcement_1.AnnouncementModal />
        </>);
};
exports.Modals = Modals;
//# sourceMappingURL=index.js.map