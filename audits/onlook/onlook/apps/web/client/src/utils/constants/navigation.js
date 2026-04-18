"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAVIGATION_CATEGORIES = exports.ABOUT_LINKS = exports.RESOURCES_LINKS = exports.PRODUCT_LINKS = void 0;
const index_1 = require("./index");
exports.PRODUCT_LINKS = [
    {
        title: 'AI',
        href: index_1.Routes.FEATURES_AI,
        description: 'AI-powered design',
    },
    {
        title: 'AI for Frontend',
        href: index_1.Routes.FEATURES_AI_FRONTEND,
        description: 'AI constrained to your design system',
    },
    {
        title: 'Visual Builder',
        href: index_1.Routes.FEATURES_BUILDER,
        description: 'Craft on a canvas',
    },
    {
        title: 'Prototyping',
        href: index_1.Routes.FEATURES_PROTOTYPE,
        description: 'Rapid prototype creation',
    },
    {
        title: 'Claude Code',
        href: index_1.Routes.WORKFLOWS_CLAUDE_CODE,
        description: 'Visual layer for Claude Code',
    },
    {
        title: 'Vibe Coding',
        href: index_1.Routes.WORKFLOWS_VIBE_CODING,
        description: 'Team collaboration for vibe coding',
    },
    {
        title: 'All Features',
        href: index_1.Routes.FEATURES,
        description: 'See everything Onlook offers',
    },
];
exports.RESOURCES_LINKS = [
    {
        title: 'Documentation',
        href: index_1.ExternalRoutes.DOCS,
        description: 'Learn how to use Onlook',
        external: true,
    },
    {
        title: 'Blog',
        href: index_1.ExternalRoutes.BLOG,
        description: 'News and updates',
        external: true,
    },
    {
        title: 'GitHub',
        href: index_1.ExternalRoutes.GITHUB,
        description: 'View the source code',
        external: true,
    },
    {
        title: 'Discord',
        href: index_1.ExternalRoutes.DISCORD,
        description: 'Join our community',
        external: true,
    },
];
exports.ABOUT_LINKS = [
    {
        title: 'About Us',
        href: index_1.Routes.ABOUT,
        description: 'Learn about our mission',
    },
    {
        title: 'FAQ',
        href: index_1.Routes.FAQ,
        description: 'Common questions',
    },
    {
        title: 'Book a Demo',
        href: index_1.ExternalRoutes.BOOK_DEMO,
        description: 'Schedule a demo with our team',
        external: true,
    },
];
exports.NAVIGATION_CATEGORIES = [
    { label: 'Product', links: exports.PRODUCT_LINKS },
    { label: 'Resources', links: exports.RESOURCES_LINKS },
    { label: 'About', links: exports.ABOUT_LINKS },
];
//# sourceMappingURL=navigation.js.map