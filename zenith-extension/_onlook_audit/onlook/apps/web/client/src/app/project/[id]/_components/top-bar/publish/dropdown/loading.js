"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingState = void 0;
const type_1 = require("@/components/store/hosting/type");
const button_1 = require("@onlook/ui/button");
const progress_1 = require("@onlook/ui/progress");
const react_1 = require("react");
const LoadingState = ({ type }) => {
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const { deployment, cancel } = (0, type_1.useHostingType)(type);
    const handleCancel = async () => {
        setIsLoading(true);
        await cancel();
        setIsLoading(false);
    };
    return (<div className="p-4 flex flex-col gap-2">
            <p className="text-foreground-primary">{type === 'preview' ? 'Base' : 'Custom'} domain</p>
            <p className="text-foreground-secondary">{deployment?.message}</p>
            <progress_1.Progress value={deployment?.progress ?? 0} className="w-full"/>
            <div className="flex mt-2 justify-end gap-2">
                <button_1.Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
                    Cancel
                </button_1.Button>
            </div>
        </div>);
};
exports.LoadingState = LoadingState;
//# sourceMappingURL=loading.js.map