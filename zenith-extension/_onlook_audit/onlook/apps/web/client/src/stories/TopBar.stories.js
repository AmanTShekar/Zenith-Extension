"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playground = exports.WithAvatar = exports.NoSearch = exports.LongSearchQuery = exports.WithManyRecentSearches = exports.MinimalUser = exports.LoggedOut = exports.CreatingProject = exports.WithSearch = exports.Default = void 0;
const top_bar_presentation_1 = require("@/app/projects/_components/top-bar-presentation");
const test_1 = require("@storybook/test");
/**
 * TopBar displays the main navigation bar with logo, search, create dropdown, and user avatar.
 */
const meta = {
    title: 'Projects/TopBar',
    component: top_bar_presentation_1.TopBarPresentation,
    parameters: {
        layout: 'fullscreen',
        backgrounds: {
            default: 'dark',
        },
    },
    tags: ['autodocs'],
    argTypes: {
        user: {
            description: 'Current user data',
        },
        searchQuery: {
            control: 'text',
            description: 'Current search query',
        },
        isCreatingProject: {
            control: 'boolean',
            description: 'Whether a project is being created',
        },
        recentSearches: {
            control: 'object',
            description: 'Array of recent search queries',
        },
    },
};
exports.default = meta;
// Mock user data
const mockUser = {
    id: 'user-123',
    firstName: 'Jane',
    lastName: 'Doe',
    displayName: 'Jane Doe',
    email: 'jane@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-11-01'),
    stripeCustomerId: null,
    githubInstallationId: null,
};
// Action callbacks
const onCreateBlank = (0, test_1.fn)();
const onImport = (0, test_1.fn)();
const onSearchChange = (0, test_1.fn)();
/**
 * Default top bar with logged-in user
 */
exports.Default = {
    args: {
        user: mockUser,
        searchQuery: '',
        onSearchChange,
        recentSearches: [],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
        homeRoute: '/',
    },
};
/**
 * Top bar with active search query
 */
exports.WithSearch = {
    args: {
        user: mockUser,
        searchQuery: 'dashboard',
        onSearchChange,
        recentSearches: ['dashboard', 'landing', 'admin', 'portfolio'],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
    },
};
/**
 * Top bar while creating a project
 */
exports.CreatingProject = {
    args: {
        user: mockUser,
        searchQuery: '',
        onSearchChange,
        recentSearches: [],
        isCreatingProject: true,
        onCreateBlank,
        onImport,
    },
};
/**
 * Top bar for logged-out user
 */
exports.LoggedOut = {
    args: {
        user: null,
        searchQuery: '',
        onSearchChange,
        recentSearches: [],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
    },
};
/**
 * Top bar with minimal user data
 */
exports.MinimalUser = {
    args: {
        user: {
            id: 'user-456',
            firstName: null,
            lastName: null,
            displayName: null,
            email: 'minimal@example.com',
            avatarUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            stripeCustomerId: null,
            githubInstallationId: null,
        },
        searchQuery: '',
        onSearchChange,
        recentSearches: [],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
    },
};
/**
 * Top bar with many recent searches
 */
exports.WithManyRecentSearches = {
    args: {
        user: mockUser,
        searchQuery: 'd',
        onSearchChange,
        recentSearches: [
            'dashboard',
            'design system',
            'docs',
            'data visualization',
            'development',
            'deployment',
        ],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
    },
};
/**
 * Top bar with long search query
 */
exports.LongSearchQuery = {
    args: {
        user: mockUser,
        searchQuery: 'this is a very long search query that users might type',
        onSearchChange,
        recentSearches: [],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
    },
};
/**
 * Top bar without search functionality
 */
exports.NoSearch = {
    args: {
        user: mockUser,
        searchQuery: undefined,
        onSearchChange: undefined,
        recentSearches: [],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
    },
};
/**
 * Top bar with user with avatar
 */
exports.WithAvatar = {
    args: {
        user: {
            ...mockUser,
            displayName: 'John Smith',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        },
        searchQuery: '',
        onSearchChange,
        recentSearches: [],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
    },
};
/**
 * Interactive playground to test all states
 */
exports.Playground = {
    args: {
        user: mockUser,
        searchQuery: '',
        onSearchChange,
        recentSearches: ['dashboard', 'admin', 'landing'],
        isCreatingProject: false,
        onCreateBlank,
        onImport,
        homeRoute: '/',
    },
};
//# sourceMappingURL=TopBar.stories.js.map