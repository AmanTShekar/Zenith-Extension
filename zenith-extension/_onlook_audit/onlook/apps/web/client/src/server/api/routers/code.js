"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utilsRouter = void 0;
const env_1 = require("@/env");
const firecrawl_js_1 = __importDefault(require("@mendable/firecrawl-js"));
const ai_1 = require("@onlook/ai");
const exa_js_1 = __importDefault(require("exa-js"));
const zod_1 = require("zod");
const trpc_1 = require("../trpc");
exports.utilsRouter = (0, trpc_1.createTRPCRouter)({
    applyDiff: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        originalCode: zod_1.z.string(),
        updateSnippet: zod_1.z.string(),
        instruction: zod_1.z.string(),
        metadata: zod_1.z.object({
            projectId: zod_1.z.string().optional(),
            conversationId: zod_1.z.string().optional(),
        }).optional(),
    }))
        .mutation(async ({ input, ctx }) => {
        try {
            const user = ctx.user;
            const metadata = {
                ...input.metadata,
                userId: user.id,
            };
            const result = await (0, ai_1.applyCodeChange)(input.originalCode, input.updateSnippet, input.instruction, metadata);
            if (!result) {
                throw new Error('Failed to apply code change. Please try again.');
            }
            return {
                result,
                error: null,
            };
        }
        catch (error) {
            console.error('Failed to apply code change', error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error',
                result: null,
            };
        }
    }),
    scrapeUrl: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        url: zod_1.z.string().url(),
        formats: zod_1.z.array(zod_1.z.enum(['markdown', 'html', 'json', 'branding'])).default(['markdown']),
        onlyMainContent: zod_1.z.boolean().default(true),
        includeTags: zod_1.z.array(zod_1.z.string()).optional(),
        excludeTags: zod_1.z.array(zod_1.z.string()).optional(),
        waitFor: zod_1.z.number().min(0).optional(),
    }))
        .mutation(async ({ input }) => {
        try {
            if (!env_1.env.FIRECRAWL_API_KEY) {
                throw new Error('FIRECRAWL_API_KEY is not configured');
            }
            const app = new firecrawl_js_1.default({ apiKey: env_1.env.FIRECRAWL_API_KEY });
            // Cast formats to SDK type - 'branding' is supported by API but not in SDK types yet
            const result = await app.scrapeUrl(input.url, {
                formats: input.formats,
                onlyMainContent: input.onlyMainContent,
                ...(input.includeTags && { includeTags: input.includeTags }),
                ...(input.excludeTags && { excludeTags: input.excludeTags }),
                ...(input.waitFor !== undefined && { waitFor: input.waitFor }),
            });
            if (!result.success) {
                throw new Error(`Failed to scrape URL: ${result.error || 'Unknown error'}`);
            }
            const hasBranding = input.formats.includes('branding');
            const hasContentFormats = input.formats.some(f => ['markdown', 'html', 'json'].includes(f));
            // Extract branding data if requested - access via type assertion since SDK types may not include it yet
            const resultWithBranding = result;
            const brandingData = hasBranding && resultWithBranding.branding
                ? JSON.stringify(resultWithBranding.branding, null, 2)
                : null;
            // Return the primary content format (markdown by default)
            // or the first available format if markdown isn't available
            const content = result.markdown ?? result.html ?? JSON.stringify(result.json, null, 2);
            // Combine content and branding if both are requested
            if (hasBranding && hasContentFormats) {
                // Ensure at least one format is available
                if (!content && !brandingData) {
                    throw new Error('No content or branding data was extracted from the URL');
                }
                const parts = [];
                if (content) {
                    parts.push(content);
                }
                if (brandingData) {
                    // Only add separator if we have both content and branding
                    if (content) {
                        parts.push('\n\n=== Brand Identity ===\n');
                        parts.push('The following brand identity information was extracted from the website:\n');
                    }
                    parts.push(brandingData);
                }
                return {
                    result: parts.join('\n'),
                    error: null,
                };
            }
            // Return branding only if it's the only format requested
            if (hasBranding && !hasContentFormats) {
                if (!brandingData) {
                    throw new Error('No branding data was extracted from the URL');
                }
                return {
                    result: brandingData,
                    error: null,
                };
            }
            // Return content only (existing behavior)
            if (!content) {
                throw new Error('No content was scraped from the URL');
            }
            return {
                result: content,
                error: null,
            };
        }
        catch (error) {
            console.error('Error scraping URL:', error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error',
                result: null,
            };
        }
    }),
    webSearch: trpc_1.protectedProcedure
        .input(zod_1.z.object({
        query: zod_1.z.string().min(2).describe('Search query'),
        allowed_domains: zod_1.z.array(zod_1.z.string()).optional().describe('Include only these domains'),
        blocked_domains: zod_1.z.array(zod_1.z.string()).optional().describe('Exclude these domains'),
    }))
        .mutation(async ({ input }) => {
        try {
            if (!env_1.env.EXA_API_KEY) {
                throw new Error('EXA_API_KEY is not configured');
            }
            const exa = new exa_js_1.default(env_1.env.EXA_API_KEY);
            const searchOptions = {
                type: 'auto',
                numResults: 10,
                contents: {
                    text: true,
                },
            };
            if (input.allowed_domains && input.allowed_domains.length > 0) {
                searchOptions.includeDomains = input.allowed_domains;
            }
            if (input.blocked_domains && input.blocked_domains.length > 0) {
                searchOptions.excludeDomains = input.blocked_domains;
            }
            const result = await exa.searchAndContents(input.query, searchOptions);
            if (!result.results || result.results.length === 0) {
                return {
                    result: [],
                    error: null,
                };
            }
            const formattedResults = result.results.map((item) => ({
                title: item.title ?? '',
                url: item.url ?? '',
                text: item.text ?? '',
                publishedDate: item.publishedDate ?? null,
                author: item.author ?? null,
            }));
            return {
                result: formattedResults,
                error: null,
            };
        }
        catch (error) {
            console.error('Error searching web:', error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error',
                result: [],
            };
        }
    }),
});
//# sourceMappingURL=code.js.map