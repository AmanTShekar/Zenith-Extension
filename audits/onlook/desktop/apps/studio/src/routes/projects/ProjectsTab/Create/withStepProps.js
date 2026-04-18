"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withStepProps = withStepProps;
const motion_card_1 = require("@onlook/ui/motion-card");
function withStepProps(Component) {
    return {
        header: (props) => (<motion_card_1.MotionCardHeader>
                <Component props={props} variant="header"/>
            </motion_card_1.MotionCardHeader>),
        content: (props) => (<motion_card_1.MotionCardContent className="flex items-center w-full min-h-24">
                <Component props={props} variant="content"/>
            </motion_card_1.MotionCardContent>),
        footerButtons: (props) => <Component props={props} variant="footer"/>,
    };
}
//# sourceMappingURL=withStepProps.js.map