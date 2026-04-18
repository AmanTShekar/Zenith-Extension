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
exports.extractComponentsFromDirectory = extractComponentsFromDirectory;
const ts_morph_1 = require("ts-morph");
const path = __importStar(require("path"));
const fs_1 = require("fs");
function isUppercase(s) {
    return s === s.toUpperCase();
}
function isExported(node) {
    return node.getModifiers().some((m) => m.getKind() === ts_morph_1.ts.SyntaxKind.ExportKeyword);
}
function getReactComponentDescriptor(node) {
    if (ts_morph_1.Node.isVariableStatement(node)) {
        if (!isExported(node)) {
            return null;
        }
        const declaration = node.getDeclarationList().getDeclarations().at(0);
        if (declaration == null) {
            return null;
        }
        const name = declaration.getName();
        if (name == null || !isUppercase(name[0])) {
            return null;
        }
        const initializer = declaration.getInitializer();
        if (ts_morph_1.Node.isArrowFunction(initializer)) {
            return { name };
        }
    }
    if (ts_morph_1.Node.isFunctionDeclaration(node)) {
        if (!isExported(node)) {
            return null;
        }
        const name = node.getName();
        if (name != null && isUppercase(name[0])) {
            return { name };
        }
    }
    if (ts_morph_1.Node.isClassDeclaration(node)) {
        if (!isExported(node)) {
            return null;
        }
        const heritageClauses = node.getHeritageClauses();
        if (heritageClauses == null) {
            return null;
        }
        const isDerivedFromReactComponent = heritageClauses.some((clause) => clause.getText().includes('React.Component') ||
            clause.getText().includes('React.PureComponent'));
        if (!isDerivedFromReactComponent) {
            return null;
        }
        const name = node.getName();
        if (name == null) {
            return null;
        }
        return { name };
    }
    return null;
}
function extractReactComponentsFromFile(filePath) {
    const project = new ts_morph_1.Project();
    const sourceFile = project.addSourceFileAtPath(filePath);
    const exportedComponents = [];
    sourceFile.forEachChild((node) => {
        const descriptor = getReactComponentDescriptor(node);
        if (descriptor != null) {
            exportedComponents.push({
                ...descriptor,
                sourceFilePath: sourceFile.getFilePath(),
            });
        }
    });
    return exportedComponents;
}
async function scanDirectory(dir) {
    const filesInDirectory = await fs_1.promises.readdir(dir);
    const validFiles = await Promise.all(filesInDirectory.flatMap(async (file) => {
        const fullPath = path.join(dir, file);
        if (fullPath.endsWith('node_modules')) {
            return [];
        }
        const isDirectory = (await fs_1.promises.lstat(fullPath)).isDirectory();
        if (isDirectory) {
            return scanDirectory(fullPath);
        }
        if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            return [fullPath];
        }
        return [];
    }));
    return validFiles.flat();
}
async function extractComponentsFromDirectory(dir) {
    const files = await scanDirectory(dir);
    const allExportedComponents = [];
    files.forEach((file) => {
        const components = extractReactComponentsFromFile(file);
        allExportedComponents.push(...components);
    });
    return allExportedComponents;
}
//# sourceMappingURL=components.js.map