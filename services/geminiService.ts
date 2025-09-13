/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality, GenerateContentParameters } from "@google/genai";

const MAX_IMAGE_DIMENSION = 1024;

const resizeImageDataUrl = (dataUrl: string, fileName: string): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
                if (width > height) {
                    height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
                    width = MAX_IMAGE_DIMENSION;
                } else {
                    width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
                    height = MAX_IMAGE_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context.'));
            }
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new Error('Canvas toBlob failed.'));
                }
                // Use original filename, but force jpeg for better compression.
                const newFileName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
                const newFile = new File([blob], newFileName, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(newFile);
            }, 'image/jpeg', 0.9);
        };
        img.onerror = (errorEvent) => {
            const errorMessage = errorEvent instanceof Event ? 'An error occurred while loading the image.' : String(errorEvent);
            reject(new Error(errorMessage));
        }
    });
};

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error || new Error('An error occurred while reading the file.'));
    });
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
};

const dataUrlToParts = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    return { mimeType: mimeMatch[1], data: arr[1] };
}

const dataUrlToPart = (dataUrl: string) => {
    const { mimeType, data } = dataUrlToParts(dataUrl);
    return { inlineData: { mimeType, data } };
}

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        throw new Error(errorMessage);
    }

    // Find the first image part in any candidate
    for (const candidate of response.candidates ?? []) {
        const imagePart = candidate.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { mimeType, data } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        throw new Error(errorMessage);
    }
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image. ` + (textFeedback ? `The model responded with text: "${textFeedback}"` : "This can happen due to safety filters or if the request is too complex. Please try a different image.");
    throw new Error(errorMessage);
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


interface UserImageInput {
    url: string;
    name: string;
}

export const generateModelImage = async (userImage: UserImageInput): Promise<string> => {
    const model = 'gemini-2.5-flash-image-preview';
    const resizedImage = await resizeImageDataUrl(userImage.url, userImage.name);
    const userImagePart = await fileToPart(resizedImage);
    const prompt = `Your task is to professionalize the provided photo of a person for a fashion modeling context. The absolute highest priority is to maintain a 100% accurate, identical, 1:1 representation of the person.

**CRITICAL DIRECTIVES (HIGHEST PRIORITY):**
1.  **DO NOT CHANGE THE PERSON:** The person in the output image MUST be an exact, photorealistic replica of the person in the original photo.
    *   **NO FACIAL CHANGES:** Do not alter their face, features, expression, or identity in any way.
    *   **NO BODY CHANGES:** Do not alter their body shape, proportions, or pose.
    *   **NO TEXTURE CHANGES:** Do not alter their skin tone, hair color, or hair style.
    *   The final result should look like the *same person* from the *same photo*, just with a different background.

