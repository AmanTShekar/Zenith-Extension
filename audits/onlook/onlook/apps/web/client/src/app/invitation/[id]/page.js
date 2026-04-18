"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;
const main_1 = require("./_components/main");
async function Page({ params }) {
    const id = (await params).id;
    return <main_1.Main invitationId={id}/>;
}
//# sourceMappingURL=page.js.map