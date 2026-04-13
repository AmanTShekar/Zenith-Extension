#!/usr/bin/env node
/**
 * Zenith Surgical CLI (Pipe Mode) — v5.0
 * Bridge between Rust Sidecar and Babel AST Engine.
 *
 * Protocol:
 *   stdin  → source file content
 *   argv[2]→ JSON PatchInstructions
 *   stdout ← patched file content (prettier-formatted)
 *   stderr ← error message (fatal)
 *   exit 1  → fatal error (sidecar rolls back the transaction)
 *
 * v5.0 additions:
 *   - Prettier post-processing for clean output
 *   - Graceful fallback if prettier fails
 *   - Full DOM operation support via expanded PatchInstructions
 */

import { readFileSync } from 'node:fs';
import { patchSourceFile, type PatchInstructions } from '../surgical.js';

async function main() {
  const input = readFileSync(0, 'utf8'); // Read JSON envelope from stdin
  const envelope = JSON.parse(input);
  
  const source = envelope.source;
  const instructions: PatchInstructions = envelope.instructions;

  if (!source || !instructions) {
    process.stderr.write('ERROR: Invalid JSON envelope (source or instructions missing)\n');
    process.exit(1);
  }

  // Apply AST surgical patch
  const patchedCode = patchSourceFile(source, instructions);

  // C1: Prettier post-processing for clean, formatted output
  // Runs after every patch — keeps source code developer-friendly.
  // Falls back to raw output if prettier fails (e.g., parse error).
  let output = patchedCode;
  try {
    const { format, resolveConfig } = await import('prettier');

    // Try to find project prettier config; fall back to sensible defaults
    const prettierConfig = await resolveConfig(process.cwd()).catch(() => null);

    // Detect parser from file content heuristics
    const isTypescript = instructions.zenithId?.includes('.tsx') ||
      instructions.zenithId?.includes('.ts') ||
      /^(import|export)\s/m.test(source) ||
      /<\/[A-Z]/.test(source);

    const parserName = isTypescript
      ? (source.includes('tsx') || /<[A-Z]/.test(source) ? 'babel-ts' : 'typescript')
      : 'babel';

    output = await format(patchedCode, {
      parser: parserName,
      ...prettierConfig,
      // Sensible defaults if no prettier config found
      singleQuote: false,
      semi: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
    });
  } catch (_prettierErr) {
    // Prettier failed — use raw patched output (not fatal)
    // This happens for files with syntax errors or unsupported parsers
    output = patchedCode;
  }

  process.stdout.write(output);
}

main().catch((err: any) => {
  process.stderr.write(`ERROR: ${err.message || String(err)}\n`);
  process.exit(1);
});
