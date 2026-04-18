"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditButton = EditButton;
const button_1 = require("@onlook/ui/button");
function EditButton({ href, className, children }) {
    return (<button_1.Button onClick={() => {
            window.open(href, '_blank');
        }} variant="secondary" size="sm" className={className}>
            {children}
        </button_1.Button>);
}
//# sourceMappingURL=edit-button.js.map