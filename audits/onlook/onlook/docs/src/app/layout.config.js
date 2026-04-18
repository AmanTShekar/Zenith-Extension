"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseOptions = void 0;
const icons_1 = require("@onlook/ui/icons");
/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
exports.baseOptions = {
    nav: {
        title: (<div className="flex items-center gap-2">
                <icons_1.Icons.OnlookLogo className="w-4 h-4"/>
                <span>Onlook Docs</span>
            </div>),
    },
    links: [
        {
            type: 'main',
            text: 'GitHub',
            url: 'https://github.com/onlook-dev/onlook',
            external: true,
            icon: <icons_1.Icons.GitHubLogo className="w-4 h-4"/>
        },
        {
            type: 'main',
            text: 'Discord',
            url: 'https://discord.gg/hERDfFZCsH',
            external: true,
            icon: <icons_1.Icons.DiscordLogo className="w-4 h-4"/>
        }
    ]
};
//# sourceMappingURL=layout.config.js.map