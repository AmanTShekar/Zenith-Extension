"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionCancelModal = void 0;
const button_1 = require("@onlook/ui/button");
const dialog_1 = require("@onlook/ui/dialog");
const SubscriptionCancelModal = ({ open, onOpenChange, onConfirmCancel }) => {
    return (<dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
            <dialog_1.DialogContent className="max-w-md">
                <dialog_1.DialogHeader>
                    <dialog_1.DialogTitle>Cancel Subscription</dialog_1.DialogTitle>
                    <dialog_1.DialogDescription className="pt-2">
                        Are you sure you want to cancel your subscription? You'll lose access to all premium features at the end of your current billing period.
                    </dialog_1.DialogDescription>
                </dialog_1.DialogHeader>
                <dialog_1.DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
                    <button_1.Button variant="outline" onClick={() => onOpenChange(false)} className="order-2 sm:order-1">
                        Keep Subscription
                    </button_1.Button>
                    <button_1.Button variant="outline" onClick={onConfirmCancel} className="order-1 sm:order-2 text-red-200 hover:text-red-100 hover:bg-red-500/10 border-red-200 hover:border-red-100">
                        Cancel Subscription
                    </button_1.Button>
                </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
};
exports.SubscriptionCancelModal = SubscriptionCancelModal;
//# sourceMappingURL=subscription-cancel-modal.js.map