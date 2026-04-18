"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructInvitationLink = exports.sendInvitationEmail = void 0;
const constants_1 = require("@onlook/constants");
const components_1 = require("@react-email/components");
const templates_1 = require("./templates");
const sendInvitationEmail = async (...params) => {
    const [client, inviteParams, { dryRun = false } = {}] = params;
    const { inviteeEmail, invitedByEmail, invitedByName } = inviteParams;
    if (dryRun) {
        const rendered = await (0, components_1.render)((0, templates_1.InviteUserEmail)(inviteParams));
        console.log(rendered);
        return;
    }
    return await client.emails.send({
        from: `Onlook <${constants_1.SUPPORT_EMAIL}>`,
        to: inviteeEmail,
        subject: `Join ${invitedByName ?? invitedByEmail} on Onlook`,
        react: (0, templates_1.InviteUserEmail)(inviteParams),
    });
};
exports.sendInvitationEmail = sendInvitationEmail;
const constructInvitationLink = (publicUrl, invitationId, token) => {
    const url = new URL(`/invitation/${invitationId}`, publicUrl);
    url.searchParams.set('token', token);
    return url.toString();
};
exports.constructInvitationLink = constructInvitationLink;
//# sourceMappingURL=invitation.js.map