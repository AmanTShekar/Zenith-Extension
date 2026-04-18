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
exports.Breadcrumb = Breadcrumb;
exports.BreadcrumbEllipsis = BreadcrumbEllipsis;
exports.BreadcrumbItem = BreadcrumbItem;
exports.BreadcrumbLink = BreadcrumbLink;
exports.BreadcrumbList = BreadcrumbList;
exports.BreadcrumbPage = BreadcrumbPage;
exports.BreadcrumbSeparator = BreadcrumbSeparator;
const react_icons_1 = require("@radix-ui/react-icons");
const react_slot_1 = require("@radix-ui/react-slot");
const React = __importStar(require("react"));
const utils_1 = require("../utils");
function Breadcrumb({ ...props }) {
    return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props}/>;
}
function BreadcrumbList({ className, ...props }) {
    return (<ol data-slot="breadcrumb-list" className={(0, utils_1.cn)('text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5', className)} {...props}/>);
}
function BreadcrumbItem({ className, ...props }) {
    return (<li data-slot="breadcrumb-item" className={(0, utils_1.cn)('inline-flex items-center gap-1.5', className)} {...props}/>);
}
function BreadcrumbLink({ asChild, className, ...props }) {
    const Comp = asChild ? react_slot_1.Slot : 'a';
    return (<Comp data-slot="breadcrumb-link" className={(0, utils_1.cn)('hover:text-foreground transition-colors', className)} {...props}/>);
}
function BreadcrumbPage({ className, ...props }) {
    return (<span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" className={(0, utils_1.cn)('text-foreground font-normal', className)} {...props}/>);
}
function BreadcrumbSeparator({ children, className, ...props }) {
    return (<li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={(0, utils_1.cn)('[&>svg]:size-3.5', className)} {...props}>
            {children ?? <react_icons_1.ChevronRightIcon />}
        </li>);
}
function BreadcrumbEllipsis({ className, ...props }) {
    return (<span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={(0, utils_1.cn)('flex size-9 items-center justify-center', className)} {...props}>
            <react_icons_1.DotsHorizontalIcon className="size-4"/>
            <span className="sr-only">More</span>
        </span>);
}
//# sourceMappingURL=breadcrumb.js.map