"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitials = void 0;
const getInitials = (name) => {
    return name
        ?.split(' ')
        ?.map((word) => word[0])
        ?.join('')
        ?.toUpperCase();
};
exports.getInitials = getInitials;
//# sourceMappingURL=initials.js.map