"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Versions = void 0;
const Context_1 = require("@/components/Context");
const accordion_1 = require("@onlook/ui/accordion");
const button_1 = require("@onlook/ui/button");
const index_1 = require("@onlook/ui/icons/index");
const separator_1 = require("@onlook/ui/separator");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = __importStar(require("react"));
const Version_1 = require("./EmptyState/Version");
const VersionRow_1 = require("./VersionRow");
exports.Versions = (0, mobx_react_lite_1.observer)(() => {
    const projectsManager = (0, Context_1.useProjectsManager)();
    const commits = projectsManager.versions?.commits;
    const [commitToRename, setCommitToRename] = (0, react_1.useState)(null);
    // Group commits by date
    const groupedCommits = commits?.reduce((acc, commit) => {
        const date = new Date(commit.timestamp * 1000);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let dateKey;
        if (date.toDateString() === today.toDateString()) {
            dateKey = 'Today';
        }
        else if (date.toDateString() === yesterday.toDateString()) {
            dateKey = 'Yesterday';
        }
        else {
            // Format the date in a more human-readable way
            dateKey = date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        }
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(commit);
        return acc;
    }, {});
    const handleNewBackup = async () => {
        const res = await projectsManager.versions?.createCommit();
        if (!res?.success) {
            console.error('Failed to create commit. Reason code:', res?.errorReason);
            return;
        }
        const latestCommit = projectsManager.versions?.latestCommit;
        if (!latestCommit) {
            console.error('No latest commit found');
            return;
        }
        setCommitToRename(latestCommit.oid);
    };
    return (<div className="flex flex-col text-sm">
            <div className="flex flex-row items-center justify-between gap-2 px-6 py-6">
                <h2 className="text-lg">Versions</h2>
                {commits && commits.length > 0 ? (<button_1.Button variant="outline" className="ml-auto text-sm font-normal bg-background-secondary rounded" size="sm" onClick={handleNewBackup} disabled={projectsManager.versions?.isSaving}>
                        {projectsManager.versions?.isSaving ? (<index_1.Icons.Shadow className="h-4 w-4 mr-2 animate-spin"/>) : (<index_1.Icons.Plus className="h-4 w-4 mr-2"/>)}
                        {projectsManager.versions?.isSaving ? 'Saving...' : 'New backup'}
                    </button_1.Button>) : null}
            </div>
            <separator_1.Separator />

            {commits && commits.length > 0 ? (<div className="flex flex-col gap-2">
                    <accordion_1.Accordion type="multiple" defaultValue={Object.keys(groupedCommits || {})}>
                        {groupedCommits &&
                Object.entries(groupedCommits).map(([date, dateCommits]) => (<accordion_1.AccordionItem key={date} value={date}>
                                    <accordion_1.AccordionTrigger className="text-base font-normal text-muted-foreground py-4 px-6">
                                        {date}
                                    </accordion_1.AccordionTrigger>
                                    <accordion_1.AccordionContent>
                                        <div className="flex flex-col">
                                            {dateCommits.map((commit, index) => (<react_1.default.Fragment key={commit.oid}>
                                                    <VersionRow_1.VersionRow commit={commit} type={date === 'Today'
                            ? VersionRow_1.VersionRowType.TODAY
                            : VersionRow_1.VersionRowType.PREVIOUS_DAYS} autoRename={commit.oid === commitToRename} onRename={() => setCommitToRename(null)}/>
                                                    {index < dateCommits.length - 1 && (<separator_1.Separator className="mx-6 w-[calc(100%-theme(spacing.12))] bg-border"/>)}
                                                </react_1.default.Fragment>))}
                                        </div>
                                    </accordion_1.AccordionContent>
                                </accordion_1.AccordionItem>))}
                    </accordion_1.Accordion>
                </div>) : (<Version_1.NoVersions />)}
        </div>);
});
//# sourceMappingURL=Versions.js.map