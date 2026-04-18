"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("@babel/types"));
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const src_1 = require("src");
const packages_1 = require("src/packages");
const map_1 = require("src/template-node/map");
(0, bun_test_1.describe)('Template Tests', () => {
    (0, bun_test_1.describe)('createTemplateNodeMap', () => {
        (0, bun_test_1.test)('should create mapping for simple component', () => {
            const code = `
                function App() {
                    return <div data-oid="test-id">Hello</div>;
                }
            `;
            const ast = (0, src_1.getAstFromContent)(code);
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            const mapping = (0, map_1.createTemplateNodeMap)({
                ast,
                filename: 'test.tsx',
                branchId: 'test-branch',
            });
            (0, bun_test_1.expect)(mapping?.get('test-id')).toBeDefined();
            (0, bun_test_1.expect)(mapping?.get('test-id')?.component).toBe('App');
            (0, bun_test_1.expect)(mapping?.get('test-id')?.path).toBe('test.tsx');
        });
        (0, bun_test_1.test)('should handle nested components', () => {
            const code = `
                function Child() {
                    return <div data-oid="child-id">Child</div>;
                }
                function Parent() {
                    return <div data-oid="parent-id"><Child /></div>;
                }
            `;
            const ast = (0, src_1.getAstFromContent)(code);
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            const mapping = (0, map_1.createTemplateNodeMap)({
                ast,
                filename: 'test.tsx',
                branchId: 'test-branch',
            });
            (0, bun_test_1.expect)(mapping?.get('child-id')?.component).toBe('Child');
            (0, bun_test_1.expect)(mapping?.get('parent-id')?.component).toBe('Parent');
        });
        (0, bun_test_1.test)('should handle dynamic array elements', () => {
            const code = `
                function List() {
                    return (
                        <div>
                            {items.map(item => (
                                <div data-oid="list-item">Item</div>
                            ))}
                        </div>
                    );
                }
            `;
            const ast = (0, src_1.getAstFromContent)(code);
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            const mapping = (0, map_1.createTemplateNodeMap)({
                ast,
                filename: 'test.tsx',
                branchId: 'test-branch',
            });
            (0, bun_test_1.expect)(mapping?.get('list-item')?.dynamicType).toBe(models_1.DynamicType.ARRAY);
        });
        (0, bun_test_1.test)('should handle conditional elements', () => {
            const code = `
                function Conditional() {
                    return (
                        <div>
                            {condition ? <div data-oid="cond-id">True</div> : null}
                        </div>
                    );
                }
            `;
            const ast = (0, src_1.getAstFromContent)(code);
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            const mapping = (0, map_1.createTemplateNodeMap)({
                ast,
                filename: 'test.tsx',
                branchId: 'test-branch',
            });
            (0, bun_test_1.expect)(mapping?.get('cond-id')?.dynamicType).toBe(models_1.DynamicType.CONDITIONAL);
        });
    });
    (0, bun_test_1.describe)('isNodeElementArray', () => {
        (0, bun_test_1.test)('should identify array map calls', () => {
            const mapCall = t.callExpression(t.memberExpression(t.identifier('items'), t.identifier('map')), []);
            (0, bun_test_1.expect)((0, map_1.isNodeElementArray)(mapCall)).toBe(true);
        });
        (0, bun_test_1.test)('should return false for non-map calls', () => {
            const nonMapCall = t.callExpression(t.memberExpression(t.identifier('items'), t.identifier('filter')), []);
            (0, bun_test_1.expect)((0, map_1.isNodeElementArray)(nonMapCall)).toBe(false);
        });
    });
    (0, bun_test_1.describe)('getCoreElementInfo', () => {
        (0, bun_test_1.test)('should identify component root elements', () => {
            const code = `
                function App() {
                    return <div data-oid="root">Root</div>;
                }
            `;
            const ast = (0, src_1.getAstFromContent)(code);
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            let rootElement;
            // Find the JSX element in the AST
            (0, packages_1.traverse)(ast, {
                JSXElement(path) {
                    rootElement = path;
                },
            });
            (0, bun_test_1.expect)(rootElement && (0, map_1.getCoreElementInfo)(rootElement)).toBe(models_1.CoreElementType.COMPONENT_ROOT);
        });
        (0, bun_test_1.test)('should identify body tags', () => {
            const code = `
                function App() {
                    return <html><body data-oid="body">Content</body></html>;
                }
            `;
            const ast = (0, src_1.getAstFromContent)(code);
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            let bodyElement;
            (0, packages_1.traverse)(ast, {
                JSXElement(path) {
                    if (t.isJSXIdentifier(path.node.openingElement.name) &&
                        path.node.openingElement.name.name === 'body') {
                        bodyElement = path;
                    }
                },
            });
            (0, bun_test_1.expect)(bodyElement && (0, map_1.getCoreElementInfo)(bodyElement)).toBe(models_1.CoreElementType.BODY_TAG);
        });
    });
    (0, bun_test_1.describe)('getDynamicTypeInfo', () => {
        (0, bun_test_1.test)('should identify conditional elements', () => {
            const code = `
                function App() {
                    return <div>{condition ? <div data-oid="cond">Test</div> : null}</div>;
                }
            `;
            const ast = (0, src_1.getAstFromContent)(code);
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            let conditionalElement;
            (0, packages_1.traverse)(ast, {
                JSXElement(path) {
                    if (path.node.openingElement.attributes.some((attr) => t.isJSXAttribute(attr) && attr.name.name === 'data-oid')) {
                        conditionalElement = path;
                    }
                },
            });
            (0, bun_test_1.expect)(conditionalElement && (0, map_1.getDynamicTypeInfo)(conditionalElement)).toBe(models_1.DynamicType.CONDITIONAL);
        });
        (0, bun_test_1.test)('should identify array elements', () => {
            const code = `
                function App() {
                    return <div>{items.map(item => <div data-oid="item">Test</div>)}</div>;
                }
            `;
            const ast = (0, src_1.getAstFromContent)(code);
            if (!ast) {
                throw new Error('Failed to get ast');
            }
            let arrayElement;
            (0, packages_1.traverse)(ast, {
                JSXElement(path) {
                    if (path.node.openingElement.attributes.some((attr) => t.isJSXAttribute(attr) && attr.name.name === 'data-oid')) {
                        arrayElement = path;
                    }
                },
            });
            (0, bun_test_1.expect)(arrayElement && (0, map_1.getDynamicTypeInfo)(arrayElement)).toBe(models_1.DynamicType.ARRAY);
        });
    });
});
//# sourceMappingURL=template.test.js.map