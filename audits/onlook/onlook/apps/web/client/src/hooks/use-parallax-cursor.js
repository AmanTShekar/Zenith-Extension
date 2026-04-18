"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useParallaxCursor = useParallaxCursor;
const react_1 = require("react");
function useParallaxCursor(options) {
    const { intensity = 0.02, smoothness = 0.1 } = options || {};
    const [mousePosition, setMousePosition] = (0, react_1.useState)({ x: 0, y: 0 });
    const [parallaxPosition, setParallaxPosition] = (0, react_1.useState)({ x: 0, y: 0 });
    const animationFrameRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const handleMouseMove = (event) => {
            const { clientX, clientY } = event;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            // Calculate distance from center (magnetic effect)
            const distanceX = (clientX - centerX) / centerX;
            const distanceY = (clientY - centerY) / centerY;
            // Apply inverse square law for magnetic attraction
            const magneticX = distanceX * Math.abs(distanceX) * intensity;
            const magneticY = distanceY * Math.abs(distanceY) * intensity;
            setMousePosition({ x: magneticX, y: magneticY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity]);
    (0, react_1.useEffect)(() => {
        const animate = () => {
            setParallaxPosition(prev => ({
                x: prev.x + (mousePosition.x - prev.x) * smoothness,
                y: prev.y + (mousePosition.y - prev.y) * smoothness,
            }));
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animationFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [mousePosition, smoothness]);
    return parallaxPosition;
}
//# sourceMappingURL=use-parallax-cursor.js.map