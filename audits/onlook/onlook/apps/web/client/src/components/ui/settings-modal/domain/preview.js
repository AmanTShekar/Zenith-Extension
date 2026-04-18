"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewDomain = void 0;
const editor_1 = require("@/components/store/editor");
const react_1 = require("@/trpc/react");
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const input_1 = require("@onlook/ui/input");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const link_1 = __importDefault(require("next/link"));
exports.PreviewDomain = (0, mobx_react_lite_1.observer)(() => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const { data: domains } = react_1.api.domain.getAll.useQuery({ projectId: editorEngine.projectId });
    const preview = domains?.preview;
    if (!preview) {
        return <div>No preview domain found</div>;
    }
    const lastUpdated = preview.publishedAt ? (0, utility_1.timeAgo)(preview.publishedAt) : null;
    const baseUrl = preview.url;
    const validUrl = (0, utility_1.getValidUrl)(baseUrl);
    return (<div className="space-y-4 flex flex-col">
            <h2 className="text-lg">Base Domain</h2>
            <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                    <div className="w-1/3">
                        <p className="text-regularPlus text-muted-foreground">URL</p>
                        <p className="text-small text-muted-foreground">
                            {lastUpdated ? `Updated ${lastUpdated} ago` : 'Not published'}
                        </p>
                    </div>
                    <div className="flex gap-2 flex-1">
                        <input_1.Input value={baseUrl} disabled className="bg-muted"/>
                        <link_1.default href={validUrl} target="_blank" className="text-sm">
                            <button_1.Button variant="ghost" size="icon">
                                <icons_1.Icons.ExternalLink className="h-4 w-4"/>
                            </button_1.Button>
                        </link_1.default>
                    </div>
                </div>
            </div>
        </div>);
});
//# sourceMappingURL=preview.js.map