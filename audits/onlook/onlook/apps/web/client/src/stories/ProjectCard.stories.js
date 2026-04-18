"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlternativeImage = exports.Minimal = exports.WideAspect = exports.SquareAspect = exports.WithSearchHighlight = exports.LongName = exports.OldProject = exports.RecentlyUpdated = exports.NoImage = exports.Default = void 0;
const project_card_1 = require("@/app/projects/_components/select/project-card");
const highlight_text_1 = require("@/app/projects/_components/select/highlight-text");
/**
 * ProjectCard displays individual project information with hover effects,
 * preview images, and interactive elements like edit and settings buttons.
 */
const meta = {
    title: 'Projects/ProjectCard',
    component: project_card_1.ProjectCard,
    parameters: {
        layout: 'padded',
        backgrounds: {
            default: 'dark',
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (<div className="max-w-md">
        <Story />
      </div>),
    ],
    argTypes: {
        aspectRatio: {
            control: 'select',
            options: ['aspect-[4/2.6]', 'aspect-[4/2.8]', 'aspect-square', 'aspect-video'],
            description: 'The aspect ratio of the card',
        },
        searchQuery: {
            control: 'text',
            description: 'Search query to highlight in project name and description',
        },
    },
};
exports.default = meta;
// Helper function to create mock projects
const createMockProject = (overrides) => ({
    id: 'proj-123',
    name: 'E-commerce Dashboard',
    metadata: {
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-11-01'),
        previewImg: {
            type: 'url',
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
            updatedAt: new Date('2024-11-01'),
        },
        description: 'Modern dashboard for managing online store',
        tags: ['react', 'next.js', 'tailwind'],
    },
    ...overrides,
});
// Mock refetch function
const mockRefetch = () => {
    console.log('Refetch triggered');
};
/**
 * Default project card with image preview
 */
exports.Default = {
    args: {
        project: createMockProject(),
        refetch: mockRefetch,
        aspectRatio: 'aspect-[4/2.6]',
        searchQuery: '',
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Project card without a preview image
 */
exports.NoImage = {
    args: {
        project: createMockProject({
            name: 'New Blank Project',
            metadata: {
                createdAt: new Date('2024-11-04'),
                updatedAt: new Date('2024-11-04'),
                previewImg: null,
                description: 'Fresh project ready for development',
                tags: ['blank'],
            },
        }),
        refetch: mockRefetch,
        aspectRatio: 'aspect-[4/2.6]',
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Recently updated project (shows "just now")
 */
exports.RecentlyUpdated = {
    args: {
        project: createMockProject({
            name: 'Portfolio Site',
            metadata: {
                createdAt: new Date('2024-10-01'),
                updatedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
                previewImg: {
                    type: 'url',
                    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80',
                    updatedAt: new Date(),
                },
                description: 'Personal portfolio with Next.js',
                tags: ['portfolio', 'personal'],
            },
        }),
        refetch: mockRefetch,
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Old project (hasn't been updated in a while)
 */
exports.OldProject = {
    args: {
        project: createMockProject({
            name: 'Legacy Admin Panel',
            metadata: {
                createdAt: new Date('2023-01-15'),
                updatedAt: new Date('2023-06-20'),
                previewImg: {
                    type: 'url',
                    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
                    updatedAt: new Date('2023-06-20'),
                },
                description: 'Admin panel from last year',
                tags: ['legacy', 'admin'],
            },
        }),
        refetch: mockRefetch,
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Long project name that will truncate
 */
exports.LongName = {
    args: {
        project: createMockProject({
            name: 'Super Long Project Name That Should Truncate When Display',
            metadata: {
                createdAt: new Date('2024-09-01'),
                updatedAt: new Date('2024-10-15'),
                previewImg: {
                    type: 'url',
                    url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80',
                    updatedAt: new Date('2024-10-15'),
                },
                description: 'This is also a very long description that might need to be handled',
                tags: ['test'],
            },
        }),
        refetch: mockRefetch,
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Project with search query highlighting
 */
exports.WithSearchHighlight = {
    args: {
        project: createMockProject({
            name: 'Dashboard Analytics',
            metadata: {
                createdAt: new Date('2024-08-01'),
                updatedAt: new Date('2024-10-20'),
                previewImg: {
                    type: 'url',
                    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
                    updatedAt: new Date('2024-10-20'),
                },
                description: 'Real-time dashboard for analytics',
                tags: ['analytics', 'dashboard'],
            },
        }),
        refetch: mockRefetch,
        searchQuery: 'dash',
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Square aspect ratio variant
 */
exports.SquareAspect = {
    args: {
        project: createMockProject({
            name: 'Mobile App Design',
            metadata: {
                createdAt: new Date('2024-07-01'),
                updatedAt: new Date('2024-10-30'),
                previewImg: {
                    type: 'url',
                    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
                    updatedAt: new Date('2024-10-30'),
                },
                description: 'Mobile-first design system',
                tags: ['mobile', 'design-system'],
            },
        }),
        refetch: mockRefetch,
        aspectRatio: 'aspect-square',
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Wide aspect ratio variant
 */
exports.WideAspect = {
    args: {
        project: createMockProject({
            name: 'Landing Page',
            metadata: {
                createdAt: new Date('2024-09-15'),
                updatedAt: new Date('2024-11-02'),
                previewImg: {
                    type: 'url',
                    url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80',
                    updatedAt: new Date('2024-11-02'),
                },
                description: 'Marketing landing page',
                tags: ['marketing', 'landing'],
            },
        }),
        refetch: mockRefetch,
        aspectRatio: 'aspect-video',
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Minimal project (no description, few tags)
 */
exports.Minimal = {
    args: {
        project: createMockProject({
            name: 'Quick Test',
            metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                previewImg: null,
                description: null,
                tags: [],
            },
        }),
        refetch: mockRefetch,
        HighlightText: highlight_text_1.HighlightText,
    },
};
/**
 * Project with different image source
 */
exports.AlternativeImage = {
    args: {
        project: createMockProject({
            name: 'Design System',
            metadata: {
                createdAt: new Date('2024-10-01'),
                updatedAt: new Date('2024-11-01'),
                previewImg: {
                    type: 'url',
                    url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
                    updatedAt: new Date('2024-11-01'),
                },
                description: 'Component library and design system',
                tags: ['design', 'components'],
            },
        }),
        refetch: mockRefetch,
        HighlightText: highlight_text_1.HighlightText,
    },
};
//# sourceMappingURL=ProjectCard.stories.js.map