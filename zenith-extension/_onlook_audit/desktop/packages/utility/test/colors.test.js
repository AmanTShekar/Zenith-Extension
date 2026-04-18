"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const color_1 = require("../src/color");
(0, bun_test_1.describe)('ColorUtil', () => {
    (0, bun_test_1.describe)('Color From Hex-Like String', () => {
        (0, bun_test_1.it)('should create a color', () => {
            (0, bun_test_1.expect)(color_1.Color.from('fff')?.toHex8()).toEqual('#FFFFFFFF');
            (0, bun_test_1.expect)(color_1.Color.from('000')?.toHex8()).toEqual('#000000FF');
            (0, bun_test_1.expect)(color_1.Color.from('2')?.toHex8()).toEqual('#222222FF');
            (0, bun_test_1.expect)(color_1.Color.from('34')?.toHex8()).toEqual('#343434FF');
            (0, bun_test_1.expect)(color_1.Color.from('123')?.toHex8()).toEqual('#112233FF');
            (0, bun_test_1.expect)(color_1.Color.from('123456')?.toHex8()).toEqual('#123456FF');
            (0, bun_test_1.expect)(color_1.Color.from('12345678')?.toHex8()).toEqual('#12345678');
            (0, bun_test_1.expect)(color_1.Color.from('#2')?.toHex8()).toEqual('#222222FF');
            (0, bun_test_1.expect)(color_1.Color.from('#34')?.toHex8()).toEqual('#343434FF');
            (0, bun_test_1.expect)(color_1.Color.from('#123')?.toHex8()).toEqual('#112233FF');
            (0, bun_test_1.expect)(color_1.Color.from('#123456')?.toHex8()).toEqual('#123456FF');
            (0, bun_test_1.expect)(color_1.Color.from('#12345678')?.toHex8()).toEqual('#12345678');
        });
    });
    (0, bun_test_1.describe)('Color From cssColor names', () => {
        (0, bun_test_1.it)('should create a color', () => {
            (0, bun_test_1.expect)(color_1.Color.from('black')?.toHex8()).toEqual('#000000FF');
            (0, bun_test_1.expect)(color_1.Color.from('white')?.toHex8()).toEqual('#FFFFFFFF');
            (0, bun_test_1.expect)(color_1.Color.from('pink')?.toHex8()).toEqual('#FFC0CBFF');
            (0, bun_test_1.expect)(color_1.Color.from('red')?.toHex8()).toEqual('#FF0000FF');
        });
    });
    (0, bun_test_1.describe)('Color Names', () => {
        (0, bun_test_1.it)('should name colors', () => {
            (0, bun_test_1.expect)(color_1.Color.from('F')?.name).toEqual('white');
            (0, bun_test_1.expect)(color_1.Color.black.name).toEqual('black');
        });
    });
    (0, bun_test_1.describe)('Color Palette', () => {
        (0, bun_test_1.it)('should create palette', () => {
            const palette = color_1.Color.from('blue')?.palette;
            const expectPalette = {
                name: 'blue',
                colors: {
                    50: '#E5E5FF',
                    100: '#CCCCFF',
                    200: '#9898FF',
                    300: '#6A6AFF',
                    400: '#3636FF',
                    500: '#0000FF',
                    600: '#0000C9',
                    700: '#000095',
                    800: '#000067',
                    900: '#000033',
                    950: '#000019',
                },
            };
            (0, bun_test_1.expect)(palette).toEqual(expectPalette);
        });
    });
});
//# sourceMappingURL=colors.test.js.map