"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteMemberInput = void 0;
const react_1 = require("@/trpc/react");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const input_1 = require("@onlook/ui/input");
const sonner_1 = require("@onlook/ui/sonner");
const react_2 = require("react");
const InviteMemberInput = ({ projectId }) => {
    const apiUtils = react_1.api.useUtils();
    const [email, setEmail] = (0, react_2.useState)('');
    const [selectedRole, setSelectedRole] = (0, react_2.useState)(models_1.ProjectRole.ADMIN);
    const [isLoading, setIsLoading] = (0, react_2.useState)(false);
    const createInvitation = react_1.api.invitation.create.useMutation({
        onSuccess: () => {
            apiUtils.invitation.list.invalidate();
            apiUtils.invitation.suggested.invalidate();
        },
        onError: (error) => {
            sonner_1.toast.error('Failed to invite member', {
                description: error instanceof Error ? error.message : String(error),
            });
        },
    });
    const handleSubmit = async (e) => {
        try {
            setIsLoading(true);
            e.preventDefault();
            await createInvitation.mutateAsync({
                inviteeEmail: email,
                role: selectedRole,
                projectId: projectId,
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<form className="flex items-center gap-2 p-3 border-b justify-between" onSubmit={handleSubmit}>
            <div className="flex flex-1 items-center gap-2 relative">
                <input_1.Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Add email address" className="flex-1"/>
                {/* <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as ProjectRole)}
        >
            <SelectTrigger className="w-22 text-xs border-0 p-2 rounded-tl-none rounded-bl-none focus:ring-0 bg-transparent absolute right-0">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ProjectRole.ADMIN}>
                    <div className="flex flex-col">
                        <span>Admin</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select> */}
            </div>
            <button_1.Button type="submit" disabled={!email || isLoading}>
                Invite
            </button_1.Button>
        </form>);
};
exports.InviteMemberInput = InviteMemberInput;
//# sourceMappingURL=invite-member-input.js.map