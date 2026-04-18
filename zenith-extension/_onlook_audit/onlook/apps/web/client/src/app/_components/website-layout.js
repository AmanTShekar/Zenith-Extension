"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteLayout = WebsiteLayout;
const top_bar_1 = require("./top-bar");
const page_footer_1 = require("./landing-page/page-footer");
function WebsiteLayout({ children, showFooter = true }) {
    return (<div className="min-h-screen bg-background">
            {/* Fixed TopBar that persists across page transitions */}
            <div className="fixed top-0 left-0 w-full h-12 bg-background/80 backdrop-blur-sm z-50 top-bar">
                <top_bar_1.TopBar />
            </div>
            
            {/* Page content */}
            <div>
                {children}
            </div>
            
            {/* Footer */}
            {showFooter && <page_footer_1.Footer />}
        </div>);
}
//# sourceMappingURL=website-layout.js.map