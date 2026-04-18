"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpgradePrompt = void 0;
const button_1 = require("@onlook/ui/button");
const UpgradePrompt = ({ onClick }) => {
    return (<div className="rounded-md p-4 border bg-blue-600/10 text-blue-600 border-blue-600 dark:bg-blue-950 dark:border-blue-600 dark:text-blue-100">
            <p className="text-sm flex items-center gap-2">
                You must be on Onlook Pro to use a custom Domain.
                <button_1.Button variant="link" className="px-2 h-auto p-0 text-blue-600 hover:text-blue-700 dark:text-blue-100 dark:hover:text-blue-200 font-medium" onClick={onClick}>
                    Upgrade today!
                </button_1.Button>
            </p>
        </div>);
};
exports.UpgradePrompt = UpgradePrompt;
//# sourceMappingURL=upgrade-prompt.js.map