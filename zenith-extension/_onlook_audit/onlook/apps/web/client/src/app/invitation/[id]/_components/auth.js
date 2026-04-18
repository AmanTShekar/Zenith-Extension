"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleAuth = void 0;
const constants_1 = require("@/utils/constants");
const url_1 = require("@/utils/url");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const navigation_1 = require("next/navigation");
const HandleAuth = () => {
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const handleLogin = () => {
        const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        router.push(`${constants_1.Routes.LOGIN}?${(0, url_1.getReturnUrlQueryParam)(currentUrl)}`);
    };
    return (<div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-2xl">You must be logged in to accept this invitation</div>
                <button_1.Button variant="outline" onClick={handleLogin}>
                    <index_1.Icons.OnlookLogo className="size-4"/>
                    Login or Signup
                </button_1.Button>
            </div>
        </div>);
};
exports.HandleAuth = HandleAuth;
//# sourceMappingURL=auth.js.map