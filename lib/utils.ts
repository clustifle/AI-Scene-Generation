/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(error: unknown, context: string): string {
    let rawMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
        rawMessage = error.message;
    } else if (typeof error === 'string') {
        rawMessage = error;
    } else if (error) {
        rawMessage = String(error);
    }
    
    const lowerCaseMessage = rawMessage.toLowerCase();

    // Check for quota/rate limit errors
    if (
        lowerCaseMessage.includes('quota') ||
        lowerCaseMessage.includes('rate limit') ||
        lowerCaseMessage.includes('resource has been exhausted')
    ) {
        return 'Usage limit reached. This is a temporary restriction. Please wait a few moments before trying again.';
    }

    // Check for specific unsupported MIME type error from Gemini API
    if (rawMessage.includes("Unsupported MIME type")) {
        try {
            // It might be a JSON string like '{"error":{"message":"..."}}'
            const errorJson = JSON.parse(rawMessage);
            const nestedMessage = errorJson?.error?.message;
            if (nestedMessage && nestedMessage.includes("Unsupported MIME type")) {
                const mimeType = nestedMessage.split(': ')[1] || 'unsupported';
                return `File type '${mimeType}' is not supported. Please use a format like PNG, JPEG, or WEBP.`;
            }
        } catch (e) {
            // Not a JSON string, but contains the text. Fallthrough to generic message.
        }
        // Generic fallback for any "Unsupported MIME type" error
        return `Unsupported file format. Please upload an image format like PNG, JPEG, or WEBP.`;
    }
    
    return `${context}. ${rawMessage}`;
}

interface DownloadOptions {
  watermarkText?: string;
}

/**
 * Converts a data URL to PNG, optionally adds a watermark, then triggers a download.
 * @param dataUrl The source image data URL.
 * @param filename The base name for the downloaded file (without extension).
 * @param options Options for the download, like a watermark.
 * @returns A promise that resolves when the download is triggered, or rejects on error.
 */
export const downloadImage = (dataUrl: string, filename: string, options: DownloadOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Could not get canvas context.');
                }
                ctx.drawImage(img, 0, 0);

                // Add watermark if provided
                if (options.watermarkText) {
                    const fontSize = Math.max(18, Math.min(canvas.width / 30, canvas.height / 30));
                    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    
                    const padding = fontSize * 0.75;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(options.watermarkText, canvas.width - padding, canvas.height - padding);
                }

                const finalDataUrl = canvas.toDataURL('image/png');

                const link = document.createElement('a');
                link.href = finalDataUrl;
                link.download = `${filename.replace(/\s/g, '_') || 'download'}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                resolve();
            } catch (canvasError) {
                reject(canvasError instanceof Error ? canvasError : new Error(String(canvasError)));
            }
        };
        img.onerror = () => {
            reject(new Error('Failed to load image for download.'));
        };
        img.src = dataUrl;
    });
};