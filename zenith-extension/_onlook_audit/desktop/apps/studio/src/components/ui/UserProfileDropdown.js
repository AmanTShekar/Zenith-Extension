"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const utils_1 = require("@onlook/ui/utils");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = require("react");
const UserProfileDropdown = (0, mobx_react_lite_1.observer)(({ children, imageClassName, buttonClassName, }) => {
    const [userImage, setUserImage] = (0, react_1.useState)(null);
    const authManager = (0, Context_1.useAuthManager)();
    (0, react_1.useEffect)(() => {
        if (authManager.userMetadata?.avatarUrl) {
            setUserImage(authManager.userMetadata.avatarUrl);
        }
    }, [authManager.authenticated, authManager.userMetadata?.avatarUrl]);
    return (<dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <button_1.Button className={(0, utils_1.cn)('w-8 h-8 p-0 bg-background-onlook rounded-full focus:outline-none group', buttonClassName)}>
                        {userImage && (<img className={(0, utils_1.cn)('w-8 h-8 rounded-full object-cover group-hover:ease-in-out group-hover:transition group-hover:duration-100 group-hover:ring-1 group-hover:ring-gray-600', imageClassName)} src={userImage} alt="User avatar" referrerPolicy={'no-referrer'}/>)}
                    </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent align="end">{children}</dropdown_menu_1.DropdownMenuContent>
            </dropdown_menu_1.DropdownMenu>);
});
exports.default = UserProfileDropdown;
//# sourceMappingURL=UserProfileDropdown.js.map