"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileConflictAlert = void 0;
const react_1 = __importDefault(require("react"));
const button_1 = require("@onlook/ui/button");
const icons_1 = require("@onlook/ui/icons");
const FileConflictAlert = ({ filename, onUseExternalChanges, onKeepLocalChanges, }) => {
    return (<div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <icons_1.Icons.File className="text-amber-500 h-5 w-5"/>
                <span className="text-sm">
                    <strong>{filename}</strong> has been modified outside the editor.
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <button_1.Button variant="outline" size="sm" onClick={onKeepLocalChanges}>
                    Keep my changes
                </button_1.Button>
                <button_1.Button variant="default" size="sm" onClick={onUseExternalChanges}>
                    Use external changes
                </button_1.Button>
            </div>
        </div>);
};
exports.FileConflictAlert = FileConflictAlert;
//# sourceMappingURL=FileConflictAlert.js.map