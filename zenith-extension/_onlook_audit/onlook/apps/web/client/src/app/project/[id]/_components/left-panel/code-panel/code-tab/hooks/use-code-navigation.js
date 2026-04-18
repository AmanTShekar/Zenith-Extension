"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCodeNavigation = useCodeNavigation;
const editor_1 = require("@/components/store/editor");
const utility_1 = require("@onlook/utility");
const mobx_1 = require("mobx");
const react_1 = require("react");
const isNavigationTargetEqual = (navigationTarget1, navigationTarget2) => {
    if (!navigationTarget1 || !navigationTarget2) {
        return false;
    }
    return (0, utility_1.pathsEqual)(navigationTarget1.filePath, navigationTarget2.filePath)
        && navigationTarget1.range.start.line === navigationTarget2.range.start.line
        && navigationTarget1.range.start.column === navigationTarget2.range.start.column
        && navigationTarget1.range.end.line === navigationTarget2.range.end.line
        && navigationTarget1.range.end.column === navigationTarget2.range.end.column;
};
function useCodeNavigation() {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const savedNavigationTarget = (0, react_1.useRef)(null);
    const [navigationTarget, setNavigationTarget] = (0, react_1.useState)(null);
    const lastSelected = (0, react_1.useRef)(editorEngine.elements.selected);
    const lastOverride = (0, react_1.useRef)(editorEngine.ide.codeNavigationOverride);
    (0, react_1.useEffect)(() => {
        const disposer = (0, mobx_1.reaction)(() => ({
            selected: editorEngine.elements.selected,
            override: editorEngine.ide.codeNavigationOverride
        }), async ({ selected: selectedElements, override }) => {
            const selectionChanged = selectedElements !== lastSelected.current;
            const overrideChanged = override !== lastOverride.current;
            lastSelected.current = selectedElements;
            lastOverride.current = override;
            // If override changed most recently, use it
            if (overrideChanged && override) {
                if (isNavigationTargetEqual(override, savedNavigationTarget.current)) {
                    return;
                }
                savedNavigationTarget.current = override;
                setNavigationTarget(override);
                return;
            }
            // If selection changed most recently (or override was cleared), process selection
            if (selectionChanged || (overrideChanged && !override)) {
                const [selectedElement] = selectedElements;
                if (!selectedElement) {
                    setNavigationTarget(null);
                    return;
                }
                const oid = selectedElement.instanceId ?? selectedElement.oid;
                if (!oid) {
                    console.warn('[CodeNavigation] No OID found for selected element');
                    return;
                }
                try {
                    const branchData = editorEngine.branches.getBranchDataById(selectedElement.branchId);
                    if (!branchData) {
                        console.warn(`[CodeNavigation] No branch data found for branchId: ${selectedElement.branchId}`);
                        return;
                    }
                    const metadata = await branchData.codeEditor.getJsxElementMetadata(oid);
                    if (!metadata) {
                        console.warn(`[CodeNavigation] No metadata found for OID: ${oid}`);
                        return;
                    }
                    const startLine = metadata.startTag.start.line;
                    const startColumn = metadata.startTag.start.column;
                    const endTag = metadata.endTag || metadata.startTag;
                    const endLine = endTag.end.line;
                    const endColumn = endTag.end.column;
                    const target = {
                        filePath: metadata.path,
                        range: {
                            start: { line: startLine, column: startColumn },
                            end: { line: endLine, column: endColumn }
                        }
                    };
                    if (isNavigationTargetEqual(target, savedNavigationTarget.current)) {
                        return;
                    }
                    savedNavigationTarget.current = target;
                    setNavigationTarget(target);
                }
                catch (error) {
                    console.error('[CodeNavigation] Error getting element metadata:', error);
                    setNavigationTarget(null);
                }
            }
        }, { fireImmediately: true });
        return () => disposer();
    }, []);
    return navigationTarget;
}
//# sourceMappingURL=use-code-navigation.js.map