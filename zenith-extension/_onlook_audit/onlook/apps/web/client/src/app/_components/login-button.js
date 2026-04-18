"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevLoginButton = exports.LoginButton = void 0;
const keys_1 = require("@/i18n/keys");
const auth_1 = require("@onlook/models/auth");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const next_intl_1 = require("next-intl");
const sonner_1 = require("sonner");
const auth_context_1 = require("../auth/auth-context");
const LoginButton = ({ className, returnUrl, method, icon, translationKey, providerName, }) => {
    const t = (0, next_intl_1.useTranslations)();
    const { lastSignInMethod, handleLogin, signingInMethod } = (0, auth_context_1.useAuthContext)();
    const isLastSignInMethod = lastSignInMethod === method;
    const isSigningIn = signingInMethod === method;
    const handleLoginClick = async () => {
        try {
            await handleLogin(method, returnUrl ?? null);
        }
        catch (error) {
            console.error(`Error signing in with ${providerName}:`, error);
            sonner_1.toast.error(`Error signing in with ${providerName}`, {
                description: error instanceof Error ? error.message : 'Please try again.',
            });
        }
    };
    return (<div className={(0, utils_1.cn)('flex flex-col items-center w-full', className)}>
            <button_1.Button variant="outline" className={(0, utils_1.cn)('w-full items-center justify-center text-active text-small', isLastSignInMethod
            ? 'bg-teal-100 dark:bg-teal-950 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-100 text-small hover:bg-teal-200/50 dark:hover:bg-teal-800 hover:border-teal-500/70 dark:hover:border-teal-500'
            : 'bg-background-onlook')} onClick={handleLoginClick} disabled={!!signingInMethod}>
                {isSigningIn ? (<icons_1.Icons.LoadingSpinner className="w-4 h-4 mr-2 animate-spin"/>) : (icon)}
    {t(keys_1.transKeys.welcome.login[translationKey])}
            </button_1.Button>
            {isLastSignInMethod && (<p className="text-teal-500 text-small mt-1">{t(keys_1.transKeys.welcome.login.lastUsed)}</p>)}
        </div>);
};
exports.LoginButton = LoginButton;
const DevLoginButton = ({ className, returnUrl, }) => {
    const t = (0, next_intl_1.useTranslations)();
    const { handleDevLogin, signingInMethod } = (0, auth_context_1.useAuthContext)();
    const isSigningIn = signingInMethod === auth_1.SignInMethod.DEV;
    return (<button_1.Button variant="outline" className="w-full text-active text-small" onClick={() => handleDevLogin(returnUrl)} disabled={!!signingInMethod}>
            {isSigningIn ? (<icons_1.Icons.LoadingSpinner className="w-4 h-4 mr-2 animate-spin"/>) : 'DEV MODE: Sign in as demo user'}
        </button_1.Button>);
};
exports.DevLoginButton = DevLoginButton;
//# sourceMappingURL=login-button.js.map