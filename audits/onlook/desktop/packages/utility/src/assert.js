"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNever = assertNever;
function assertNever(n) {
    throw new Error(`Expected \`never\`, found: ${JSON.stringify(n)}`);
}
//# sourceMappingURL=assert.js.map