import { createHash } from 'crypto';

/**
 * v3.7 Base62 Encoder
 * Maps 72 bits (9 bytes) to 12 base62 characters.
 */
function encodeBase62(buffer: Buffer): string {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let value = BigInt('0x' + buffer.toString('hex'));
    let res = "";
    while (value > 0n) {
        res = chars[Number(value % 62n)] + res;
        value /= 62n;
    }
    return res.padStart(12, '0').slice(-12);
}

/**
 * v3.7 Ghost-ID Generation (Collision-Safe)
 * SHA-256 (File:Line:Col) -> 72-bit prefix -> Base62
 */
export function generateGhostId(file: string, line: number, col: number): string {
    const hasher = createHash('sha256');
    hasher.update(`${file}:${line}:${col}`);
    const digest = hasher.digest();
    return encodeBase62(digest.slice(0, 9));
}

/**
 * Babel plugin to inject data-zenith-id into JSX elements.
 * Format: data-zenith-id="12-char-base62" (v3.7 Option C)
 */
export default function zenithIdPlugin({ types: t }: any) {
    return {
        visitor: {
            JSXOpeningElement(path: any, state: any) {
                const { filename } = state.file.opts;
                const { line, column } = path.node.loc.start;
                const relativePath = filename.replace(state.opts.projectRoot || '', '').replace(/^[\\\/]/, '');
                
                const id = generateGhostId(relativePath, line, column);
                
                // v3.10: Source Map Preservation (Patch 11)
                // Attach the new attribute but ensure it doesn't shift original mapping indices.
                const attr = t.jsxAttribute(
                    t.jsxIdentifier('data-zenith-id'),
                    t.stringLiteral(id)
                );
                
                // Explicitly inherit location from the opening element to avoid 
                // generating "null" location data which breaks some source-map consumers.
                attr.loc = path.node.loc;
                
                path.node.attributes.push(attr);
            }
        }
    };
}

