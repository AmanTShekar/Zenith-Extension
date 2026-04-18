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
exports.PageSelector = void 0;
const editor_1 = require("@/components/store/editor");
const models_1 = require("@onlook/models");
const button_1 = require("@onlook/ui/button");
const dropdown_menu_1 = require("@onlook/ui/dropdown-menu");
const icons_1 = require("@onlook/ui/icons");
const separator_1 = require("@onlook/ui/separator");
const utils_1 = require("@onlook/ui/utils");
const utility_1 = require("@onlook/utility");
const mobx_react_lite_1 = require("mobx-react-lite");
const react_1 = __importStar(require("react"));
const hover_tooltip_1 = require("../../../editor-bar/hover-tooltip");
const page_modal_1 = require("../../../left-panel/design-panel/page-tab/page-modal");
exports.PageSelector = (0, mobx_react_lite_1.observer)(({ frame, className, tooltipSide = "top", showIcon = false, buttonSize = "sm", buttonClassName }) => {
    const editorEngine = (0, editor_1.useEditorEngine)();
    const [showCreateModal, setShowCreateModal] = (0, react_1.useState)(false);
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    // Get inferred current page from URL immediately
    const inferredCurrentPage = (0, react_1.useMemo)(() => (0, utility_1.inferPageFromUrl)(frame.url), [frame.url]);
    // Flatten the page tree to get all pages for finding current page
    const flattenPages = (pages) => {
        return pages.reduce((acc, page) => {
            acc.push(page);
            if (page.children) {
                acc.push(...flattenPages(page.children));
            }
            return acc;
        }, []);
    };
    const allPages = (0, react_1.useMemo)(() => {
        return flattenPages(editorEngine.pages.tree);
    }, [editorEngine.pages.tree]);
    // Find the current page based on the frame URL
    const currentPage = (0, react_1.useMemo)(() => {
        const framePathname = new URL(frame.url).pathname;
        return allPages.find(page => {
            const pagePath = page.path === '/' ? '' : page.path;
            return (0, utility_1.pathsEqual)(framePathname, pagePath) || (0, utility_1.pathsEqual)(framePathname, page.path);
        });
    }, [frame.url, allPages]);
    // Render pages recursively with indentation
    const renderPageItems = (pages, depth = 0) => {
        const items = [];
        for (const page of pages) {
            const isCurrentPage = currentPage?.id === page.id;
            const hasChildren = page.children && page.children.length > 0;
            items.push(<dropdown_menu_1.DropdownMenuItem key={page.id} onClick={() => handlePageSelect(page)} className={(0, utils_1.cn)("cursor-pointer", isCurrentPage && "bg-accent")}>
                    <div className="flex items-center w-full" style={{ paddingLeft: `${depth * 16}px` }}>
                        {hasChildren ? (<icons_1.Icons.Directory className="w-4 h-4 mr-2"/>) : (<icons_1.Icons.File className="w-4 h-4 mr-2"/>)}
                        <span className="truncate">{page.name}</span>
                        {isCurrentPage && (<icons_1.Icons.Check className="ml-auto h-3 w-3"/>)}
                    </div>
                </dropdown_menu_1.DropdownMenuItem>);
            // Render children recursively
            if (page.children && page.children.length > 0) {
                items.push(...renderPageItems(page.children, depth + 1));
            }
        }
        return items;
    };
    const displayPages = (0, react_1.useMemo)(() => {
        if (allPages.length > 0) {
            return allPages;
        }
        // Temp page while scanning
        return [{
                id: 'temp-current',
                name: inferredCurrentPage.name,
                path: inferredCurrentPage.path,
                children: [],
                isActive: true,
                isRoot: inferredCurrentPage.path === '/',
                metadata: {}
            }];
    }, [allPages, inferredCurrentPage]);
    const displayCurrentPage = currentPage ?? {
        name: inferredCurrentPage.name,
        path: inferredCurrentPage.path
    };
    const handlePageSelect = async (page) => {
        try {
            await editorEngine.frames.navigateToPath(frame.id, page.path);
        }
        catch (error) {
            console.error('Failed to navigate to page:', error);
        }
    };
    const handleManagePages = () => {
        editorEngine.state.leftPanelTab = models_1.LeftPanelTabValue.PAGES;
        editorEngine.state.leftPanelLocked = true;
    };
    return (<dropdown_menu_1.DropdownMenu open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (open) {
                editorEngine.frames.select([frame]);
            }
        }}>
            <hover_tooltip_1.HoverOnlyTooltip content="Page" side={tooltipSide} className="mb-1" hideArrow disabled={isOpen}>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                    <button_1.Button variant="ghost" size={buttonSize} className={(0, utils_1.cn)("h-auto px-2 py-1 text-xs hover:!bg-transparent focus:!bg-transparent active:!bg-transparent", buttonClassName, className)}>
                        {showIcon && <icons_1.Icons.File className="w-4 h-4 mr-2"/>}
                        <span className="max-w-24 truncate">
                            {displayCurrentPage.name}
                        </span>
                    </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
            </hover_tooltip_1.HoverOnlyTooltip>
            <dropdown_menu_1.DropdownMenuContent align="start" className="w-48">
                {displayPages.length > 0 ? (<>
                        {allPages.length > 0 ? (
            // Show full scanned tree when available
            renderPageItems(editorEngine.pages.tree)) : (
            // Show inferred current page while scanning
            <>
                                {displayPages[0] && (<dropdown_menu_1.DropdownMenuItem onClick={() => {
                        const firstPage = displayPages[0];
                        if (firstPage) {
                            void handlePageSelect(firstPage);
                        }
                    }} className="cursor-pointer bg-accent">
                                        <div className="flex items-center w-full">
                                            <icons_1.Icons.File className="w-4 h-4 mr-2"/>
                                            <span className="truncate">{displayPages[0].name}</span>
                                            <icons_1.Icons.Check className="ml-auto h-3 w-3"/>
                                        </div>
                                    </dropdown_menu_1.DropdownMenuItem>)}
                                {editorEngine.pages.isScanning && (<dropdown_menu_1.DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                        <icons_1.Icons.LoadingSpinner className="w-3 h-3 mr-2 animate-spin"/>
                                        <span>Scanning pages...</span>
                                    </dropdown_menu_1.DropdownMenuItem>)}
                            </>)}
                    </>) : (<dropdown_menu_1.DropdownMenuItem disabled>
                        No pages available
                    </dropdown_menu_1.DropdownMenuItem>)}
                <separator_1.Separator />
                <dropdown_menu_1.DropdownMenuItem className="cursor-pointer " onClick={() => setShowCreateModal(true)}>
                    <icons_1.Icons.FilePlus />
                    <span>
                        New Page
                    </span>
                </dropdown_menu_1.DropdownMenuItem>
                <dropdown_menu_1.DropdownMenuItem className="cursor-pointer" onClick={handleManagePages}>
                    <icons_1.Icons.Gear />
                    <span>
                        Manage Pages
                    </span>
                </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
            <page_modal_1.PageModal mode="create" open={showCreateModal} onOpenChange={setShowCreateModal}/>

        </dropdown_menu_1.DropdownMenu>);
});
//# sourceMappingURL=page-selector.js.map