"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
const use_get_background_1 = require("@/hooks/use-get-background");
const card_1 = require("@onlook/ui/card");
const icons_1 = require("@onlook/ui/icons");
const navigation_1 = require("next/navigation");
const top_bar_1 = require("../_components/top-bar");
const Page = () => {
    const router = (0, navigation_1.useRouter)();
    const handleCardClick = (type) => {
        router.push(`/projects/import/${type}`);
    };
    const backgroundUrl = (0, use_get_background_1.useGetBackground)('create');
    return (<div className="w-screen h-screen flex flex-col" style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: `url(${backgroundUrl})`,
        }}>
            <top_bar_1.TopBar />
            <div className="flex items-center justify-center overflow-hidden max-w-4xl mx-auto w-full flex-1 gap-6 p-6 select-none">
                <card_1.Card className={`w-full h-64 cursor-pointer transition-all duration-200 bg-background/80 backdrop-blur-xl hover:shadow-lg hover:scale-[1.02] border-[0.5px] border-foreground-tertiary/50`} onClick={() => handleCardClick('local')} tabIndex={0} role="button" aria-label="Import local project">
                    <card_1.CardHeader className="flex flex-col justify-between h-full">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center select-none">
                            <icons_1.Icons.Upload className="w-6 h-6 text-primary"/>
                        </div>
                        <div className="space-y-2">
                            <card_1.CardTitle className="text-title3">Import a Local Project</card_1.CardTitle>
                            <card_1.CardDescription className="text-sm text-balance">
                                Select a directory from your computer to start working with your project in Onlook.
                            </card_1.CardDescription>
                        </div>
                    </card_1.CardHeader>
                </card_1.Card>
                {/* Temporary disabled */}
                <card_1.Card className={'w-full h-64 cursor-pointer transition-all duration-200 bg-background/80 backdrop-blur-xl hover:shadow-lg hover:scale-[1.02] border-[0.5px] border-foreground-tertiary/50 cursor-not-allowed opacity-60'} onClick={() => false && handleCardClick('github')} tabIndex={0} role="button" aria-label="Connect to GitHub">
                    <card_1.CardHeader className="flex flex-col justify-between h-full">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center select-none">
                            <icons_1.Icons.GitHubLogo className="w-6 h-6 text-primary"/>
                        </div>
                        <div className="space-y-2">
                            <card_1.CardTitle className="text-title3">Import from GitHub</card_1.CardTitle>
                            <card_1.CardDescription className="text-sm text-balance">
                                Connect your GitHub account to access and work with your repositories
                            </card_1.CardDescription>
                        </div>
                    </card_1.CardHeader>
                </card_1.Card>
            </div>
        </div>);
};
exports.default = Page;
//# sourceMappingURL=page.js.map