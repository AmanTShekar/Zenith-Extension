"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = Main;
const react_1 = require("@/trpc/react");
const constants_1 = require("@/utils/constants");
const telemetry_1 = require("@/utils/telemetry");
const client_1 = require("@/utils/supabase/client");
const url_1 = require("@/utils/url");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const skeleton_1 = require("@onlook/ui/skeleton");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
function Main({ invitationId }) {
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const token = (0, navigation_1.useSearchParams)().get('token');
    const { data: invitation, isLoading: loadingInvitation, error: getInvitationError } = react_1.api.invitation.getWithoutToken.useQuery({
        id: invitationId,
    });
    const { mutate: acceptInvitation, isPending: isAcceptingInvitation, error: acceptInvitationError } = react_1.api.invitation.accept.useMutation({
        onSuccess: () => {
            if (invitation?.projectId) {
                router.push(`${constants_1.Routes.PROJECT}/${invitation.projectId}`);
            }
            else {
                router.push(constants_1.Routes.PROJECTS);
            }
        },
    });
    const handleReAuthenticate = async () => {
        const supabase = (0, client_1.createClient)();
        // Clear analytics/feedback identities before signing out
        void (0, telemetry_1.resetTelemetry)();
        await supabase.auth.signOut();
        const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        router.push(`${constants_1.Routes.LOGIN}?${(0, url_1.getReturnUrlQueryParam)(currentUrl)}`);
    };
    const error = getInvitationError || acceptInvitationError;
    if (loadingInvitation) {
        return (<div className="flex justify-center w-full h-full">
                <div className="flex flex-col items-center justify-center w-5/6 md:w-1/2 gap-4">
                    <skeleton_1.Skeleton className="w-full h-10"/>
                    <skeleton_1.Skeleton className="w-full h-40"/>
                    <div className="flex justify-center">
                        <skeleton_1.Skeleton className="w-full h-10 w-20"/>
                    </div>
                </div>
            </div>);
    }
    if (error) {
        return (<div className="flex flex-row w-full">
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-4">
                        <icons_1.Icons.ExclamationTriangle className="h-6 w-6"/>
                        <div className="text-2xl">Error accepting invitation</div>
                    </div>
                    <div className="text-md">
                        {error.message}
                    </div>
                    <div className="flex justify-center gap-4">
                        <button_1.Button type="button" variant="outline" onClick={() => {
                router.push(constants_1.Routes.PROJECTS);
            }}>
                            <icons_1.Icons.ArrowLeft className="h-4 w-4"/>
                            Back to home
                        </button_1.Button>
                        <button_1.Button type="button" onClick={handleReAuthenticate}>
                            Log in with different account
                        </button_1.Button>
                    </div>
                </div>
            </div>);
    }
    if (!invitation || !token) {
        return (<div className="flex flex-row w-full">
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center gap-4">
                        <icons_1.Icons.ExclamationTriangle className="h-6 w-6"/>
                        <div className="text-xl">Invitation not found</div>
                    </div>
                    <div className="text-md">
                        The invitation you are looking for does not exist or has expired.
                    </div>
                    <div className="flex justify-center">
                        <link_1.default href="/" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                            <icons_1.Icons.ArrowLeft className="h-4 w-4"/>
                            Back to home
                        </link_1.default>
                    </div>
                </div>
            </div>);
    }
    const inviter = invitation.inviter.firstName ?? invitation.inviter.displayName ?? invitation.inviter.email;
    return (<div className="flex flex-row w-full">
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <div className="text-xl">Join {inviter} on Onlook</div>
                <div className="text-md text-foreground-tertiary">
                    {inviter} has invited you to join their project
                </div>
                <div className="flex justify-center">
                    <button_1.Button type="button" onClick={() => {
            acceptInvitation({
                id: invitationId,
                token: token,
            });
        }} disabled={!token || isAcceptingInvitation}>
                        Accept Invitation
                    </button_1.Button>
                </div>
            </div>
        </div>);
}
//# sourceMappingURL=main.js.map