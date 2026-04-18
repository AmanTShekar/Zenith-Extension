"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberRow = void 0;
const avatar_1 = require("@onlook/ui/avatar");
const utility_1 = require("@onlook/utility");
const MemberRow = ({ user, role }) => {
    const initials = (0, utility_1.getInitials)(user.displayName ?? '');
    return (<div className="py-2 px-3 flex gap-2 items-center">
            <avatar_1.Avatar>
                {user?.avatarUrl && <avatar_1.AvatarImage src={user.avatarUrl} alt={initials}/>}
                <avatar_1.AvatarFallback>{initials}</avatar_1.AvatarFallback>
            </avatar_1.Avatar>
            <div className="flex flex-col justify-center gap-0.5 flex-1">
                <div>{user.firstName ?? user.displayName}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
        </div>);
};
exports.MemberRow = MemberRow;
//# sourceMappingURL=member-row.js.map