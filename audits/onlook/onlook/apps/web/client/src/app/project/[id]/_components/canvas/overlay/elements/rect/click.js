"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickRect = void 0;
const utils_1 = require("@/components/store/editor/overlay/utils");
const tokens_1 = require("@onlook/ui/tokens");
const nanoid_1 = require("nanoid");
const base_1 = require("./base");
const resize_1 = require("./resize");
const parseCssBoxValues = (value) => {
    const originalValues = value.split(' ').map((v) => parseInt(v));
    const adjustedValues = originalValues.map((v) => Math.round((0, utils_1.adaptValueToCanvas)(v)));
    let original = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
    let adjusted = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
    switch (originalValues.length) {
        case 1:
            original = {
                top: originalValues[0] ?? 0,
                right: originalValues[0] ?? 0,
                bottom: originalValues[0] ?? 0,
                left: originalValues[0] ?? 0,
            };
            adjusted = {
                top: adjustedValues[0] ?? 0,
                right: adjustedValues[0] ?? 0,
                bottom: adjustedValues[0] ?? 0,
                left: adjustedValues[0] ?? 0,
            };
            break;
        case 2:
            original = {
                top: originalValues[0] ?? 0,
                right: originalValues[1] ?? 0,
                bottom: originalValues[0] ?? 0,
                left: originalValues[1] ?? 0,
            };
            adjusted = {
                top: adjustedValues[0] ?? 0,
                right: adjustedValues[1] ?? 0,
                bottom: adjustedValues[0] ?? 0,
                left: adjustedValues[1] ?? 0,
            };
            break;
        case 4:
            original = {
                top: originalValues[0] ?? 0,
                right: originalValues[1] ?? 0,
                bottom: originalValues[2] ?? 0,
                left: originalValues[3] ?? 0,
            };
            adjusted = {
                top: adjustedValues[0] ?? 0,
                right: adjustedValues[1] ?? 0,
                bottom: adjustedValues[2] ?? 0,
                left: adjustedValues[3] ?? 0,
            };
            break;
        default:
            original = { top: 0, right: 0, bottom: 0, left: 0 };
            adjusted = { top: 0, right: 0, bottom: 0, left: 0 };
            break;
    }
    return { adjusted, original };
};
const ClickRect = ({ width, height, top, left, isComponent, styles, shouldShowResizeHandles, }) => {
    const renderMarginLabels = () => {
        if (!styles?.computed.margin) {
            return null;
        }
        const { adjusted, original } = parseCssBoxValues(styles.computed.margin);
        const patternId = `margin-pattern-${(0, nanoid_1.nanoid)()}`;
        const maskId = `margin-mask-${(0, nanoid_1.nanoid)()}`;
        const checkMarginAuto = (side) => {
            const marginSide = styles?.defined?.[`margin-${side}`];
            const margin = styles?.defined?.margin;
            const isMarginNumber = marginSide && /^\d+/.test(marginSide);
            if (isMarginNumber) {
                return false;
            }
            return marginSide === 'auto' || margin === 'auto';
        };
        return (<>
                <defs>
                    <pattern id={patternId} patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill={tokens_1.colors.blue[500]} fillOpacity="0.1"/>
                        <line x1="0" y1="20" x2="20" y2="0" stroke={tokens_1.colors.blue[500]} strokeWidth="0.3" strokeLinecap="square"/>
                    </pattern>
                    <mask id={maskId}>
                        <rect x={-adjusted.left} y={-adjusted.top} width={width + adjusted.left + adjusted.right} height={height + adjusted.top + adjusted.bottom} fill="white"/>
                        <rect x="0" y="0" width={width} height={height} fill="black"/>
                    </mask>
                </defs>
                <rect x={-adjusted.left} y={-adjusted.top} width={width + adjusted.left + adjusted.right} height={height + adjusted.top + adjusted.bottom} fill={`url(#${patternId})`} mask={`url(#${maskId})`}/>

                {/* Keep existing margin labels */}
                {original.top > 0 && (<text x={width / 2} y={-adjusted.top / 2} fill={tokens_1.colors.blue[700]} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                        {checkMarginAuto('top') ? 'auto' : original.top}
                    </text>)}
                {original.bottom > 0 && (<text x={width / 2} y={height + adjusted.bottom / 2} fill={tokens_1.colors.blue[700]} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                        {checkMarginAuto('bottom') ? 'auto' : original.bottom}
                    </text>)}
                {original.left > 0 && (<text x={-adjusted.left / 2} y={height / 2} fill={tokens_1.colors.blue[700]} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                        {checkMarginAuto('left') ? 'auto' : original.left}
                    </text>)}
                {original.right > 0 && (<text x={width + adjusted.right / 2} y={height / 2} fill={tokens_1.colors.blue[700]} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                        {checkMarginAuto('right') ? 'auto' : original.right}
                    </text>)}
            </>);
    };
    const renderPaddingLabels = () => {
        if (!styles?.computed.padding) {
            return null;
        }
        const { adjusted, original } = parseCssBoxValues(styles.computed.padding);
        const patternId = `padding-pattern-${(0, nanoid_1.nanoid)()}`;
        const maskId = `padding-mask-${(0, nanoid_1.nanoid)()}`;
        const pWidth = width - adjusted.left - adjusted.right;
        const pHeight = height - adjusted.top - adjusted.bottom;
        return (<>
                <defs>
                    <pattern id={patternId} patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill={tokens_1.colors.green[500]} fillOpacity="0.1"/>
                        <line x1="0" y1="20" x2="20" y2="0" stroke={tokens_1.colors.green[500]} strokeWidth="0.3" strokeLinecap="square"/>
                    </pattern>
                    <mask id={maskId}>
                        <rect x="0" y="0" width={width} height={height} fill="white"/>
                        <rect x={adjusted.left} y={adjusted.top} width={pWidth} height={pHeight} fill="black"/>
                    </mask>
                </defs>
                <rect x="0" y="0" width={width} height={height} fill={`url(#${patternId})`} mask={`url(#${maskId})`}/>

                {/* Keep existing padding labels */}
                {original.top > 0 && (<text x={width / 2} y={adjusted.top / 2} fill={tokens_1.colors.green[700]} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                        {original.top}
                    </text>)}
                {original.bottom > 0 && (<text x={width / 2} y={height - adjusted.bottom / 2} fill={tokens_1.colors.green[700]} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                        {original.bottom}
                    </text>)}
                {original.left > 0 && (<text x={adjusted.left / 2} y={height / 2} fill={tokens_1.colors.green[700]} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                        {original.left}
                    </text>)}
                {original.right > 0 && (<text x={width - adjusted.right / 2} y={height / 2} fill={tokens_1.colors.green[700]} fontSize="10" textAnchor="middle" dominantBaseline="middle">
                        {original.right}
                    </text>)}
            </>);
    };
    const isAbsolutelyPositioned = styles?.computed?.position === 'absolute';
    const shouldShowHandles = shouldShowResizeHandles && isAbsolutelyPositioned;
    return (<base_1.BaseRect width={width} height={height} top={top} left={left} isComponent={isComponent} strokeWidth={2}>
            {renderMarginLabels()}
            {renderPaddingLabels()}
            {shouldShowHandles && (<resize_1.ResizeHandles width={width} height={height} left={left} top={top} borderRadius={parseInt(styles?.computed.borderRadius ?? '0')} isComponent={isComponent} styles={styles?.computed ?? {}}/>)}
        </base_1.BaseRect>);
};
exports.ClickRect = ClickRect;
//# sourceMappingURL=click.js.map