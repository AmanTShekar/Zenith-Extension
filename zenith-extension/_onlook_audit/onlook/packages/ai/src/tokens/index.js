"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countTokensWithRoles = countTokensWithRoles;
const gpt_tokenizer_1 = require("gpt-tokenizer");
async function countTokensWithRoles(messages) {
    const perMessageExtra = 4; // ~role + metadata tokens (OpenAI chat format)
    const perReplyExtra = 2; // for assistant reply priming
    let total = 0;
    for (const m of messages) {
        const content = m.parts
            .map((p) => {
            if (p.type === 'text') {
                return p.text;
            }
            else if (p.type.startsWith('tool-')) {
                return JSON.stringify(p.input); // TODO: check if this is correct
            }
            return '';
        })
            .join('');
        total += (0, gpt_tokenizer_1.encode)(content).length + perMessageExtra;
    }
    return total + perReplyExtra;
}
//# sourceMappingURL=index.js.map