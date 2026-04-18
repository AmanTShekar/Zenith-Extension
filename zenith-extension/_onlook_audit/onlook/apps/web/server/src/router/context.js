"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
function createContext({ req, res }) {
    const user = { name: req.headers.username ?? 'anonymous' };
    return { req, res, user };
}
//# sourceMappingURL=context.js.map