"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoComplete = void 0;
const utils_1 = require("@onlook/ui/utils");
const react_1 = require("react");
const twClassGen_1 = require("./twClassGen");
exports.AutoComplete = (0, react_1.forwardRef)(({ setCurrentInput, showSuggestions, setShowSuggestions, currentInput }, ref) => {
    const [suggestions, setSuggestions] = (0, react_1.useState)([]);
    const [selectedSuggestion, setSelectedSuggestion] = (0, react_1.useState)(null);
    const [currentWordInfo, setCurrentWordInfo] = (0, react_1.useState)(null);
    const getWordAtCursor = (value, cursorPosition) => {
        // Find the start of the current word
        let startIndex = cursorPosition;
        while (startIndex > 0 && value[startIndex - 1] !== ' ') {
            startIndex--;
        }
        // Find the end of the current word
        let endIndex = cursorPosition;
        while (endIndex < value.length && value[endIndex] !== ' ') {
            endIndex++;
        }
        return {
            word: value.slice(startIndex, endIndex),
            startIndex,
            endIndex,
        };
    };
    const parseModifiers = (input) => {
        const parts = input.split(':');
        const baseClass = parts.pop() || '';
        const modifiers = parts;
        return { modifiers, baseClass };
    };
    const reconstructWithModifiers = (modifiers, newBaseClass) => {
        return [...modifiers, newBaseClass].join(':');
    };
    const handleInput = (value, cursorPosition) => {
        const wordInfo = getWordAtCursor(value, cursorPosition);
        setCurrentWordInfo(wordInfo);
        const filtered = filterSuggestions(value, wordInfo);
        setSuggestions(filtered);
        setSelectedSuggestion(null);
        setShowSuggestions(filtered.length > 0);
    };
    const handleKeyDown = (e) => {
        if (!currentWordInfo) {
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestion((prev) => {
                if (prev === null) {
                    return 0;
                }
                return prev < suggestions.length - 1 ? prev + 1 : 0;
            });
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestion((prev) => {
                if (prev === null) {
                    return suggestions.length - 1;
                }
                return prev > 0 ? prev - 1 : suggestions.length - 1;
            });
        }
        else if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            if (selectedSuggestion !== null && suggestions[selectedSuggestion]) {
                const { modifiers } = parseModifiers(currentWordInfo.word);
                const newClass = reconstructWithModifiers(modifiers, suggestions[selectedSuggestion]);
                // Replace only the current word at cursor position
                const newValue = currentInput.slice(0, currentWordInfo.startIndex) +
                    newClass +
                    currentInput.slice(currentWordInfo.endIndex);
                setCurrentInput(newValue);
            }
            setShowSuggestions(false);
        }
        else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };
    (0, react_1.useImperativeHandle)(ref, () => ({
        handleInput,
        handleKeyDown,
    }));
    const filterSuggestions = (input, wordInfo) => {
        if (!wordInfo.word.trim()) {
            return [];
        }
        const { baseClass } = parseModifiers(wordInfo.word);
        // Get direct matches based on base class
        const searchResults = (0, twClassGen_1.searchTailwindClasses)(baseClass);
        // Get contextual suggestions based on existing classes
        const currentClasses = input
            .split(' ')
            .filter(Boolean)
            .map((cls) => {
            const { baseClass } = parseModifiers(cls);
            return baseClass;
        });
        const contextualSuggestions = (0, twClassGen_1.getContextualSuggestions)(currentClasses);
        // Combine and deduplicate results
        const combinedResults = Array.from(new Set([...searchResults, ...contextualSuggestions]));
        return combinedResults.slice(0, 10);
    };
    const handleClick = (suggestion) => {
        if (!currentWordInfo) {
            return;
        }
        const { modifiers } = parseModifiers(currentWordInfo.word);
        const newClass = reconstructWithModifiers(modifiers, suggestion);
        // Replace only the current word at cursor position
        const newValue = currentInput.slice(0, currentWordInfo.startIndex) +
            newClass +
            currentInput.slice(currentWordInfo.endIndex);
        setCurrentInput(newValue);
        setShowSuggestions(false);
    };
    const getColorPreviewValue = (suggestion) => {
        const colorPattern = twClassGen_1.coreColors.join('|');
        const headPattern = 'bg|text|border|ring|shadow|divide|placeholder|accent|caret|fill|stroke';
        const shadePattern = '\\d+';
        const regex = new RegExp(`(${headPattern})-(${colorPattern})-(${shadePattern})`);
        const match = suggestion.match(regex);
        if (!match) {
            return '';
        }
        try {
            const [, , colorName, shade = '500'] = match;
            return `var(--color-${colorName}-${shade})`;
        }
        catch (error) {
            console.error('Error computing color:', error);
        }
        return '';
    };
    return (showSuggestions &&
        currentWordInfo && (<div className="z-50 fixed top-50 left-50 w-[90%] mt-1 rounded text-foreground bg-background-onlook overflow-auto">
                {suggestions.map((suggestion, index) => {
            const colorClass = getColorPreviewValue(suggestion);
            const { modifiers } = parseModifiers(currentWordInfo.word);
            return (<div key={suggestion} className={(0, utils_1.cn)('px-3 py-2 cursor-pointer hover:bg-background-hover hover:font-semibold', index === selectedSuggestion &&
                    'bg-background-active font-semibold')} onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleClick(suggestion);
                }}>
                            <span className="flex items-center">
                                {colorClass && (<div className="w-4 h-4 mr-2 border-[0.5px] border-foreground-tertiary rounded-sm" style={{ backgroundColor: colorClass }}/>)}
                                <span className="opacity-50 mr-1">
                                    {modifiers.length > 0 ? `${modifiers.join(':')}:` : ''}
                                </span>
                                <span>{suggestion}</span>
                            </span>
                        </div>);
        })}
            </div>));
});
exports.AutoComplete.displayName = 'AutoComplete';
//# sourceMappingURL=AutoComplete.js.map