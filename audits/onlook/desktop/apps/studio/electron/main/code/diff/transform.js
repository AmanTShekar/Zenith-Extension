"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformAst = transformAst;
const traverse_1 = __importDefault(require("@babel/traverse"));
const actions_1 = require("@onlook/models/actions");
const group_1 = require("./group");
const helpers_1 = require("./helpers");
const image_1 = require("./image");
const insert_1 = require("./insert");
const move_1 = require("./move");
const remove_1 = require("./remove");
const style_1 = require("./style");
const text_1 = require("./text");
const helpers_2 = require("/common/helpers");
function transformAst(ast, oidToCodeDiff) {
    (0, traverse_1.default)(ast, {
        JSXElement(path) {
            const currentOid = (0, helpers_1.getOidFromJsxElement)(path.node.openingElement);
            if (!currentOid) {
                console.error('No oid found for jsx element');
                return;
            }
            const codeDiffRequest = oidToCodeDiff.get(currentOid);
            if (codeDiffRequest) {
                const { attributes, textContent, structureChanges } = codeDiffRequest;
                if (attributes) {
                    Object.entries(attributes).forEach(([key, value]) => {
                        if (key === 'className') {
                            if (codeDiffRequest.overrideClasses) {
                                (0, style_1.replaceNodeClasses)(path.node, value);
                            }
                            else {
                                (0, style_1.addClassToNode)(path.node, value);
                            }
                        }
                        else {
                            (0, style_1.updateNodeProp)(path.node, key, value);
                        }
                    });
                }
                if (textContent !== undefined && textContent !== null) {
                    (0, text_1.updateNodeTextContent)(path.node, textContent);
                }
                applyStructureChanges(path, structureChanges);
            }
        },
    });
}
function applyStructureChanges(path, actions) {
    if (actions.length === 0) {
        return;
    }
    for (const action of actions) {
        switch (action.type) {
            case actions_1.CodeActionType.MOVE:
                (0, move_1.moveElementInNode)(path, action);
                break;
            case actions_1.CodeActionType.INSERT:
                (0, insert_1.insertElementToNode)(path, action);
                break;
            case actions_1.CodeActionType.REMOVE:
                (0, remove_1.removeElementFromNode)(path, action);
                break;
            case actions_1.CodeActionType.GROUP:
                (0, group_1.groupElementsInNode)(path, action);
                break;
            case actions_1.CodeActionType.UNGROUP:
                (0, group_1.ungroupElementsInNode)(path, action);
                break;
            case actions_1.CodeActionType.INSERT_IMAGE:
                (0, image_1.insertImageToNode)(path, action);
                break;
            case actions_1.CodeActionType.REMOVE_IMAGE:
                (0, image_1.removeImageFromNode)(path, action);
                break;
            default:
                (0, helpers_2.assertNever)(action);
        }
    }
}
//# sourceMappingURL=transform.js.map