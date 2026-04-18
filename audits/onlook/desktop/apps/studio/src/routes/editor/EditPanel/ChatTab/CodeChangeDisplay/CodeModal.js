"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CodeModal;
const Context_1 = require("@/components/Context");
const button_1 = require("@onlook/ui/button");
const dialog_1 = require("@onlook/ui/dialog");
const icons_1 = require("@onlook/ui/icons");
const tabs_1 = require("@onlook/ui/tabs");
const react_1 = require("react");
const CodeBlock_1 = require("./CodeBlock");
const CodeDiff_1 = require("./CodeDiff");
var TabValue;
(function (TabValue) {
    TabValue["BLOCK"] = "diff";
    TabValue["DIFF"] = "block";
})(TabValue || (TabValue = {}));
function CodeModal({ fileName, value, original, children, }) {
    const editorEngine = (0, Context_1.useEditorEngine)();
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [selectedTab, setSelectedTab] = (0, react_1.useState)(TabValue.DIFF);
    return (<dialog_1.Dialog open={isOpen} onOpenChange={setIsOpen}>
            <dialog_1.DialogTrigger asChild>{children}</dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="min-w-[90vw] h-[80vh]">
                <dialog_1.DialogTitle className="sr-only">{fileName}</dialog_1.DialogTitle>
                <tabs_1.Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val)}>
                    <tabs_1.TabsList className="bg-transparent w-full gap-2 justify-start">
                        <tabs_1.TabsTrigger value={TabValue.DIFF} className="bg-transparent py-2 px-1 hover:text-foreground-hover">
                            Diffs
                        </tabs_1.TabsTrigger>
                        <tabs_1.TabsTrigger value={TabValue.BLOCK} className="bg-transparent py-2 px-1 hover:text-foreground-hover">
                            Full Code
                        </tabs_1.TabsTrigger>
                        <button_1.Button className="ml-auto gap-2" variant={'ghost'} onClick={() => editorEngine.code.viewSourceFile(fileName)}>
                            {'View source'} <icons_1.Icons.ExternalLink />
                        </button_1.Button>
                    </tabs_1.TabsList>
                    <tabs_1.TabsContent value={TabValue.DIFF}>
                        <div className="flex flex-col space-y-6 h-[70vh] overflow-auto border rounded">
                            <CodeDiff_1.CodeDiff originalCode={original} modifiedCode={value}/>
                        </div>
                    </tabs_1.TabsContent>
                    <tabs_1.TabsContent value={TabValue.BLOCK}>
                        <div className="flex flex-col space-y-6 h-[70vh] overflow-auto border rounded">
                            <CodeBlock_1.CodeBlock className="h-full" code={value}/>
                        </div>
                    </tabs_1.TabsContent>
                </tabs_1.Tabs>
            </dialog_1.DialogContent>
        </dialog_1.Dialog>);
}
//# sourceMappingURL=CodeModal.js.map