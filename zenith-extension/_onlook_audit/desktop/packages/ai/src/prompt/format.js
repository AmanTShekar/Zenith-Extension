"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FENCE = void 0;
const searchReplace = {
    start: '<<<<<<< SEARCH',
    middle: '=======',
    end: '>>>>>>> REPLACE',
};
const code = {
    start: '```',
    end: '```',
};
const FENCE = {
    searchReplace,
    code,
};
exports.FENCE = FENCE;
//# sourceMappingURL=format.js.map