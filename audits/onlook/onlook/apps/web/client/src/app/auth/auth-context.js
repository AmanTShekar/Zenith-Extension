"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthContext = exports.AuthProvider = void 0;
const constants_1 = require("@/utils/constants");
const auth_1 = require("@onlook/models/auth");
const localforage_1 = __importDefault(require("localforage"));
const react_1 = require("react");
const actions_1 = require("../login/actions");
const LAST_SIGN_IN_METHOD_KEY = 'lastSignInMethod';
const AuthContext = (0, react_1.createContext)(undefined);
const AuthProvider = ({ children }) => {
    const [lastSignInMethod, setLastSignInMethod] = (0, react_1.useState)(null);
    const [signingInMethod, setSigningInMethod] = (0, react_1.useState)(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const getLastSignInMethod = async () => {
            const lastSignInMethod = await localforage_1.default.getItem(LAST_SIGN_IN_METHOD_KEY);
            setLastSignInMethod(lastSignInMethod);
        };
        getLastSignInMethod();
    }, []);
    const handleLogin = async (method, returnUrl) => {
        try {
            setSigningInMethod(method);
            if (returnUrl) {
                await localforage_1.default.setItem(constants_1.LocalForageKeys.RETURN_URL, returnUrl);
            }
            await localforage_1.default.setItem(LAST_SIGN_IN_METHOD_KEY, method);
            await (0, actions_1.login)(method);
        }
        catch (error) {
            console.error('Error signing in with method:', method, error);
            throw error;
        }
        finally {
            setSigningInMethod(null);
        }
    };
    const handleDevLogin = async (returnUrl) => {
        try {
            setSigningInMethod(auth_1.SignInMethod.DEV);
            if (returnUrl) {
                await localforage_1.default.setItem(constants_1.LocalForageKeys.RETURN_URL, returnUrl);
            }
            await (0, actions_1.devLogin)();
        }
        catch (error) {
            console.error('Error signing in with password:', error);
        }
        finally {
            setSigningInMethod(null);
        }
    };
    return (<AuthContext.Provider value={{ signingInMethod, lastSignInMethod, handleLogin, handleDevLogin, isAuthModalOpen, setIsAuthModalOpen }}>
            {children}
        </AuthContext.Provider>);
};
exports.AuthProvider = AuthProvider;
const useAuthContext = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within a AuthProvider');
    }
    return context;
};
exports.useAuthContext = useAuthContext;
//# sourceMappingURL=auth-context.js.map