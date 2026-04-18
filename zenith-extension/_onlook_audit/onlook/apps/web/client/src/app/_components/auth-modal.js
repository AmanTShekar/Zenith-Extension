"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModal = AuthModal;
const keys_1 = require("@/i18n/keys");
const alert_dialog_1 = require("@onlook/ui/alert-dialog");
const button_1 = require("@onlook/ui/button");
const next_intl_1 = require("next-intl");
const auth_context_1 = require("../auth/auth-context");
const login_button_1 = require("./login-button");
const auth_1 = require("@onlook/models/auth");
const icons_1 = require("@onlook/ui/icons");
function AuthModal() {
    const { setIsAuthModalOpen, isAuthModalOpen } = (0, auth_context_1.useAuthContext)();
    const t = (0, next_intl_1.useTranslations)();
    return (<alert_dialog_1.AlertDialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
            <alert_dialog_1.AlertDialogContent className="!max-w-sm bg-black">
                <alert_dialog_1.AlertDialogHeader>
                    <alert_dialog_1.AlertDialogTitle className="text-center text-xl font-normal">
                        {t(keys_1.transKeys.welcome.login.loginToEdit)}
                    </alert_dialog_1.AlertDialogTitle>
                    <alert_dialog_1.AlertDialogDescription className="text-center text-balance">
                        {t(keys_1.transKeys.welcome.login.shareProjects)}
                    </alert_dialog_1.AlertDialogDescription>
                </alert_dialog_1.AlertDialogHeader>
                <div className="space-y-2 flex flex-col">
                    <login_button_1.LoginButton className="!bg-black" method={auth_1.SignInMethod.GITHUB} icon={<icons_1.Icons.GitHubLogo className="w-4 h-4 mr-2"/>} translationKey="github" providerName="GitHub"/>
                    <login_button_1.LoginButton className="!bg-black" method={auth_1.SignInMethod.GOOGLE} icon={<icons_1.Icons.GoogleLogo viewBox="0 0 24 24" className="w-4 h-4 mr-2"/>} translationKey="google" providerName="Google"/>
                </div>
                <alert_dialog_1.AlertDialogFooter className="flex !justify-center w-full">
                    <button_1.Button variant={'ghost'} onClick={() => setIsAuthModalOpen(false)}>
                        {t(keys_1.transKeys.projects.actions.close)}
                    </button_1.Button>
                </alert_dialog_1.AlertDialogFooter>
            </alert_dialog_1.AlertDialogContent>
        </alert_dialog_1.AlertDialog>);
}
//# sourceMappingURL=auth-modal.js.map