"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRedirect = void 0;
const constants_1 = require("@/utils/constants");
const client_1 = require("@/utils/supabase/client");
const localforage_1 = __importDefault(require("localforage"));
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const AuthRedirect = ({ children }) => {
    const supabase = (0, client_1.createClient)();
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        const getSession = async () => {
            const { data: { session }, } = await supabase.auth.getSession();
            if (!session) {
                const pathname = window.location.pathname;
                await localforage_1.default.setItem(constants_1.LocalForageKeys.RETURN_URL, pathname);
                router.push(constants_1.Routes.LOGIN);
            }
        };
        getSession();
    }, [router]);
    return <>{children}</>;
};
exports.AuthRedirect = AuthRedirect;
//# sourceMappingURL=auth-redirect.js.map