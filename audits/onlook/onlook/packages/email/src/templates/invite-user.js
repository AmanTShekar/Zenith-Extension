"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteUserEmail = void 0;
const components_1 = require("@react-email/components");
const InviteUserEmail = ({ inviteeEmail, invitedByName, invitedByEmail, inviteLink, }) => {
    const previewText = `Join ${invitedByName ?? invitedByEmail} on Onlook`;
    const headingText = `Join ${invitedByName ?? invitedByEmail} on Onlook`;
    return (<components_1.Html>
            <components_1.Head />
            <components_1.Tailwind>
                <components_1.Body className="mx-auto my-auto bg-white px-2 font-sans">
                    <components_1.Preview>{previewText}</components_1.Preview>
                    <components_1.Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
                        <components_1.Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
                            {headingText}
                        </components_1.Heading>
                        <components_1.Text className="text-[14px] leading-[24px] text-black">Hello,</components_1.Text>
                        <components_1.Text className="text-[14px] leading-[24px] text-black">
                            <components_1.Link href={`mailto:${invitedByEmail}`} className="mr-1 text-blue-600 no-underline">
                                <strong>{invitedByName ?? invitedByEmail}</strong>
                            </components_1.Link>
                            <span>
                                has invited you to their project on <strong>Onlook</strong>.
                            </span>
                        </components_1.Text>
                        <components_1.Section className="mt-[32px] mb-[32px] text-center">
                            <components_1.Button className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline" href={inviteLink}>
                                Join the project
                            </components_1.Button>
                        </components_1.Section>
                        <components_1.Text className="text-[14px] leading-[24px] text-black">
                            or copy and paste this URL into your browser:{' '}
                            <components_1.Link href={inviteLink} className="text-blue-600 no-underline">
                                {inviteLink}
                            </components_1.Link>
                        </components_1.Text>
                        <components_1.Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]"/>
                        <components_1.Text className="text-[12px] leading-[24px] text-[#666666]">
                            This invitation was intended for{' '}
                            <span className="text-black">{inviteeEmail}</span>. If you were not
                            expecting this invitation, you can ignore this email. If you are
                            concerned about your account's safety, please reply to this email to get
                            in touch with us.
                        </components_1.Text>
                    </components_1.Container>
                </components_1.Body>
            </components_1.Tailwind>
        </components_1.Html>);
};
exports.InviteUserEmail = InviteUserEmail;
exports.default = exports.InviteUserEmail;
//# sourceMappingURL=invite-user.js.map