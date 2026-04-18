"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepFooter = exports.StepContent = exports.StepHeader = void 0;
const motion_card_1 = require("@onlook/ui/motion-card");
const react_1 = require("motion/react");
const react_2 = require("motion/react");
const StepHeader = ({ children }) => (<motion_card_1.MotionCardHeader>{children}</motion_card_1.MotionCardHeader>);
exports.StepHeader = StepHeader;
const StepContent = ({ children }) => (<motion_card_1.MotionCardContent className="flex items-center w-full min-h-24">
        <react_1.MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
            <react_2.AnimatePresence mode="popLayout">{children}</react_2.AnimatePresence>
        </react_1.MotionConfig>
    </motion_card_1.MotionCardContent>);
exports.StepContent = StepContent;
const StepFooter = ({ children }) => (<motion_card_1.MotionCardFooter layout="position" className="text-sm pb-6 flex flex-row w-full justify-between">
        {children}
    </motion_card_1.MotionCardFooter>);
exports.StepFooter = StepFooter;
//# sourceMappingURL=steps.js.map