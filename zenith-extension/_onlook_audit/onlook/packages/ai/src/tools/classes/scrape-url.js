"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapeUrlTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
class ScrapeUrlTool extends client_1.ClientTool {
    static toolName = 'scrape_url';
    static description = 'Scrape a URL and extract its content in various formats (markdown, HTML, JSON, branding). Can extract clean, LLM-ready content from any website, handling dynamic content and anti-bot mechanisms. The branding format extracts brand identity information including colors, fonts, typography, spacing, and UI components. You can request multiple formats at once (e.g., both markdown and branding) to get both content and brand identity in a single call.';
    static parameters = zod_1.z.object({
        url: zod_1.z.url().describe('The URL to scrape. Must be a valid HTTP or HTTPS URL.'),
        formats: zod_1.z
            .array(zod_1.z.enum(['markdown', 'html', 'json', 'branding']))
            .default(['markdown'])
            .describe('The formats to return the scraped content in. Defaults to markdown. Use "branding" to extract brand identity (colors, fonts, typography, etc.). You can specify multiple formats (e.g., ["markdown", "branding"]) to get both content and brand identity in a single call.'),
        onlyMainContent: zod_1.z
            .boolean()
            .default(true)
            .describe('Whether to only return the main content of the page, excluding navigation, ads, etc.'),
        includeTags: zod_1.z
            .array(zod_1.z.string())
            .optional()
            .describe('Array of HTML tags to include in the scraped content.'),
        excludeTags: zod_1.z
            .array(zod_1.z.string())
            .optional()
            .describe('Array of HTML tags to exclude from the scraped content.'),
        waitFor: zod_1.z
            .number()
            .min(0)
            .optional()
            .describe('Time in milliseconds to wait for the page to load before scraping.'),
    });
    static icon = icons_1.Icons.Globe;
    async handle(args, editorEngine) {
        try {
            const result = await editorEngine.api.scrapeUrl({
                url: args.url,
                formats: args.formats,
                onlyMainContent: args.onlyMainContent,
                includeTags: args.includeTags,
                excludeTags: args.excludeTags,
                waitFor: args.waitFor,
            });
            if (!result.result) {
                throw new Error(`Failed to scrape URL: ${result.error}`);
            }
            return result.result;
        }
        catch (error) {
            console.error('Error scraping URL:', error);
            throw new Error(`Failed to scrape URL ${args.url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    static getLabel(input) {
        if (input?.url) {
            try {
                return 'Visiting ' + (new URL(input.url).hostname || 'URL');
            }
            catch {
                return 'Visiting URL';
            }
        }
        return 'Visiting URL';
    }
}
exports.ScrapeUrlTool = ScrapeUrlTool;
//# sourceMappingURL=scrape-url.js.map