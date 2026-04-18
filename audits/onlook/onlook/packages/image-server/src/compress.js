"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressImageServer = compressImageServer;
exports.batchCompressImagesServer = batchCompressImagesServer;
const promises_1 = __importDefault(require("node:fs/promises"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
async function compressImageServer(input, outputPath, options = {}) {
    try {
        const { quality = 80, width, height, format = 'auto', progressive = true, mozjpeg = true, effort = 4, compressionLevel = 6, keepAspectRatio = true, withoutEnlargement = true, } = options;
        // Check if input is a file path and determine if we should skip certain formats
        if (typeof input === 'string') {
            const fileExtension = path_1.default.extname(input).toLowerCase();
            if (fileExtension === '.ico' || fileExtension === '.svg') {
                return {
                    success: false,
                    error: `Skipping ${fileExtension.toUpperCase()} file - format not supported for compression. Use original file instead.`,
                };
            }
        }
        // Initialize Sharp instance
        let sharpInstance = (0, sharp_1.default)(input);
        let originalSize;
        if (typeof input === 'string') {
            // Input is a file path
            const stats = await promises_1.default.stat(input);
            originalSize = stats.size;
        }
        else {
            // Input is a buffer
            originalSize = input.length;
        }
        // Get metadata to determine output format if auto
        const metadata = await sharpInstance.metadata();
        let outputFormat = format;
        // Additional check for SVG from metadata (in case they come as buffers)
        if (metadata.format === 'svg') {
            return {
                success: false,
                error: `Skipping SVG format - not supported for compression. Use original file instead.`,
            };
        }
        if (format === 'auto') {
            outputFormat = determineOptimalFormat(metadata.format);
        }
        // Apply resizing if dimensions are provided
        if (width || height) {
            const resizeOptions = {
                width,
                height,
                fit: keepAspectRatio ? sharp_1.default.fit.inside : sharp_1.default.fit.fill,
                withoutEnlargement,
            };
            sharpInstance = sharpInstance.resize(resizeOptions);
        }
        // Apply format-specific compression
        sharpInstance = applyFormatCompression(sharpInstance, outputFormat, {
            quality,
            progressive,
            mozjpeg,
            effort,
            compressionLevel,
        });
        let result;
        if (outputPath) {
            // Save to file
            const info = await sharpInstance.toFile(outputPath);
            const compressedSize = info.size;
            result = {
                success: true,
                originalSize,
                compressedSize,
                compressionRatio: originalSize
                    ? ((originalSize - compressedSize) / originalSize) * 100
                    : undefined,
                outputPath,
            };
        }
        else {
            // Return buffer
            const buffer = await sharpInstance.toBuffer({ resolveWithObject: true });
            const compressedSize = buffer.data.length;
            result = {
                success: true,
                originalSize,
                compressedSize,
                compressionRatio: originalSize
                    ? ((originalSize - compressedSize) / originalSize) * 100
                    : undefined,
                buffer: buffer.data,
            };
        }
        return result;
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}
/**
 * Batch compress multiple images on server
 */
async function batchCompressImagesServer(inputPaths, outputDir, options = {}) {
    try {
        // Ensure output directory exists
        await promises_1.default.mkdir(outputDir, { recursive: true });
        // Filter out ICO and SVG files before processing
        const supportedPaths = inputPaths.filter((inputPath) => {
            const fileExtension = path_1.default.extname(inputPath).toLowerCase();
            return fileExtension !== '.ico' && fileExtension !== '.svg';
        });
        // Create results array with skipped files
        const results = [];
        for (const inputPath of inputPaths) {
            const fileExtension = path_1.default.extname(inputPath).toLowerCase();
            if (fileExtension === '.ico' || fileExtension === '.svg') {
                // Add skip result for unsupported formats
                results.push({
                    success: false,
                    error: `Skipped ${fileExtension.toUpperCase()} file: ${path_1.default.basename(inputPath)} - format not supported for compression`,
                });
            }
        }
        const compressionPromises = supportedPaths.map(async (inputPath) => {
            const fileName = path_1.default.basename(inputPath);
            const nameWithoutExt = path_1.default.parse(fileName).name;
            const outputFormat = options.format === 'auto' ? 'webp' : options.format || 'webp';
            const outputPath = path_1.default.join(outputDir, `${nameWithoutExt}.${outputFormat}`);
            return compressImageServer(inputPath, outputPath, options);
        });
        const compressionResults = await Promise.all(compressionPromises);
        results.push(...compressionResults);
        return results;
    }
    catch (error) {
        return [
            {
                success: false,
                error: error instanceof Error ? error.message : 'Batch compression failed',
            },
        ];
    }
}
/**
 * Helper function to determine optimal format based on input
 */
const determineOptimalFormat = (inputFormat) => {
    if (!inputFormat)
        return 'webp';
    switch (inputFormat.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
            return 'jpeg';
        case 'png':
            return 'png';
        case 'gif':
            return 'webp'; // Convert GIF to WebP for better compression
        case 'tiff':
        case 'tif':
            return 'jpeg';
        default:
            return 'webp'; // Default to WebP for best compression
    }
};
/**
 * Apply format-specific compression settings
 */
const applyFormatCompression = (sharpInstance, format, options) => {
    const { quality, progressive, mozjpeg, effort, compressionLevel } = options;
    switch (format) {
        case 'jpeg':
            return sharpInstance.jpeg({
                quality,
                progressive,
                mozjpeg,
            });
        case 'png':
            return sharpInstance.png({
                compressionLevel,
                progressive,
            });
        case 'webp':
            return sharpInstance.webp({
                quality,
                effort,
            });
        case 'avif':
            return sharpInstance.avif({
                quality,
                effort,
            });
        default:
            return sharpInstance.webp({
                quality,
                effort,
            });
    }
};
//# sourceMappingURL=compress.js.map