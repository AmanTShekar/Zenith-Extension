"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const icons_1 = require("@onlook/ui/icons");
const button_1 = require("@onlook/ui/button");
const mobx_react_lite_1 = require("mobx-react-lite");
const UpdateButton = (0, mobx_react_lite_1.observer)(() => {
    const updateManager = (0, Context_1.useUpdateManager)();
    return (updateManager.updateAvailable && (<button_1.Button variant={'secondary'} size={'sm'} className={`bg-red-500 hover:bg-red-600 h-7 rounded-sm gap-2 transition ${updateManager.updateAvailable ? 'animate-wiggle' : ''} hover:animate-none`} onClick={() => {
            updateManager.quitAndInstall();
        }}>
                <icons_1.Icons.Download />
                <p>Install new Update</p>
            </button_1.Button>));
});
exports.default = UpdateButton;
//# sourceMappingURL=index.js.map