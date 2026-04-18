"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationRow = void 0;
const env_1 = require("@/env");
const react_1 = require("@/trpc/react");
const email_1 = require("@onlook/email");
const avatar_1 = require("@onlook/ui/avatar");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const sonner_1 = require("@onlook/ui/sonner");
const tooltip_1 = require("@onlook/ui/tooltip");
const utility_1 = require("@onlook/utility");
const react_2 = require("react");
const InvitationRow = ({ invitation }) => {
    const apiUtils = react_1.api.useUtils();
    const initials = (0, utility_1.getInitials)(invitation.inviteeEmail ?? '');
    const [isCopied, setIsCopied] = (0, react_2.useState)(false);
    const cancelInvitationMutation = react_1.api.invitation.delete.useMutation({
        onSuccess: () => {
            apiUtils.invitation.list.invalidate();
        },
    });
    const copyInvitationLink = async () => {
        try {
            await navigator.clipboard.writeText((0, email_1.constructInvitationLink)(env_1.env.NEXT_PUBLIC_SITE_URL, invitation.id, invitation.token));
            setIsCopied(true);
            sonner_1.toast.success('Invitation link copied to clipboard');
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        }
        catch (error) {
            console.error('Failed to copy invitation link:', error);
            sonner_1.toast.error('Failed to copy invitation link');
            setIsCopied(false);
        }
    };
    return (<div className="py-2 px-3 flex gap-2 items-center">
            <avatar_1.Avatar>
                <avatar_1.AvatarFallback>{initials}</avatar_1.AvatarFallback>
            </avatar_1.Avatar>
            <div className="flex flex-col justify-center gap-0.5 text-muted-foreground text-sm flex-1">
                <div>Pending Invitation</div>
                <div className="truncate text-xs">{invitation.inviteeEmail}</div>
            </div>
            <div className="flex flex-row items-center justify-center ">
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger>
                        <button_1.Button variant="ghost" size="icon" onClick={copyInvitationLink}>
                            {isCopied ? <icons_1.Icons.Check className="size-4 text-muted-foreground transition-colors"/> : <icons_1.Icons.Copy className="size-4 text-muted-foreground transition-colors"/>}
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent>
                        {isCopied ? 'Copied to clipboard' : 'Copy Invitation Link'}
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
                <tooltip_1.Tooltip>
                    <tooltip_1.TooltipTrigger>
                        <button_1.Button variant="ghost" size="icon" onClick={() => {
            cancelInvitationMutation.mutate({ id: invitation.id });
        }}>
                            <icons_1.Icons.MailX className="size-4 text-muted-foreground transition-colors"/>
                        </button_1.Button>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent>
                        Cancel Invitation
                    </tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>
            </div>
        </div>);
};
exports.InvitationRow = InvitationRow;
//# sourceMappingURL=invitation-row.js.map