"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Page;
const constants_1 = require("@/utils/constants");
const navigation_1 = require("next/navigation");
function Page() {
    (0, navigation_1.redirect)(constants_1.Routes.PROJECTS);
}
//# sourceMappingURL=page.js.map