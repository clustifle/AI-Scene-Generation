/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
}

export interface OutfitLayer {
  garment: WardrobeItem | null; // null represents the base model layer
  poseImages: Record<string, string>; // Maps composite key to image URL
  turntableImages?: Record<string, string>; // Maps angle instruction to image URL
}

export type ModelEngine = 'nano-banana' | 'gemini-flash';

export interface ProjectState {
  sceneImages: Record<string, string>;
  currentPoseIndex: number;
  currentCameraAngleIndex: number;
  currentLightingIndex: number;
  currentBackgroundIndex: number;
  currentFaceFilterIndex: number;
  currentFacialExpressionIndex: number;
  currentAspectRatioIndex: number;
  modelImageUrl: string | null;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  thumbnailUrl: string;
  state: ProjectState;
}
