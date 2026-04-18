"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrepTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const cli_1 = require("../shared/helpers/cli");
const type_1 = require("../shared/type");
class GrepTool extends client_1.ClientTool {
    static toolName = 'grep';
    static description = 'Search for patterns in files using grep';
    static parameters = zod_1.z.object({
        pattern: zod_1.z.string().describe('The regular expression pattern to search for in file contents'),
        path: zod_1.z
            .string()
            .optional()
            .describe('File or directory to search in (defaults to current working directory)'),
        glob: zod_1.z
            .string()
            .optional()
            .describe('Glob pattern to filter files (e.g. "*.js", "*.{ts,tsx}")'),
        type: zod_1.z
            .string()
            .optional()
            .describe('File type to search (e.g., js, py, rust, go, java, etc.) More efficient than glob for standard file types'),
        output_mode: zod_1.z
            .enum(['content', 'files_with_matches', 'count'])
            .optional()
            .default('files_with_matches')
            .describe('Output mode: "content" shows matching lines, "files_with_matches" shows file paths, "count" shows match counts'),
        '-i': zod_1.z.boolean().optional().describe('Case insensitive search'),
        '-n': zod_1.z
            .boolean()
            .optional()
            .describe('Show line numbers in output (requires output_mode: "content")'),
        '-A': zod_1.z
            .number()
            .optional()
            .describe('Number of lines to show after each match (requires output_mode: "content")'),
        '-B': zod_1.z
            .number()
            .optional()
            .describe('Number of lines to show before each match (requires output_mode: "content")'),
        '-C': zod_1.z
            .number()
            .optional()
            .describe('Number of lines to show before and after each match (requires output_mode: "content")'),
        multiline: zod_1.z
            .boolean()
            .optional()
            .describe('Enable multiline mode where . matches newlines and patterns can span lines'),
        head_limit: zod_1.z.number().optional().describe('Limit output to first N lines/entries'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.MagnifyingGlass;
    async handle(args, editorEngine) {
        try {
            const sandbox = editorEngine.branches.getSandboxById(args.branchId);
            if (!sandbox) {
                return `Error: Sandbox not found for branch ID: ${args.branchId}`;
            }
            const searchPath = args.path || '.';
            // Enhanced input validation
            const validationError = await validateGrepInputs(args.pattern, searchPath, args, sandbox);
            if (validationError) {
                return validationError;
            }
            // Build and execute grep command
            const result = await executeGrepSearch(sandbox, searchPath, args);
            if (!result.success && result.error) {
                return result.error;
            }
            return await processGrepResults(result, args.pattern, searchPath, args);
        }
        catch (error) {
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
    static getLabel(input) {
        if (input?.pattern) {
            const truncatedPattern = input.pattern.length > 30
                ? input.pattern.substring(0, 30) + '...'
                : input.pattern;
            return 'Searching for ' + truncatedPattern;
        }
        return 'Searching';
    }
}
exports.GrepTool = GrepTool;
async function validateGrepInputs(pattern, searchPath, args, sandbox) {
    // Pattern validation
    if (!pattern.trim()) {
        return 'Error: Search pattern cannot be empty';
    }
    // Validate regex pattern if it looks like regex (contains special chars)
    if (containsRegexChars(pattern) && !args.multiline) {
        try {
            new RegExp(pattern, args['-i'] ? 'i' : '');
        }
        catch (regexError) {
            return `Error: Invalid regex pattern '${pattern}': ${regexError instanceof Error ? regexError.message : 'malformed pattern'}`;
        }
    }
    // Validate multiline pattern separately (more complex validation needed)
    if (args.multiline) {
        const multilineError = validateMultilinePattern(pattern);
        if (multilineError) {
            return multilineError;
        }
    }
    // Path validation
    const pathValidation = await sandbox.session.runCommand(`test -e "${searchPath}" && echo "exists" || echo "not_found"`, undefined, true);
    if (pathValidation.success && pathValidation.output.trim() === 'not_found') {
        // Try fuzzy path matching
        const fuzzyPath = await findFuzzyPath(searchPath, sandbox);
        if (fuzzyPath) {
            return `Error: Search path "${searchPath}" not found. Did you mean "${fuzzyPath}"?`;
        }
        return `Error: Search path "${searchPath}" does not exist`;
    }
    // Check if it's a directory (not a file)
    const dirValidation = await sandbox.session.runCommand(`test -d "${searchPath}" && echo "dir" || echo "not_dir"`, undefined, true);
    if (dirValidation.success && dirValidation.output.trim() === 'not_dir') {
        return `Error: Search path "${searchPath}" is not a directory`;
    }
    // Validate numeric parameters
    if (args['-A'] !== undefined && (args['-A'] < 0 || args['-A'] > 100)) {
        return `Error: After context lines (-A) must be between 0 and 100, got ${args['-A']}`;
    }
    if (args['-B'] !== undefined && (args['-B'] < 0 || args['-B'] > 100)) {
        return `Error: Before context lines (-B) must be between 0 and 100, got ${args['-B']}`;
    }
    if (args['-C'] !== undefined && (args['-C'] < 0 || args['-C'] > 100)) {
        return `Error: Context lines (-C) must be between 0 and 100, got ${args['-C']}`;
    }
    if (args.head_limit !== undefined && (args.head_limit < 1 || args.head_limit > 10000)) {
        return `Error: Head limit must be between 1 and 10000, got ${args.head_limit}`;
    }
    // Validate conflicting flags
    if (args['-C'] && (args['-A'] || args['-B'])) {
        return `Error: Cannot use -C (context) with -A (after) or -B (before) flags`;
    }
    return null; // All validations passed
}
function containsRegexChars(pattern) {
    // Check if pattern contains regex special characters
    const regexChars = /[.*+?^${}()|[\]\\]/;
    return regexChars.test(pattern);
}
function validateMultilinePattern(pattern) {
    // Basic multiline pattern validation
    if (pattern.includes('\n') || pattern.includes('\\n')) {
        return `Error: Multiline patterns with literal newlines are not fully supported. Use \\s*\\n\\s* or similar patterns instead.`;
    }
    try {
        // Test if the pattern can be compiled as a regex
        new RegExp(pattern, 'gm');
        return null;
    }
    catch (error) {
        return `Error: Invalid multiline regex pattern '${pattern}': ${error instanceof Error ? error.message : 'malformed pattern'}`;
    }
}
async function findFuzzyPath(inputPath, sandbox) {
    // Extract directory name from path for fuzzy matching
    const parts = inputPath.split('/').filter(p => p);
    const targetName = parts[parts.length - 1];
    if (!targetName)
        return null;
    // Search for directories with similar names
    const findCommand = `find . -type d -name "*${targetName}*" | head -5`;
    const result = await sandbox.session.runCommand(findCommand, undefined, true);
    if (result.success && result.output.trim()) {
        const candidates = result.output.trim().split('\n').filter((line) => line.trim());
        // Simple scoring - prefer exact matches and shorter paths
        const scored = candidates.map((candidate) => {
            const candidateName = candidate.split('/').pop() || '';
            let score = 0;
            if (candidateName === targetName)
                score += 100;
            else if (candidateName.includes(targetName))
                score += 50;
            else if (candidateName.toLowerCase().includes(targetName.toLowerCase()))
                score += 25;
            score -= candidate.split('/').length; // Prefer shorter paths
            return { path: candidate, score };
        });
        scored.sort((a, b) => b.score - a.score);
        if (scored.length > 0 && scored[0].score > 0) {
            return scored[0].path;
        }
    }
    return null;
}
async function executeGrepSearch(sandbox, searchPath, args) {
    // Build find command for file filtering
    let findCommand = buildFindCommand(searchPath, args);
    // Build grep command
    const grepCommand = buildGrepCommand(args);
    let command;
    if (args.multiline) {
        // Handle multiline search with appropriate method
        command = await buildMultilineCommand(findCommand, grepCommand, args, sandbox);
    }
    else {
        // Standard grep with find
        command = `${findCommand} -exec grep${grepCommand} "${(0, cli_1.escapeForShell)(args.pattern)}" {} +`;
    }
    // Apply head limit if specified
    if (args.head_limit) {
        command += ` | head -${args.head_limit}`;
    }
    // Execute the command with ignoreError to handle "no matches found" gracefully
    const result = await sandbox.session.runCommand(command, undefined, true);
    // Determine if results were truncated
    const wasTruncated = args.head_limit ?
        (result.output ? result.output.split('\n').length >= args.head_limit : false) :
        false;
    return {
        success: result.success || (result.output && result.output.trim().length > 0),
        output: result.output || '',
        error: result.success ? undefined : result.error,
        isEmpty: !result.output || result.output.trim().length === 0,
        wasTruncated
    };
}
function buildFindCommand(searchPath, args) {
    let findCommand = `find "${(0, cli_1.escapeForShell)(searchPath)}" -type f`;
    // Add exclusions for common directories
    findCommand = (0, cli_1.addFindExclusions)(findCommand);
    // Add file filtering based on glob or type
    if (args.glob) {
        findCommand += ` -name "${(0, cli_1.escapeForShell)(args.glob)}"`;
    }
    else if (args.type) {
        const extension = (0, cli_1.getFileTypePattern)(args.type);
        findCommand += ` -name "${extension}"`;
    }
    return findCommand;
}
function buildGrepCommand(args) {
    let grepFlags = '';
    // Case insensitive
    if (args['-i'])
        grepFlags += ' -i';
    // Line numbers (only for content output mode)
    if (args['-n'] && args.output_mode === 'content')
        grepFlags += ' -n';
    // Context lines (only for content output mode)
    if (args.output_mode === 'content') {
        if (args['-A'] !== undefined)
            grepFlags += ` -A ${args['-A']}`;
        if (args['-B'] !== undefined)
            grepFlags += ` -B ${args['-B']}`;
        if (args['-C'] !== undefined)
            grepFlags += ` -C ${args['-C']}`;
    }
    // Output mode flags
    if (args.output_mode === 'files_with_matches') {
        grepFlags += ' -l';
    }
    else if (args.output_mode === 'count') {
        grepFlags += ' -c';
    }
    // Use fixed strings if pattern doesn't contain regex chars (better performance)
    if (!containsRegexChars(args.pattern)) {
        grepFlags += ' -F';
    }
    return grepFlags;
}
async function buildMultilineCommand(findCommand, grepFlags, args, sandbox) {
    // Check if grep supports -P flag (Perl regex)
    const perlSupport = await sandbox.session.runCommand('grep --help | grep -q "\\-P" && echo "yes" || echo "no"', undefined, true);
    if (perlSupport.success && perlSupport.output.trim() === 'yes') {
        // Use grep -P with -z for null-separated records
        return `${findCommand} -exec grep -P${grepFlags} -z "${(0, cli_1.escapeForShell)(args.pattern)}" {} +`;
    }
    else {
        // Fallback to awk for multiline (limited functionality)
        const awkPattern = args.pattern.replace(/'/g, "'\\''"); // Escape single quotes for awk
        return `${findCommand} -exec awk 'BEGIN{RS=""} /${awkPattern}/ {print FILENAME ${args.output_mode === 'content' ? ': $0' : ''}}' {} +`;
    }
}
async function processGrepResults(result, pattern, searchPath, args) {
    if (result.isEmpty) {
        // Provide specific message for no matches
        const patternType = containsRegexChars(pattern) ? 'regex pattern' : 'text';
        let message = `No matches found for ${patternType} '${pattern}'`;
        if (searchPath !== '.') {
            message += ` in path '${searchPath}'`;
        }
        if (args.type || args.glob) {
            const filterType = args.type ? `${args.type} files` : `files matching '${args.glob}'`;
            message += ` among ${filterType}`;
        }
        return message;
    }
    // Clean up the output
    let cleanOutput = result.output.trim();
    // Remove any control characters except newlines and tabs
    cleanOutput = cleanOutput.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    // Format based on output mode
    if (args.output_mode === 'count') {
        cleanOutput = formatCountOutput(cleanOutput, pattern);
    }
    // Add truncation warning if needed
    if (result.wasTruncated && args.head_limit) {
        const lines = cleanOutput.split('\n').length;
        cleanOutput = `Showing first ${lines} results (truncated at ${args.head_limit}). Use head_limit to see more or refine your search.\n\n${cleanOutput}`;
    }
    return cleanOutput;
}
function formatCountOutput(output, pattern) {
    // Format count output to be more readable
    const lines = output.trim().split('\n');
    const totalMatches = lines.reduce((sum, line) => {
        const parts = line.split(':');
        const count = parseInt(parts[parts.length - 1] || '0', 10);
        return sum + (isNaN(count) ? 0 : count);
    }, 0);
    if (totalMatches === 0) {
        return `No matches found for '${pattern}'`;
    }
    // Add summary line
    const formattedLines = lines.map(line => {
        const parts = line.split(':');
        const count = parts[parts.length - 1];
        const filename = parts.slice(0, -1).join(':');
        return count === '0' ? `${filename}: 0 matches` : `${filename}: ${count} matches`;
    });
    return `Total: ${totalMatches} matches across ${lines.length} files\n\n${formattedLines.join('\n')}`;
}
//# sourceMappingURL=grep.js.map