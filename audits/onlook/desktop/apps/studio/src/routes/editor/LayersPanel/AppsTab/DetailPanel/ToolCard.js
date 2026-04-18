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
const react_1 = __importStar(require("react"));
const icons_1 = require("@onlook/ui/icons");
const utils_1 = require("@onlook/ui/utils");
const AppIcon = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 text-xl',
        md: 'w-8 h-8 text-2xl',
        lg: 'w-[60px] h-[60px] text-[32px]',
    };
    return (<div className={`flex items-center justify-center rounded-md bg-background-secondary text-white font-semibold border border-white/[0.07] ${sizeClasses[size]}`}></div>);
};
const ToolCard = ({ name, description, inputs, icon }) => {
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(false);
    return (<div className="border-b border-border last:border-b-0">
            <div className="flex items-center py-3 px-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="mr-3">{icon || <AppIcon size="sm"/>}</div>
                <div className="flex-1">
                    <h3 className="text-base font-normal text-white">{name}</h3>
                </div>
                <div>
                    <icons_1.Icons.ChevronDown className={(0, utils_1.cn)('h-5 w-5 text-gray-400 transition-transform', isExpanded ? 'transform rotate-180' : '')}/>
                </div>
            </div>

            {isExpanded && (<div className="px-3 pb-5">
                    {description && (<p className="text-sm font-normal text-muted-foreground mb-4 ml-[42px]">
                            {description}
                        </p>)}

                    {inputs && inputs.length > 0 && (<div className="rounded-md overflow-hidden border border-border">
                            <div className="bg-background-secondary/60 px-3 py-2">
                                <div className="flex text-sm font-normal">
                                    <div className="w-1/3 text-gray-400">Input</div>
                                    <div className="w-2/3 text-gray-400">Description</div>
                                </div>
                            </div>

                            {inputs.map((input, index) => (<div key={index} className="border-t border-border">
                                    <div className="flex px-3 py-3">
                                        <div className="w-1/3 flex flex-col gap-[2px]">
                                            <div className="text-white text-sm">{input.label}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {input.type}
                                            </div>
                                        </div>
                                        <div className="w-2/3 text-sm text-white">
                                            {input.description}
                                        </div>
                                    </div>
                                </div>))}
                        </div>)}
                </div>)}
        </div>);
};
exports.default = ToolCard;
//# sourceMappingURL=ToolCard.js.map