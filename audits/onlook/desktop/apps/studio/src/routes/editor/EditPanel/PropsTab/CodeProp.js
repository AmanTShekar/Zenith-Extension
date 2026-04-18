"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const CodeProp = ({ onClick }) => {
    return (<button_1.Button className="w-32 flex items-center text-smallPlus justify-center bg-background-secondary hover:bg-background-tertiary disabled:text-foreground-onlook h-8 px-2.5 rounded-l-md hover:text-foreground-active/90 transition-all duration-300 ease-in-out" variant={'secondary'} onClick={onClick}>
            <index_1.Icons.Code className="h-4 w-4 mr-2"/> Edit code
        </button_1.Button>);
};
exports.default = CodeProp;
//# sourceMappingURL=CodeProp.js.map