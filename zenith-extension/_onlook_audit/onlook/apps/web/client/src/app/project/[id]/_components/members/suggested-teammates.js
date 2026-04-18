"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestedTeammates = void 0;
const react_1 = require("@/trpc/react");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const SuggestedTeammates = ({ projectId }) => {
    const apiUtils = react_1.api.useUtils();
    const { data: suggestedUsers } = react_1.api.invitation.suggested.useQuery({ projectId });
    const createInvitationMutation = react_1.api.invitation.create.useMutation({
        onSuccess: () => {
            apiUtils.invitation.suggested.invalidate();
            apiUtils.invitation.list.invalidate();
        },
    });
    if (suggestedUsers?.length === 0) {
        return <div className="h-2"></div>;
    }
    return (<div className="flex flex-col gap-2 p-3">
            <separator_1.Separator />
            <div className="space-y-0.5">
                <div className="text-sm">Suggested Teammates</div>
                <div className="text-xs text-muted-foreground">
                    Invite relevant people to collaborate
                </div>
            </div>
            <div className="flex gap-0.5">
                {suggestedUsers?.map((email) => (<button_1.Button variant="secondary" size="sm" className="rounded-xl font-normal" onClick={() => {
                createInvitationMutation.mutate({
                    projectId,
                    inviteeEmail: email,
                    role: models_1.ProjectRole.ADMIN,
                });
            }}>
                        {email}
                        <icons_1.Icons.PlusCircled className="ml-1 size-4"/>
                    </button_1.Button>))}
            </div>
        </div>);
};
exports.SuggestedTeammates = SuggestedTeammates;
//# sourceMappingURL=suggested-teammates.js.map