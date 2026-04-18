"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const use_get_background_1 = require("@/hooks/use-get-background");
const keys_1 = require("@/i18n/keys");
const constants_1 = require("@/utils/constants");
const auth_1 = require("@onlook/models/auth");
const icons_1 = require("@onlook/ui/icons");
const next_intl_1 = require("next-intl");
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const login_button_1 = require("../_components/login-button");
function LoginPage() {
    const isDev = process.env.NODE_ENV === 'development';
    const t = (0, next_intl_1.useTranslations)();
    const backgroundUrl = (0, use_get_background_1.useGetBackground)('login');
    const returnUrl = (0, navigation_1.useSearchParams)().get(constants_1.LocalForageKeys.RETURN_URL);
    return (<div className="flex h-screen w-screen justify-center">
            <div className="flex flex-col justify-between w-full h-full max-w-xl p-16 space-y-8 overflow-auto">
                <div className="flex items-center space-x-2">
                    <link_1.default href={constants_1.Routes.HOME} className="hover:opacity-80 transition-opacity">
                        <icons_1.Icons.OnlookTextLogo viewBox="0 0 139 17"/>
                    </link_1.default>
                </div>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-title1 leading-tight">
                            {t(keys_1.transKeys.welcome.title)}
                        </h1>
                        <p className="text-foreground-onlook text-regular">
                            {t(keys_1.transKeys.welcome.description)}
                        </p>
                    </div>
                    <div className="space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
                        <login_button_1.LoginButton returnUrl={returnUrl} method={auth_1.SignInMethod.GITHUB} icon={<icons_1.Icons.GitHubLogo className="w-4 h-4 mr-2"/>} translationKey="github" providerName="GitHub"/>
                        <login_button_1.LoginButton returnUrl={returnUrl} method={auth_1.SignInMethod.GOOGLE} icon={<icons_1.Icons.GoogleLogo viewBox="0 0 24 24" className="w-4 h-4 mr-2"/>} translationKey="google" providerName="Google"/>
                    </div>
                    {isDev && <login_button_1.DevLoginButton returnUrl={returnUrl}/>}
                    <p className="text-small text-foreground-onlook">
                        {t(keys_1.transKeys.welcome.terms.agreement)}{' '}
                        <link_1.default href="https://onlook.com/privacy-policy" target="_blank" className="text-gray-300 hover:text-gray-50 underline transition-colors duration-200">
                            {t(keys_1.transKeys.welcome.terms.privacy)}
                        </link_1.default>
                        {' '}
                        {t(keys_1.transKeys.welcome.terms.and)}{' '}
                        <link_1.default href="https://onlook.com/terms-of-service" target="_blank" className="text-gray-300 hover:text-gray-50 underline transition-colors duration-200">
                            {t(keys_1.transKeys.welcome.terms.tos)}
                        </link_1.default>
                    </p>
                </div>
                <div className="flex flex-row space-x-1 text-small text-gray-600">
                    <p>{t(keys_1.transKeys.welcome.version, { version: '1.0.0' })}</p>
                </div>
            </div>
            <div className="hidden w-full md:block m-6">
                <image_1.default className="w-full h-full object-cover rounded-xl" src={backgroundUrl} alt="Onlook dunes dark" width={1000} height={1000}/>
            </div>
        </div>);
}
//# sourceMappingURL=page.js.map