**Secondary Task (Only if it does not violate Directive #1):**
2.  **STUDIO BACKGROUND:** Replace the original background completely with a clean, neutral, solid light-gray studio backdrop (#f0f0f0). The person should be cleanly isolated from the old background.
3.  **HIGH-QUALITY PHOTOREALISM:** Ensure the final image is of exceptionally high resolution, sharp, detailed, and photorealistic, as if taken with a professional DSLR camera. The lighting on the person should be adjusted to a professional studio environment, but without changing their appearance.

**OUTPUT:** Return ONLY the final image. Do not add text or any other content.`;

    const request: GenerateContentParameters = {
        model,
        contents: { parts: [userImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    };
    
    const response = await ai.models.generateContent(request);
    return handleApiResponse(response);
};

export const generateCollageImage = async (userImages: UserImageInput[]): Promise<string> => {
    const model = 'gemini-2.5-flash-image-preview';
    if (userImages.length < 2) {
        throw new Error("generateCollageImage requires at least two images.");
    }
    const resizedImages = await Promise.all(userImages.map(img => resizeImageDataUrl(img.url, img.name)));
    const userImageParts = await Promise.all(resizedImages.map(file => fileToPart(file)));

    const prompt = `Your task is to create a photorealistic collage by combining the people from the ${userImages.length} provided images into a single, cohesive scene.

**CRITICAL DIRECTIVES:**
1.  **Extract and Combine:** Accurately extract the primary person from each of the source images. Arrange them together in the new image in a natural composition.
2.  **Preserve Identity and Pose:** It is absolutely essential to maintain a 100% accurate, identical, 1:1 representation of each person. Do not alter their facial features, expressions, body shapes, or original poses from their respective photos.
3.  **Preserve Clothing:** The clothing worn by each person in their original photo must be kept exactly as is.
4.  **Cohesive Scene:** Place the individuals against a clean, neutral, solid light-gray studio backdrop (#f0f0f0).
5.  **Realistic Lighting:** Adjust the lighting and shadows on all individuals so they appear to be naturally in the same environment, creating a believable, unified photograph.
6.  **Full Body:** If the original images are full-body shots, ensure the final image also shows their full bodies.
7.  **High Quality Output:** The final generated image must be of high resolution, photorealistic, sharp, and detailed, as if taken with a professional camera. Ensure there are no artifacts or blurring.

**OUTPUT:** Return ONLY the final, combined image. Do not add any text or other elements.`;

    const request: GenerateContentParameters = {
        model,
        contents: { parts: [...userImageParts, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    };

    const response = await ai.models.generateContent(request);
    return handleApiResponse(response);
};

export const generatePoseVariation = async (tryOnImageUrl: string, poseInstruction: string, cameraAngle: string, lightingInstruction: string, backgroundInstruction: string, facialExpression: string, aspectRatio: string): Promise<string> => {
    const model = 'gemini-2.5-flash-image-preview';
    const tryOnImagePart = dataUrlToPart(tryOnImageUrl);
    
    const backgroundPrompt = backgroundInstruction === "Current Background"
        ? "3.  **Background Integrity:** The background from the original image must be maintained."
        : `3.  **Background Replacement:** Replace the original background completely with a new, photorealistic background matching this description: "${backgroundInstruction}". Ensure the lighting and shadows on the person match the new environment.`;

    const prompt = `You are an expert AI image editor specializing in photorealistic transformations. You will be given an image containing one or more people, and instructions for a new pose, camera angle, and lighting.

**Your task is to regenerate the image to match the new instructions while strictly adhering to these critical rules:**

1.  **Identity Preservation:** The identity, facial features, and appearance of every person in the original image MUST be perfectly preserved. They should look like the exact same people.
2.  **Clothing & Style Consistency:** The clothing, accessories, and overall style of each person must remain identical to the original image.
${backgroundPrompt}
4.  **Apply New Scene Properties:** Modify the scene to match the following instructions:
    *   **Pose:** "${poseInstruction}".
    *   **Facial Expression:** "${facialExpression}".
    *   **Camera Angle:** "${cameraAngle}".
    *   **Lighting:** "${lightingInstruction}".
    *   If the image contains multiple people and the pose instruction describes a group interaction (e.g., "hugging," "side-by-side"), apply the pose to all individuals so they are interacting as described.
    *   Ensure the new pose, camera perspective, and lighting are natural and physically plausible. The interaction between people, clothing, and the environment should be photorealistic.
5.  **Aspect Ratio**: The final output image MUST have a ${aspectRatio} aspect ratio. This is a command about the image dimensions.
6.  **Output:** Return ONLY the final, edited image. Do not add any text or other elements.`;
    
    const request: GenerateContentParameters = {
        model,
        contents: { parts: [tryOnImagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    };

    const response = await ai.models.generateContent(request);
    return handleApiResponse(response);
};

export const applyFaceFilter = async (imageUrl: string, filterStyle: string): Promise<string> => {
    const model = 'gemini-2.5-flash-image-preview';
    const imagePart = dataUrlToPart(imageUrl);
    const isPhotorealistic = filterStyle === 'Photorealistic';

    const prompt = isPhotorealistic
        ? `You are an expert AI image editor. Your task is to ensure the person's face in the provided image is 100% photorealistic.
          **CRITICAL DIRECTIVES:**
          1.  **RESTORE PHOTOREALISM:** If the face has any artistic styling (e.g., cartoon, sketch), convert it back to a perfectly photorealistic appearance.
          2.  **PRESERVE IDENTITY:** The person's identity, features, and expression MUST be preserved.
          3.  **NO OTHER CHANGES:** The clothing, body, pose, and background must remain completely unchanged.
          4.  **OUTPUT:** Return ONLY the final, edited image.`
        : `You are an expert AI image editor specializing in artistic filters. You will be given an image and a filter style.
          **CRITICAL DIRECTIVES:**
          1.  **APPLY FILTER TO FACE ONLY:** Apply a "${filterStyle}" artistic style exclusively to the face(s) of the person/people in the image.
          2.  **PRESERVE EVERYTHING ELSE:** The rest of the image—including hair, clothing, body, and the entire background—MUST remain in its original photorealistic state. Do not change them.
          3.  **BLEND SEAMLESSLY:** The transition between the artistically styled face and the photorealistic hair/neck should be seamless and natural.
          4.  **PRESERVE IDENTITY:** The person's underlying facial features and expression should still be recognizable after the filter is applied.
          5.  **OUTPUT:** Return ONLY the final, edited image. Do not include any text or other elements.`;

    const request: GenerateContentParameters = {
        model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    };
    
    const response = await ai.models.generateContent(request);
    return handleApiResponse(response);
};