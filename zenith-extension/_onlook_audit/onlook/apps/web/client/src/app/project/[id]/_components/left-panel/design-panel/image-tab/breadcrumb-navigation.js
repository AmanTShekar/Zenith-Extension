"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreadcrumbNavigation = void 0;
const breadcrumb_1 = require("@onlook/ui/breadcrumb");
const icons_1 = require("@onlook/ui/icons");
const BreadcrumbNavigation = ({ breadcrumbSegments, onNavigate }) => {
    return (<breadcrumb_1.Breadcrumb>
            <breadcrumb_1.BreadcrumbList className='gap-1 sm:gap-1'>
                <breadcrumb_1.BreadcrumbItem>
                    <breadcrumb_1.BreadcrumbLink className="cursor-pointer hover:text-foreground-primary" onClick={() => onNavigate('/')}>
                        Root
                    </breadcrumb_1.BreadcrumbLink>
                </breadcrumb_1.BreadcrumbItem>
                {breadcrumbSegments.map((segment, index) => (<div className="flex items-center gap-1" key={segment.path}>
                        <breadcrumb_1.BreadcrumbSeparator className="p-0 m-0">
                            <icons_1.Icons.ChevronRight className="w-3 h-3 p-0 m-0"/>
                        </breadcrumb_1.BreadcrumbSeparator>
                        <breadcrumb_1.BreadcrumbItem key={segment.path}>
                            <breadcrumb_1.BreadcrumbLink className={index === breadcrumbSegments.length - 1
                ? "text-foreground-primary font-medium"
                : "cursor-pointer hover:text-foreground-primary"} onClick={() => index !== breadcrumbSegments.length - 1 && onNavigate(segment.path)}>
                                {segment.name}
                            </breadcrumb_1.BreadcrumbLink>
                        </breadcrumb_1.BreadcrumbItem>
                    </div>))}
            </breadcrumb_1.BreadcrumbList>
        </breadcrumb_1.Breadcrumb>);
};
exports.BreadcrumbNavigation = BreadcrumbNavigation;
//# sourceMappingURL=breadcrumb-navigation.js.map