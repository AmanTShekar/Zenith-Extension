"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptyString = isEmptyString;
exports.isString = isString;
exports.toNormalCase = toNormalCase;
exports.capitalizeFirstLetter = capitalizeFirstLetter;
exports.generateUniqueName = generateUniqueName;
const lodash_1 = require("lodash");
function isEmptyString(str) {
    return str.trim() === '';
}
function isString(value) {
    return typeof value === 'string';
}
function toNormalCase(str) {
    if (!str) {
        return '';
    }
    // Handle already normal case strings (words separated by spaces, first letter of each word capitalized)
    if (/^[A-Z][a-z]*( [A-Z][a-z]*)*$/.test(str)) {
        return str;
    }
    // Skip if the string is fully uppercase
    if (str === str.toUpperCase()) {
        return str;
    }
    // For other cases, convert camelCase/PascalCase to normal case
    return str
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^\w/, (c) => c.toUpperCase());
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
/**
 * Generates a unique name by appending a number to the base name until it doesn't conflict with existing names.
 * The comparison is done using camelCase to ensure consistent name formatting.
 * @param baseName The base name to start with
 * @param existingNames Array of existing names to check against
 * @param transformFn Optional function to transform the name before comparison (defaults to camelCase)
 * @returns A unique name that doesn't conflict with existing names
 */
function generateUniqueName(baseName, existingNames, transformFn = lodash_1.camelCase) {
    let counter = 1;
    let newName = `${baseName} ${counter}`;
    let transformedName = transformFn(newName);
    while (existingNames.includes(transformedName)) {
        counter++;
        newName = `${baseName} ${counter}`;
        transformedName = transformFn(newName);
    }
    return newName;
}
//# sourceMappingURL=string.js.map