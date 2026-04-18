"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopBar = void 0;
const constants_1 = require("@/utils/constants");
const navigation_1 = require("@/utils/constants/navigation");
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const navigation_2 = require("next/navigation");
const react_1 = require("react");
const github_1 = require("./github");
const mega_menu_1 = require("./mega-menu");
const mobile_menu_1 = require("./mobile-menu");
const user_1 = require("./user");
const LINKS = [
    {
        href: constants_1.Routes.HOME,
        child: <icons_1.Icons.OnlookTextLogo className="h-3"/>,
    },
];
const TopBar = () => {
    const currentPath = (0, navigation_2.usePathname)();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, react_1.useState)(false);
    return (<div className="relative w-full max-w-6xl mx-auto flex items-center justify-between p-3 h-12 text-sm text-foreground-secondary select-none">
            {/* Left side - Logo and GitHub stars grouped together */}
            <div className="flex items-center gap-4 text-foreground-secondary">
                {LINKS.map((link) => (<a href={link.href} key={link.href} className={(0, utils_1.cn)('hover:opacity-80', currentPath === link.href && 'text-foreground-primary', link.href === constants_1.Routes.HOME && 'py-4 pr-2')}>
                        {link.child}
                    </a>))}
                
                {/* GitHub stars visible on mobile, grouped with logo */}
                <div className="md:hidden">
                    <github_1.GitHubButton />
                </div>

                {/* Desktop dropdowns - hidden on mobile */}
                <div className="hidden md:flex items-center gap-5 ml-3">
                    {navigation_1.NAVIGATION_CATEGORIES.map((category) => (<mega_menu_1.DropdownMenu key={category.label} label={category.label} links={category.links}/>))}
                    <github_1.GitHubButton />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
                {/* Auth button - hidden on mobile */}
                <div className="hidden md:block">
                    <user_1.AuthButton />
                </div>

                {/* Mobile menu */}
                <mobile_menu_1.MobileMenu isOpen={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}/>
            </div>
        </div>);
};
exports.TopBar = TopBar;
//# sourceMappingURL=index.js.map