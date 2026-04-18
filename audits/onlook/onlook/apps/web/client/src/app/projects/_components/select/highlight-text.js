"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightText = HighlightText;
function HighlightText({ text, searchQuery }) {
    if (!searchQuery)
        return <>{text}</>;
    const safe = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${safe})`, 'gi'));
    return (<>
            {parts.map((part, index) => part.toLowerCase() === searchQuery.toLowerCase() ? (<span key={index} className="font-medium text-foreground">
                        {part}
                    </span>) : (part))}
        </>);
}
//# sourceMappingURL=highlight-text.js.map