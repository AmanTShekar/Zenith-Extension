"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyImage = LazyImage;
const react_1 = require("motion/react");
const react_2 = require("react");
function LazyImage({ src, alt, className = "", placeholderClassName = "", onLoad, onError, cardStyle = false }) {
    const [isLoaded, setIsLoaded] = (0, react_2.useState)(false);
    const [isInView, setIsInView] = (0, react_2.useState)(false);
    const [hasError, setHasError] = (0, react_2.useState)(false);
    const imgRef = (0, react_2.useRef)(null);
    const containerRef = (0, react_2.useRef)(null);
    (0, react_2.useEffect)(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) {
                setIsInView(true);
                observer.disconnect();
            }
        }, {
            rootMargin: "50px"
        });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);
    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };
    const handleError = () => {
        setHasError(true);
        onError?.();
    };
    const renderImageContent = () => (<>
            <div className={`absolute inset-0 bg-secondary ${placeholderClassName}`}/>

            {!isLoaded && !hasError && (<div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent animate-shimmer"/>)}

            {isInView && !hasError && src && (<react_1.motion.img ref={imgRef} src={src} alt={alt} className={cardStyle ? "absolute inset-0 w-full h-full object-cover" : `absolute inset-0 w-full h-full object-cover ${className}`} onLoad={handleLoad} onError={handleError} initial={{ opacity: 0 }} animate={{ opacity: isLoaded ? 1 : 0 }} transition={{
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}/>)}

            {(hasError || !src) && (<div className="absolute inset-0 bg-secondary flex items-center justify-center">
                    <div className="text-foreground-tertiary text-lg">
                        {hasError ? 'Failed to load' : 'No image available'}
                    </div>
                </div>)}
        </>);
    return (<div ref={containerRef} className={`relative overflow-hidden ${cardStyle ? '' : className}`}>
            {cardStyle ? (<div className="ml-4 mr-4 mt-4 mb-0 h-full">
                    <div className="relative h-full rounded-lg overflow-hidden bg-white shadow-lg">
                        {renderImageContent()}
                    </div>
                </div>) : (renderImageContent())}
        </div>);
}
//# sourceMappingURL=lazy-image.js.map