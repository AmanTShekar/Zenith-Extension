"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genASTParserOptionsByFileExtension = void 0;
exports.isReactFragment = isReactFragment;
exports.isColorsObjectProperty = isColorsObjectProperty;
exports.isObjectExpression = isObjectExpression;
const packages_1 = require("./packages");
function isReactFragment(openingElement) {
    const name = openingElement.name;
    if (packages_1.t.isJSXIdentifier(name)) {
        return name.name === 'Fragment';
    }
    if (packages_1.t.isJSXMemberExpression(name)) {
        return (packages_1.t.isJSXIdentifier(name.object) &&
            name.object.name === 'React' &&
            packages_1.t.isJSXIdentifier(name.property) &&
            name.property.name === 'Fragment');
    }
    return false;
}
function isColorsObjectProperty(path) {
    return (path.parent.type === 'ObjectExpression' &&
        path.node.key.type === 'Identifier' &&
        path.node.key.name === 'colors' &&
        path.node.value.type === 'ObjectExpression');
}
function isObjectExpression(node) {
    return node.type === 'ObjectExpression';
}
const genASTParserOptionsByFileExtension = (fileExtension, sourceType = 'module') => {
    switch (fileExtension) {
        case '.ts':
            return {
                sourceType: sourceType,
                plugins: ['typescript'],
            };
        case '.js':
        case '.mjs':
        case '.cjs':
        default:
            return {
                sourceType: sourceType,
            };
    }
};
exports.genASTParserOptionsByFileExtension = genASTParserOptionsByFileExtension;
//# sourceMappingURL=helpers.js.map