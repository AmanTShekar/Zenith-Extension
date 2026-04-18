"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDeleteSection = void 0;
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const client_1 = require("@/utils/supabase/client");
const button_1 = require("@onlook/ui/button");
const dialog_1 = require("@onlook/ui/dialog");
const input_1 = require("@onlook/ui/input");
const label_1 = require("@onlook/ui/label");
const sonner_1 = require("@onlook/ui/sonner");
const mobx_react_lite_1 = require("mobx-react-lite");
const navigation_1 = require("next/navigation");
const react_2 = require("react");
exports.UserDeleteSection = (0, mobx_react_lite_1.observer)(() => {
    const router = (0, navigation_1.useRouter)();
    const { data: user } = react_1.api.user.get.useQuery();
    const [showDeleteModal, setShowDeleteModal] = (0, react_2.useState)(false);
    const [deleteEmail, setDeleteEmail] = (0, react_2.useState)('');
    const [deleteConfirmText, setDeleteConfirmText] = (0, react_2.useState)('');
    const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = (0, react_2.useState)(false);
    const { mutateAsync: deleteUser } = react_1.api.user.delete.useMutation();
    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };
    const handleDeleteConfirm = () => {
        setShowDeleteModal(false);
        setShowFinalDeleteConfirm(true);
    };
    const handleFinalDeleteAccount = async () => {
        try {
            await deleteUser();
            await handleDeleteSuccess();
        }
        catch (error) {
            sonner_1.toast.error('Failed to delete account');
            console.error('Failed to delete account', error);
        }
    };
    const handleDeleteSuccess = async () => {
        sonner_1.toast.success('Account deleted successfully');
        // Reset form
        setShowFinalDeleteConfirm(false);
        setDeleteEmail('');
        setDeleteConfirmText('');
        // Sign out
        const supabase = (0, client_1.createClient)();
        await supabase.auth.signOut();
        router.push(constants_1.Routes.LOGIN);
    };
    const canProceedWithDelete = deleteEmail === user?.email && deleteConfirmText === 'DELETE';
    return (<>
            {/* Delete Account Section */}
            <div className="flex items-center justify-between py-4">
                <div className="space-y-1">
                    <p className="text-regularPlus font-medium">Delete Account</p>
                    <p className="text-small text-muted-foreground">
                        Permanently delete your account and all associated data
                    </p>
                </div>
                <button_1.Button variant="outline" size="sm" onClick={handleDeleteAccount} className="text-red-200 hover:text-red-100 border-red-200 hover:border-red-100 hover:bg-red-500/10">
                    Delete
                </button_1.Button>
            </div>

            {/* Delete Account Confirmation Modal */}
            <dialog_1.Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <dialog_1.DialogContent className="max-w-lg">
                    <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle>Delete account - are you sure?</dialog_1.DialogTitle>
                        <dialog_1.DialogDescription asChild className="pt-2">
                            <div className="space-y-2">
                                <p>Deleting your account will:</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>Permanently delete your account and prevent you from creating new projects.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>Delete all of your projects from Onlook's servers.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>You cannot create a new account using the same email address.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>This will also permanently delete your chat history and other data associated with your account.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>Deleting an account does not automatically cancel your subscription or entitled set of paid features.</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="mt-0.5">•</span>
                                        <span>This is final and cannot be undone.</span>
                                    </div>
                                </div>
                            </div>
                        </dialog_1.DialogDescription>
                    </dialog_1.DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label_1.Label htmlFor="delete-email">Please type your account email:</label_1.Label>
                            <input_1.Input id="delete-email" type="email" value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} placeholder={user?.email || ''} className="w-full"/>
                        </div>
                        <div className="space-y-2">
                            <label_1.Label htmlFor="delete-confirm">To proceed, type "DELETE" in the input field below:</label_1.Label>
                            <input_1.Input id="delete-confirm" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" className="w-full"/>
                        </div>
                    </div>
                    <dialog_1.DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
                        <button_1.Button variant="outline" onClick={() => {
            setShowDeleteModal(false);
            setDeleteEmail('');
            setDeleteConfirmText('');
        }} className="order-2 sm:order-1">
                            Cancel
                        </button_1.Button>
                        <button_1.Button onClick={handleDeleteConfirm} disabled={!canProceedWithDelete} className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500">
                            {canProceedWithDelete ? 'Delete Account' : 'Locked'}
                        </button_1.Button>
                    </dialog_1.DialogFooter>
                </dialog_1.DialogContent>
            </dialog_1.Dialog>

            {/* Final Delete Confirmation Modal */}
            <dialog_1.Dialog open={showFinalDeleteConfirm} onOpenChange={setShowFinalDeleteConfirm}>
                <dialog_1.DialogContent className="max-w-md">
                    <dialog_1.DialogHeader>
                        <dialog_1.DialogTitle>Final confirmation</dialog_1.DialogTitle>
                        <dialog_1.DialogDescription className="pt-2">
                            This is your last chance to cancel. Are you absolutely sure you want to permanently delete your account and all associated data?
                        </dialog_1.DialogDescription>
                    </dialog_1.DialogHeader>
                    <dialog_1.DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
                        <button_1.Button variant="outline" onClick={() => {
            setShowFinalDeleteConfirm(false);
            setDeleteEmail('');
            setDeleteConfirmText('');
        }} className="order-2 sm:order-1">
                            Cancel
                        </button_1.Button>
                        <button_1.Button onClick={handleFinalDeleteAccount} className="order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white">
                            Yes, Delete My Account
                        </button_1.Button>
                    </dialog_1.DialogFooter>
                </dialog_1.DialogContent>
            </dialog_1.Dialog>
        </>);
});
//# sourceMappingURL=user-delete-section.js.map