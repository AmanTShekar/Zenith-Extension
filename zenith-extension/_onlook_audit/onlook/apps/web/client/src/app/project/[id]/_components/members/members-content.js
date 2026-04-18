"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersContent = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const index_1 = require("@onlook/ui/icons/index");
const invitation_row_1 = require("./invitation-row");
const invite_member_input_1 = require("./invite-member-input");
const member_row_1 = require("./member-row");
const suggested_teammates_1 = require("./suggested-teammates");
const MembersContent = () => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const projectId = editorEngine.projectId;
    const { data: members, isLoading: loadingMembers } = react_1.api.member.list.useQuery({
        projectId,
    });
    const { data: invitations, isLoading: loadingInvitations } = react_1.api.invitation.list.useQuery({
        projectId,
    });
    if (loadingMembers && loadingInvitations) {
        return <div className="h-32 gap-2 p-3 text-muted-foreground text-sm flex items-center justify-center">
            <index_1.Icons.LoadingSpinner className="h-6 w-6 animate-spin text-foreground-primary"/>
            <div className="text-sm">Loading members...</div>
        </div>;
    }
    return (<>
            <div className="border-b border-b-[0.5px] p-3 text-muted-foreground text-sm">
                Invite Team Members
            </div>
            <invite_member_input_1.InviteMemberInput projectId={projectId}/>
            {members?.map((member) => (<member_row_1.MemberRow key={member.user.id} user={member.user} role={member.role}/>))}
            {invitations?.map((invitation) => (<invitation_row_1.InvitationRow key={invitation.id} invitation={invitation}/>))}
            <suggested_teammates_1.SuggestedTeammates projectId={projectId}/>
        </>);
};
exports.MembersContent = MembersContent;
//# sourceMappingURL=members-content.js.map