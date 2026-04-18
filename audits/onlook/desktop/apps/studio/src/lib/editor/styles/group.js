"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextGroup = exports.StyleGroup = exports.LayoutGroup = exports.PositionGroup = void 0;
const _1 = require(".");
const autolayout_1 = require("./autolayout");
const models_1 = require("./models");
const units_1 = require("./units");
const STYLE_CONSTRAINTS = {
    position: {
        min: -9999,
        max: 9999,
    },
    width: {
        min: 0,
        max: 9999,
    },
    height: {
        min: 0,
        max: 9999,
    },
    margin: {
        min: 0,
        max: 9999,
    },
    padding: {
        min: 0,
        max: 9999,
    },
    border: {
        radius: {
            min: 0,
            max: 9999,
        },
        width: {
            min: 0,
            max: 9999,
        },
    },
};
exports.PositionGroup = [
    new _1.CompoundStyleImpl(models_1.CompoundStyleKey.Position, new _1.SingleStyleImpl('position', 'relative', 'Position', models_1.StyleType.Select, {
        options: ['relative', 'absolute', 'fixed', 'static', 'sticky'],
    }), [
        new _1.SingleStyleImpl('top', '', 'Top', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
        }),
        new _1.SingleStyleImpl('right', '', 'Right', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
        }),
        new _1.SingleStyleImpl('bottom', '', 'Bottom', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
        }),
        new _1.SingleStyleImpl('left', '', 'Left', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
        }),
    ]),
    new _1.SingleStyleImpl('width', '', 'Width', models_1.StyleType.Dimensions, {
        units: Object.values(autolayout_1.LayoutMode),
        min: STYLE_CONSTRAINTS.width.min,
        max: STYLE_CONSTRAINTS.width.max,
    }),
    new _1.SingleStyleImpl('height', '', 'Height', models_1.StyleType.Dimensions, {
        units: Object.values(autolayout_1.LayoutMode),
        min: STYLE_CONSTRAINTS.height.min,
        max: STYLE_CONSTRAINTS.height.max,
    }),
];
exports.LayoutGroup = [
    new _1.CompoundStyleImpl(models_1.CompoundStyleKey.Display, new _1.SingleStyleImpl('display', 'block', 'Type', models_1.StyleType.Select, {
        options: ['block', 'flex', 'grid'],
    }), [
        new _1.SingleStyleImpl('flexDirection', 'row', 'Direction', models_1.StyleType.Select, {
            options: ['row', 'column'],
        }),
        new _1.SingleStyleImpl('justifyContent', 'flex-start', 'Horizontal', models_1.StyleType.Select, {
            options: ['flex-start', 'center', 'flex-end', 'space-between'],
        }),
        new _1.SingleStyleImpl('alignItems', 'flex-start', 'Vertical', models_1.StyleType.Select, {
            options: ['flex-start', 'center', 'flex-end', 'stretch'],
        }),
        new _1.SingleStyleImpl('gridTemplateColumns', '', 'Columns', models_1.StyleType.Text),
        new _1.SingleStyleImpl('gridTemplateRows', '', 'Rows', models_1.StyleType.Text),
        new _1.SingleStyleImpl('gap', '0px', 'Gap', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: 0,
            max: 1000,
        }),
    ]),
    new _1.CompoundStyleImpl(models_1.CompoundStyleKey.Margin, new _1.SingleStyleImpl('margin', '', 'Margin', models_1.StyleType.Number, {
        units: units_1.ELEMENT_STYLE_UNITS,
        min: STYLE_CONSTRAINTS.margin.min,
        max: STYLE_CONSTRAINTS.margin.max,
    }), [
        new _1.SingleStyleImpl('marginLeft', '', 'Left', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.margin.min,
            max: STYLE_CONSTRAINTS.margin.max,
        }),
        new _1.SingleStyleImpl('marginTop', '', 'Top', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.margin.min,
            max: STYLE_CONSTRAINTS.margin.max,
        }),
        new _1.SingleStyleImpl('marginRight', '', 'Right', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.margin.min,
            max: STYLE_CONSTRAINTS.margin.max,
        }),
        new _1.SingleStyleImpl('marginBottom', '', 'Bottom', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.margin.min,
            max: STYLE_CONSTRAINTS.margin.max,
        }),
    ]),
    new _1.CompoundStyleImpl(models_1.CompoundStyleKey.Padding, new _1.SingleStyleImpl('padding', '', 'Padding', models_1.StyleType.Number, {
        units: units_1.ELEMENT_STYLE_UNITS,
        min: STYLE_CONSTRAINTS.padding.min,
        max: STYLE_CONSTRAINTS.padding.max,
    }), [
        new _1.SingleStyleImpl('paddingLeft', '', 'Left', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.padding.min,
            max: STYLE_CONSTRAINTS.padding.max,
        }),
        new _1.SingleStyleImpl('paddingTop', '', 'Top', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.padding.min,
            max: STYLE_CONSTRAINTS.padding.max,
        }),
        new _1.SingleStyleImpl('paddingRight', '', 'Right', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.padding.min,
            max: STYLE_CONSTRAINTS.padding.max,
        }),
        new _1.SingleStyleImpl('paddingBottom', '', 'Bottom', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.padding.min,
            max: STYLE_CONSTRAINTS.padding.max,
        }),
    ]),
];
exports.StyleGroup = [
    new _1.SingleStyleImpl('opacity', '100', 'Opacity', models_1.StyleType.Number, {
        units: ['%'],
        min: 0,
        max: 100,
    }),
    new _1.CompoundStyleImpl(models_1.CompoundStyleKey.Fill, new _1.SingleStyleImpl('backgroundColor', '', 'Background', models_1.StyleType.Color), [
        new _1.SingleStyleImpl('backgroundImage', '', 'Image', models_1.StyleType.Image),
        new _1.SingleStyleImpl('backgroundSize', '', 'Size', models_1.StyleType.Select, {
            options: ['cover', 'contain', 'auto'],
        }),
        new _1.SingleStyleImpl('backgroundPosition', '', 'Position', models_1.StyleType.Select, {
            options: ['center', 'top', 'bottom', 'left', 'right'],
        }),
        new _1.SingleStyleImpl('backgroundRepeat', '', 'Repeat', models_1.StyleType.Select, {
            options: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'],
        }),
    ]),
    new _1.CompoundStyleImpl(models_1.CompoundStyleKey.Corners, new _1.SingleStyleImpl('borderRadius', '', 'Corners', models_1.StyleType.Number, {
        units: units_1.ELEMENT_STYLE_UNITS,
        min: STYLE_CONSTRAINTS.border.radius.min,
        max: STYLE_CONSTRAINTS.border.radius.max,
    }), [
        new _1.SingleStyleImpl('borderTopLeftRadius', '', 'Top Left', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.border.radius.min,
            max: STYLE_CONSTRAINTS.border.radius.max,
        }),
        new _1.SingleStyleImpl('borderTopRightRadius', '', 'Top Right', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.border.radius.min,
            max: STYLE_CONSTRAINTS.border.radius.max,
        }),
        new _1.SingleStyleImpl('borderBottomLeftRadius', '', 'Bottom Left', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.border.radius.min,
            max: STYLE_CONSTRAINTS.border.radius.max,
        }),
        new _1.SingleStyleImpl('borderBottomRightRadius', '', 'Bottom Right', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.border.radius.min,
            max: STYLE_CONSTRAINTS.border.radius.max,
        }),
    ]),
    new _1.CompoundStyleImpl(models_1.CompoundStyleKey.Border, new _1.SingleStyleImpl('borderColor', '', 'Border', models_1.StyleType.Color), [
        new _1.SingleStyleImpl('borderWidth', '', 'Width', models_1.StyleType.Number, {
            units: units_1.ELEMENT_STYLE_UNITS,
            min: STYLE_CONSTRAINTS.border.width.min,
            max: STYLE_CONSTRAINTS.border.width.max,
        }),
        new _1.SingleStyleImpl('borderStyle', '', 'Style', models_1.StyleType.Select, {
            options: ['solid', 'dotted', 'dashed'],
        }),
    ]),
    new _1.SingleStyleImpl('overflow', 'visible', 'Overflow', models_1.StyleType.Select, {
        options: ['visible', 'hidden', 'scroll', 'auto'],
    }),
];
exports.TextGroup = [
    new _1.SingleStyleImpl('fontFamily', '', 'Font', models_1.StyleType.Font),
    new _1.SingleStyleImpl('textTransform', 'none', 'Transform', models_1.StyleType.Select, {
        options: ['none', 'capitalize', 'uppercase', 'lowercase'],
    }),
    new _1.SingleStyleImpl('color', '#000000', 'Color', models_1.StyleType.Color),
    new _1.SingleStyleImpl('fontSize', '16px', 'Size', models_1.StyleType.Number, {
        units: units_1.ELEMENT_STYLE_UNITS,
        min: 1,
        max: 1000,
    }),
    new _1.SingleStyleImpl('fontWeight', 'normal', 'Weight', models_1.StyleType.Select, {
        options: [
            'lighter',
            'normal',
            'bold',
            '100',
            '200',
            '300',
            '400',
            '500',
            '600',
            '700',
            '800',
            '900',
        ],
    }),
    new _1.SingleStyleImpl('letterSpacing', '0px', 'Letter', models_1.StyleType.Number, {
        units: units_1.ELEMENT_STYLE_UNITS,
        max: 100,
    }),
    new _1.SingleStyleImpl('lineHeight', '100%', 'Line Height', models_1.StyleType.Number, {
        units: ['%', 'px'],
        max: 1000,
    }),
    new _1.SingleStyleImpl('textAlign', 'start', 'Align', models_1.StyleType.Select, {
        options: ['start', 'center', 'end'],
    }),
];
//# sourceMappingURL=group.js.map