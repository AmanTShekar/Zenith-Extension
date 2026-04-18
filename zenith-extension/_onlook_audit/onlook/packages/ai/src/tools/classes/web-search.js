"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSearchTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
class WebSearchTool extends client_1.ClientTool {
    static toolName = 'web_search';
    static description = 'Search the web for up-to-date information';
    static parameters = zod_1.z.object({
        query: zod_1.z.string().min(2).describe('Search query'),
        allowed_domains: zod_1.z.array(zod_1.z.string()).optional().describe('Include only these domains'),
        blocked_domains: zod_1.z.array(zod_1.z.string()).optional().describe('Exclude these domains'),
    });
    static icon = icons_1.Icons.MagnifyingGlass;
    async handle(args, editorEngine) {
        try {
            const res = await editorEngine.api.webSearch({
                query: args.query,
                allowed_domains: args.allowed_domains,
                blocked_domains: args.blocked_domains,
            });
            return res;
        }
        catch (error) {
            console.error('Error searching web:', error);
            return {
                result: [],
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    static getLabel(input) {
        if (input?.query) {
            const truncatedQuery = input.query.length > 30
                ? input.query.substring(0, 30) + '...'
                : input.query;
            return `Searching "${truncatedQuery}"`;
        }
        return 'Searching web';
    }
}
exports.WebSearchTool = WebSearchTool;
//# sourceMappingURL=web-search.js.map