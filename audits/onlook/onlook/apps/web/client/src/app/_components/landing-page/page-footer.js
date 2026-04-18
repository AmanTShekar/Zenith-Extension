"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = Footer;
const constants_1 = require("@/utils/constants");
const icons_1 = require("@onlook/ui/icons");
const navigation_1 = require("next/navigation");
const illustrations_1 = require("./illustrations");
function Footer() {
    const router = (0, navigation_1.useRouter)();
    return (<footer className="w-full text-foreground-primary border-t border-foreground-primary/10 mt-24 pb-24">
            <div className="max-w-6xl mx-auto px-8 pt-16 pb-24 flex flex-col md:flex-row md:items-start gap-24">
                {/* Left: Logo */}
                <div className="flex flex-col gap-8 cursor-pointer" onClick={() => router.push('/')}>
                    <icons_1.Icons.OnlookTextLogo className="w-24 h-5 text-foreground-primary"/>
                </div>
                {/* Center: Links */}
                <div className="flex-1 flex flex-col md:flex-row gap-12 md:gap-12 justify-center">
                    <div>
                        <h3 className="text-regularPlus mb-4 text-foreground-primary">Company</h3>
                        <ul className="flex flex-col gap-4 text-regular text-foreground-secondary">
                            <li><a href={constants_1.Routes.ABOUT} className="hover:underline">About</a></li>
                            <li><a href={constants_1.ExternalRoutes.DOCS} target="_blank" className="hover:underline" title="View Onlook documentation">Docs</a></li>
                            <li><a href={constants_1.Routes.FAQ} className="hover:underline" title="Frequently Asked Questions">FAQ</a></li>
                            <li><a href={constants_1.ExternalRoutes.BLOG} target="_blank" className="hover:underline" title="Read the Onlook blog">Blog</a></li>
                            <li><a href="mailto:contact@onlook.com" className="hover:underline" title="Contact Onlook support">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-regularPlus mb-4 text-foreground-primary">Product</h3>
                        <ul className="flex flex-col gap-4 text-regular text-foreground-secondary">
                            <li><a href={constants_1.Routes.PROJECTS} className="hover:underline" title="View your projects">My Projects</a></li>
                            <li><a href={constants_1.ExternalRoutes.GITHUB} target="_blank" className="hover:underline" title="View Onlook on GitHub">GitHub Repo</a></li>
                            <li><a href="/features" className="hover:underline" title="View Onlook features">Features</a></li>
                            <li><a href={constants_1.Routes.FEATURES_AI} className="hover:underline" title="AI-powered development tools">AI</a></li>
                            <li><a href={constants_1.Routes.FEATURES_AI_FRONTEND} className="hover:underline" title="AI constrained to your design system">AI for Frontend</a></li>
                            <li><a href={constants_1.Routes.FEATURES_PROTOTYPE} className="hover:underline" title="Rapid prototyping features">Prototyping</a></li>
                            <li><a href={constants_1.Routes.FEATURES_BUILDER} className="hover:underline" title="Visual builder tools">Visual Builder</a></li>
                            <li><a href="/pricing" className="hover:underline" title="View Onlook pricing">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-regularPlus mb-4 text-foreground-primary">Workflows</h3>
                        <ul className="flex flex-col gap-4 text-regular text-foreground-secondary">
                            <li><a href={constants_1.Routes.WORKFLOWS_CLAUDE_CODE} className="hover:underline" title="Use Onlook with Claude Code">Claude Code</a></li>
                            <li><a href={constants_1.Routes.WORKFLOWS_VIBE_CODING} className="hover:underline" title="Vibe coding for teams">Vibe Coding</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-regularPlus mb-4 text-foreground-primary">Follow Us</h3>
                        <div className="flex gap-6 mt-2 items-center">
                            <a href={constants_1.ExternalRoutes.X} target="_blank" rel="noopener noreferrer" title="Follow Onlook on X">
                                <icons_1.Icons.SocialX className="w-6 h-6 text-foreground-secondary hover:text-foreground-primary transition-colors"/>
                            </a>
                            <a href={constants_1.ExternalRoutes.LINKEDIN} target="_blank" rel="noopener noreferrer" title="Connect with Onlook on LinkedIn">
                                <icons_1.Icons.SocialLinkedIn className="w-6 h-6 text-foreground-secondary hover:text-foreground-primary transition-colors"/>
                            </a>
                            <a href={constants_1.ExternalRoutes.SUBSTACK} target="_blank" rel="noopener noreferrer" title="Subscribe to Onlook on Substack">
                                <icons_1.Icons.SocialSubstack className="w-6 h-6 text-foreground-secondary hover:text-foreground-primary transition-colors"/>
                            </a>
                            <a href={constants_1.ExternalRoutes.YOUTUBE} target="_blank" rel="noopener noreferrer" title="Watch Onlook on YouTube">
                                <icons_1.Icons.SocialYoutube className="w-6 h-6 text-foreground-secondary hover:text-foreground-primary transition-colors"/>
                            </a>
                            <a href={constants_1.ExternalRoutes.GITHUB} target="_blank" rel="noopener noreferrer" title="View Onlook on GitHub">
                                <icons_1.Icons.GitHubLogo className="w-5.5 h-5.5 text-foreground-secondary hover:text-foreground-primary transition-colors"/>
                            </a>
                            <a href={constants_1.ExternalRoutes.DISCORD} target="_blank" rel="noopener noreferrer" title="Join the Onlook Discord community">
                                <icons_1.Icons.DiscordLogo className="w-6 h-6 text-foreground-secondary hover:text-foreground-primary transition-colors"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* Bottom Bar */}
            <div className="max-w-6xl mx-auto px-8 pb-4 pt-24">
                <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between w-full gap-0 md:gap-4 border-t border-foreground-primary/10 pt-6">
                    {/* Center: Links */}
                    <div className="flex gap-8 text-foreground-tertiary text-small justify-center w-full md:w-auto mb-4 md:mb-0">
                        <a href="/terms-of-service" className="hover:underline" title="Read our Terms of Service">Terms of Service</a>
                        <a href="/privacy-policy" className="hover:underline" title="Read our Privacy Policy">Privacy Policy</a>
                        <a href="/site-map" className="hover:underline" title="View the sitemap">Sitemap</a>
                    </div>
                    {/* Right: Copyright */}
                    <div className="text-foreground-tertiary text-small w-full md:w-auto flex justify-center md:justify-end">© {new Date().getFullYear()} On Off, Inc.</div>
                </div>
            </div>
            <div className="max-w-5xl mx-auto px-8 pb-4 pt-24 flex justify-center">
                <illustrations_1.Illustrations.OnlookLogoSeal className="w-full h-full [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] text-foreground-primary/20"/>
            </div>
        </footer>);
}
//# sourceMappingURL=page-footer.js.map