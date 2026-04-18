"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppBar = void 0;
const Context_1 = require("@/components/Context");
const routes_1 = require("@/lib/routes");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const AnnouncementBanner_1 = require("./AnnouncementBanner");
const HelpButton_1 = require("./HelpButton");
const UpdateButton_1 = __importDefault(require("./UpdateButton"));
const WindowsControls_1 = require("./WindowsControls");
exports.AppBar = (0, mobx_react_lite_1.observer)(() => {
    const routeManager = (0, Context_1.useRouteManager)();
    const updateManager = (0, Context_1.useUpdateManager)();
    return (<div className={(0, utils_1.cn)('flex flex-row items-center pl-20 h-10 border-b bg-blue-600 dark:bg-blue-800 dark:text-blue-300 text-blue-400 transition-colors duration-300 ease-in-out', routeManager.route === routes_1.Route.SIGN_IN && 'bg-transparent border-b-0', updateManager.updateAvailable &&
            'bg-red-950 dark:bg-red-950 dark:text-red-300 text-red-300 transition-opacity duration-300 ease-in-out')}>
            <div className="appbar w-full h-full">
                <AnnouncementBanner_1.AnnouncementBanner />
            </div>
            <div className="flex mr-2 gap-2">
                <UpdateButton_1.default />
            </div>
            <HelpButton_1.HelpButton />
            <WindowsControls_1.WindowsControls />
        </div>);
});
//# sourceMappingURL=index.js.map