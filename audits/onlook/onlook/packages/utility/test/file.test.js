"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const file_1 = require("../src/file");
(0, bun_test_1.describe)('getMimeType', () => {
    (0, bun_test_1.it)('returns correct MIME type for .ico', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('favicon.ico')).toBe('image/x-icon');
    });
    (0, bun_test_1.it)('returns correct MIME type for .png', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('image.png')).toBe('image/png');
    });
    (0, bun_test_1.it)('returns correct MIME type for .jpg', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('photo.jpg')).toBe('image/jpeg');
    });
    (0, bun_test_1.it)('returns correct MIME type for .jpeg', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('photo.JPEG')).toBe('image/jpeg');
    });
    (0, bun_test_1.it)('returns correct MIME type for .svg', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('vector.SVG')).toBe('image/svg+xml');
    });
    (0, bun_test_1.it)('returns correct MIME type for .gif', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('animation.gif')).toBe('image/gif');
    });
    (0, bun_test_1.it)('returns correct MIME type for .webp', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('image.webp')).toBe('image/webp');
    });
    (0, bun_test_1.it)('returns correct MIME type for .bmp', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('bitmap.bmp')).toBe('image/bmp');
    });
    (0, bun_test_1.it)('returns application/octet-stream for unknown extension', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('file.unknown')).toBe('application/octet-stream');
    });
    (0, bun_test_1.it)('handles uppercase extensions', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('UPPERCASE.JPG')).toBe('image/jpeg');
    });
    (0, bun_test_1.it)('handles filenames without extension', () => {
        (0, bun_test_1.expect)((0, file_1.getMimeType)('noextension')).toBe('application/octet-stream');
    });
});
(0, bun_test_1.describe)('isImageFile', () => {
    (0, bun_test_1.describe)('should return true for supported image formats', () => {
        (0, bun_test_1.it)('returns true for JPEG files', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('photo.jpg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('image.jpeg')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for PNG files', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('image.png')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for GIF files', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('animation.gif')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for WebP files', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('image.webp')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for SVG files', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('vector.svg')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for ICO files', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('favicon.ico')).toBe(true);
        });
        (0, bun_test_1.it)('handles case insensitive extensions', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('PHOTO.JPG')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('IMAGE.PNG')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('ANIMATION.GIF')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('IMAGE.WEBP')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('VECTOR.SVG')).toBe(true);
        });
        (0, bun_test_1.it)('handles mixed case extensions', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('photo.Jpg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('image.Png')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('vector.Svg')).toBe(true);
        });
        (0, bun_test_1.it)('handles files with paths', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('/path/to/image.jpg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('folder/subfolder/photo.png')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('./assets/images/icon.svg')).toBe(true);
        });
        (0, bun_test_1.it)('handles files with multiple dots', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('my.image.file.jpg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('component.icon.svg')).toBe(true);
        });
    });
    (0, bun_test_1.describe)('should return false for unsupported formats', () => {
        (0, bun_test_1.it)('returns false for unsupported image formats', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('image.tiff')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('image.tif')).toBe(false);
        });
        (0, bun_test_1.it)('returns false for non-image files', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('document.txt')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('script.js')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('style.css')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('page.html')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('data.json')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('component.tsx')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('readme.md')).toBe(false);
        });
        (0, bun_test_1.it)('returns false for files without extensions', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('filename')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('README')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('Dockerfile')).toBe(false);
        });
        (0, bun_test_1.it)('returns false for empty or invalid inputs', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('.')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('..')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('.hidden')).toBe(false);
        });
        (0, bun_test_1.it)('returns false for files with only dots', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('...')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('....')).toBe(false);
        });
        (0, bun_test_1.it)('returns false for common non-image/non-video extensions', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('audio.mp3')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('archive.zip')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('document.pdf')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('document.txt')).toBe(false);
        });
        (0, bun_test_1.it)('returns true for video files', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('video.mp4')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('video.webm')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('video.ogg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('video.mov')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('video.avi')).toBe(true);
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.it)('handles filenames with special characters', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('my-image_file.jpg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('image (1).png')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('photo@2x.jpg')).toBe(true);
        });
        (0, bun_test_1.it)('handles very long filenames', () => {
            const longFilename = 'a'.repeat(200) + '.jpg';
            (0, bun_test_1.expect)((0, file_1.isImageFile)(longFilename)).toBe(true);
        });
        (0, bun_test_1.it)('handles filenames with unicode characters', () => {
            (0, bun_test_1.expect)((0, file_1.isImageFile)('图片.jpg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('画像.png')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isImageFile)('émoji😀.svg')).toBe(true);
        });
    });
});
(0, bun_test_1.describe)('isVideoFile', () => {
    (0, bun_test_1.describe)('should return true for video file extensions', () => {
        (0, bun_test_1.it)('returns true for mp4 files', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video.mp4')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('movie.MP4')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for webm files', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('clip.webm')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('recording.WEBM')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for ogg/ogv files', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video.ogg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video.ogv')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for mov files', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video.mov')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('clip.MOV')).toBe(true);
        });
        (0, bun_test_1.it)('returns true for avi files', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video.avi')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('movie.AVI')).toBe(true);
        });
    });
    (0, bun_test_1.describe)('should return true for video MIME types', () => {
        (0, bun_test_1.it)('returns true for video MIME types', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video/mp4')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video/webm')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video/ogg')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video/quicktime')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video/x-msvideo')).toBe(true);
        });
    });
    (0, bun_test_1.describe)('should return false for non-video formats', () => {
        (0, bun_test_1.it)('returns false for image files', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('image.jpg')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('image.png')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('image.gif')).toBe(false);
        });
        (0, bun_test_1.it)('returns false for audio files', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('audio.mp3')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('audio.wav')).toBe(false);
        });
        (0, bun_test_1.it)('returns false for document files', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('document.pdf')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('document.txt')).toBe(false);
        });
        (0, bun_test_1.it)('returns false for image MIME types', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('image/jpeg')).toBe(false);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('image/png')).toBe(false);
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.it)('handles filenames with special characters', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('my-video_file.mp4')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('video (1).webm')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('clip@2x.mov')).toBe(true);
        });
        (0, bun_test_1.it)('handles filenames with unicode characters', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('视频.mp4')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('ビデオ.webm')).toBe(true);
        });
        (0, bun_test_1.it)('handles full file paths with slashes', () => {
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('/public/gradient.mp4')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('/path/to/video.webm')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('./assets/video.mov')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('../videos/clip.avi')).toBe(true);
            (0, bun_test_1.expect)((0, file_1.isVideoFile)('/public/image.jpg')).toBe(false);
        });
    });
});
//# sourceMappingURL=file.test.js.map