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
exports.MotionCardTitle = exports.MotionCardHeader = exports.MotionCardFooter = exports.MotionCardDescription = exports.MotionCardContent = exports.MotionCard = void 0;
const react_1 = require("motion/react");
const React = __importStar(require("react"));
const utils_1 = require("../utils");
const MotionCard = React.forwardRef(({ className, style, ...props }, ref) => (<react_1.motion.div ref={ref} className={(0, utils_1.cn)('relative', className)} style={{
        borderRadius: '12px',
        backdropFilter: 'blur(12px)',
        backgroundColor: 'hsl(var(--background) /0.6)',
        boxShadow: `
                    0px 0px 0px 0.5px hsl(var(--foreground) /0.2)
                `,
        color: 'var(--card-foreground)',
        ...style,
    }} {...props}>
            {props.children}
        </react_1.motion.div>));
exports.MotionCard = MotionCard;
MotionCard.displayName = 'MotionCard';
const MotionCardHeader = React.forwardRef(({ className, ...props }, ref) => (<react_1.motion.div ref={ref} className={(0, utils_1.cn)('flex flex-col space-y-1.5 p-6', className)} {...props}/>));
exports.MotionCardHeader = MotionCardHeader;
MotionCardHeader.displayName = 'MotionCardHeader';
const MotionCardTitle = React.forwardRef(({ className, ...props }, ref) => (<react_1.motion.h3 ref={ref} className={(0, utils_1.cn)('text-title3', className)} {...props}/>));
exports.MotionCardTitle = MotionCardTitle;
MotionCardTitle.displayName = 'MotionCardTitle';
const MotionCardDescription = React.forwardRef(({ className, ...props }, ref) => (<react_1.motion.p ref={ref} className={(0, utils_1.cn)('text-regular text-muted-foreground', className)} {...props}/>));
exports.MotionCardDescription = MotionCardDescription;
MotionCardDescription.displayName = 'MotionCardDescription';
const MotionCardContent = React.forwardRef(({ className, ...props }, ref) => (<react_1.motion.div ref={ref} className={(0, utils_1.cn)('p-6 pt-0', className)} {...props}/>));
exports.MotionCardContent = MotionCardContent;
MotionCardContent.displayName = 'MotionCardContent';
const MotionCardFooter = React.forwardRef(({ className, ...props }, ref) => (<react_1.motion.div ref={ref} className={(0, utils_1.cn)('flex items-center p-6 pt-0', className)} {...props}/>));
exports.MotionCardFooter = MotionCardFooter;
MotionCardFooter.displayName = 'MotionCardFooter';
//# sourceMappingURL=motion-card.js.map