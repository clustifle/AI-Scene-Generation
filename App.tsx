/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Canvas from './components/Canvas';
import ExportPage from './components/ExportPanel';
import Onboarding, { type OnboardingStep } from './components/Onboarding';
import { generatePoseVariation, applyFaceFilter } from './services/geminiService';
import { getFriendlyErrorMessage } from './lib/utils';
import Spinner from './components/Spinner';
import ConfirmationToast, { ErrorToast } from './components/ConfirmationToast';
import Footer from './components/Footer';
import type { Project, ProjectState } from './types';
import { getProjects, saveProjects } from './services/projectService';
import SaveProjectModal from './components/SaveProjectModal';
import EditorHeader from './components/EditorHeader';
import Dashboard from './components/Dashboard';

export interface Pose {
  label: string;
  category: string;
}

export const POSE_INSTRUCTIONS: Pose[] = [
  // Solo Poses
  { label: "Standing, confident smile, hands on hips", category: "Solo" },
  { label: "Walking towards camera, natural smile", category: "Solo" },
  { label: "Leaning against a wall, relaxed expression", category: "Solo" },
  { label: "Slightly turned 3/4 view, soft smile", category: "Solo" },
  { label: "Candid laughing, looking slightly away", category: "Solo" },
  { label: "Dynamic action pose, mid-jump, joyful expression", category: "Solo" },
  { label: "Sitting on a stool, thoughtful expression", category: "Solo" },
  { label: "Side profile, neutral expression", category: "Solo" },
  { label: "Power pose, arms crossed, serious look", category: "Solo" },
  { label: "Playful wink and a peace sign", category: "Solo" },
  { label: "Looking over the shoulder with a smile", category: "Solo" },
  { label: "Hands in pockets, casual stance", category: "Solo" },
  { label: "Twirling, joyful expression", category: "Solo" },
  { label: "Sitting on steps, looking thoughtful", category: "Solo" },
  { label: "Adjusting sunglasses, cool expression", category: "Solo" },
  // Couple Poses
  { label: "Two people standing side-by-side, smiling", category: "Couple" },
  { label: "One with arm around the other's shoulder", category: "Couple" },
  { label: "Facing each other, holding hands", category: "Couple" },
  { label: "Sitting on a park bench together", category: "Couple" },
  // Two Person Playful Poses
  { label: "Two people holding hands and walking", category: "Couple (Playful)" },
  { label: "Playful piggyback ride, laughing", category: "Couple (Playful)" },
  { label: "Back-to-back, relaxed and smiling", category: "Couple (Playful)" },
  { label: "Sharing a secret, whispering cheek to cheek", category: "Couple (Playful)" },
  { label: "One person playfully chasing the other, both laughing", category: "Couple (Playful)" },
  { label: "Making silly faces together at the camera", category: "Couple (Playful)" },
  { label: "One person lifting the other up, both laughing", category: "Couple (Playful)" },
  { label: "A celebratory high-five", category: "Couple (Playful)" },
  // Two Person Intimate Poses
  { label: "Two people hugging warmly, smiling", category: "Couple (Intimate)" },
  { label: "Leaning head on the other's shoulder", category: "Couple (Intimate)" },
  { label: "A gentle forehead kiss", category: "Couple (Intimate)" },
  { label: "Hugging intimately, serene expressions", category: "Couple (Intimate)" },
  { label: "Cuddling closely, looking at each other", category: "Couple (Intimate)" },
  { label: "Holding hands, foreheads touching", category: "Couple (Intimate)" },
  { label: "One carrying the other (princess carry), smiling", category: "Couple (Intimate)" },
  { label: "Nuzzling cheeks, soft smiles", category: "Couple (Intimate)" },
  { label: "Sharing an umbrella, huddled together", category: "Couple (Intimate)" },
  { label: "Dancing closely, looking into each other's eyes", category: "Couple (Intimate)" },
  { label: "One person giving a comforting hug from behind", category: "Couple (Intimate)" },
  { label: "Slow dancing in a dimly lit room", category: "Couple (Intimate)" },
  { label: "Sitting on a picnic blanket, sharing food", category: "Couple (Intimate)" },
  { label: "One person's head resting in the other's lap", category: "Couple (Intimate)" },
  // Three Person Poses
  { label: "Three people side-by-side, smiling", category: "Group (3 People)" },
  { label: "Candid group huddle, laughing", category: "Group (3 People)" },
  { label: "Center person with arms around the others", category: "Group (3 People)" },
  { label: "Walking together, interacting naturally", category: "Group (3 People)" },
  { label: "In a V-formation, looking at camera", category: "Group (3 People)" },
  { label: "Group hug, big smiles", category: "Group (3 People)" },
  { label: "Sitting in a row on a bench, looking in different directions", category: "Group (3 People)" },
  { label: "Jumping in the air at the same time", category: "Group (3 People)" },
  // Four Person Poses
  { label: "Four people in a line, smiling at camera", category: "Group (4 People)" },
  { label: "Two sitting in front, two standing behind", category: "Group (4 People)" },
  { label: "Dynamic group pose, varied heights and positions", category: "Group (4 People)" },
  { label: "Celebrating together, joyful expressions", category: "Group (4 People)" },
  { label: "Candid group conversation", category: "Group (4 People)" },
  { label: "In a tight huddle, telling a secret", category: "Group (4 People)" },
  { label: "Raising glasses for a toast", category: "Group (4 People)" },
  { label: "Pyramid pose, laughing", category: "Group (4 People)" },
  // Meme Poses
  { label: "Two people pointing at each other (Spider-Man)", category: "Meme" },
  { label: "Drake Hotline Bling reaction pose (solo)", category: "Meme" },
  { label: "Success Kid fist pump (solo)", category: "Meme" },
  { label: "Distracted boyfriend meme (3 people)", category: "Meme" },
  { label: "Woman yelling at a cat meme (2 people)", category: "Meme" },
];

export const CAMERA_ANGLES = [
  "Full body shot",
  "Medium shot (from waist up)",
  "Cowboy shot (mid-thigh up)",
  "Close-up shot (shoulders and head)",
  "POV Selfie",
  "Low-angle shot",
  "High-angle shot",
];

export const LIGHTING_OPTIONS = [
    "Natural Daylight Window",
    "Soft Ambient",
    "Studio",
    "Golden Hour",
    "Cinematic Rim Lighting",
    "Volumetric Lighting",
    "Dramatic",
    "Harsh Neon",
    "Night",
];

export const BACKGROUND_OPTIONS = [
  "Current Background",
  "Studio Gray",
  "Outdoor City Street",
  "Beach at Sunset",
  "Modern Loft Interior",
  "Forest Path",
  "Anime Cherry Blossoms",
  "Misty Mountain Landscape (Anime)",
  "Enchanted Forest Clearing (Anime)",
  "Floating Sky Islands (Anime)",
  "Cyberpunk Cityscape (Anime)",
  "Cozy Cat Cafe (Anime)",
];

export const ASPECT_RATIO_OPTIONS = [
  "3:4 (Portrait)",
  "1:1 (Square)",
  "4:3 (Landscape)",
  "16:9 (Widescreen)",
  "9:16 (Portrait)",
];

export const FACE_FILTER_OPTIONS = [
  "Photorealistic",
  "Cartoon",
  "Sketch",
  "Oil Painting",
  "Anime",
  "Pop Art",
];

export const FACIAL_EXPRESSION_OPTIONS = [
  "Neutral",
  "Happy Smile",
  "Joyful Laugh",
  "Surprised",
  "Thoughtful",
  "Determined",
  "Winking",
];

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};

const App: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [sceneImages, setSceneImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [sceneUpdateMessage, setSceneUpdateMessage] = useState<string | null>(null);

  // View state
  const [view, setView] = useState<'editor' | 'export'>('editor');

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Project Management State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [actionConfirmation, setActionConfirmation] = useState<string | null>(null);

  // Current (applied) state
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [currentCameraAngleIndex, setCurrentCameraAngleIndex] = useState(0);
  const [currentLightingIndex, setCurrentLightingIndex] = useState(0);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [currentFaceFilterIndex, setCurrentFaceFilterIndex] = useState(0);
  const [currentFacialExpressionIndex, setCurrentFacialExpressionIndex] = useState(0);
  const [currentAspectRatioIndex, setCurrentAspectRatioIndex] = useState(0);

  // Pending (selected but not applied) state
  const [pendingPoseIndex, setPendingPoseIndex] = useState(currentPoseIndex);
  const [pendingCameraAngleIndex, setPendingCameraAngleIndex] = useState(currentCameraAngleIndex);
  const [pendingLightingIndex, setPendingLightingIndex] = useState(currentLightingIndex);
  const [pendingBackgroundIndex, setPendingBackgroundIndex] = useState(currentBackgroundIndex);
  const [pendingFaceFilterIndex, setPendingFaceFilterIndex] = useState(currentFaceFilterIndex);
  const [pendingFacialExpressionIndex, setPendingFacialExpressionIndex] = useState(currentFacialExpressionIndex);
  const [pendingAspectRatioIndex, setPendingAspectRatioIndex] = useState(currentAspectRatioIndex);

  // Sync pending state when current state changes from a non-user action
  useEffect(() => { setPendingPoseIndex(currentPoseIndex); }, [currentPoseIndex]);
  useEffect(() => { setPendingCameraAngleIndex(currentCameraAngleIndex); }, [currentCameraAngleIndex]);
  useEffect(() => { setPendingLightingIndex(currentLightingIndex); }, [currentLightingIndex]);
  useEffect(() => { setPendingBackgroundIndex(currentBackgroundIndex); }, [currentBackgroundIndex]);
  useEffect(() => { setPendingFaceFilterIndex(currentFaceFilterIndex); }, [currentFaceFilterIndex]);
  useEffect(() => { setPendingFacialExpressionIndex(currentFacialExpressionIndex); }, [currentFacialExpressionIndex]);
  useEffect(() => { setPendingAspectRatioIndex(currentAspectRatioIndex); }, [currentAspectRatioIndex]);

  useEffect(() => {
    if (sceneUpdateMessage) {
        const timer = setTimeout(() => setSceneUpdateMessage(null), 2500);
        return () => clearTimeout(timer);
    }
  }, [sceneUpdateMessage]);
  
  useEffect(() => {
    if (actionConfirmation) {
        const timer = setTimeout(() => setActionConfirmation(null), 2500);
        return () => clearTimeout(timer);
    }
  }, [actionConfirmation]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const getCompositeKey = useCallback((poseIndex: number, angleIndex: number, lightingIndex: number, backgroundIndex: number, filterIndex: number, expressionIndex: number, aspectRatioIndex: number) => {
    if (!POSE_INSTRUCTIONS[poseIndex] || !CAMERA_ANGLES[angleIndex] || !LIGHTING_OPTIONS[lightingIndex] || !BACKGROUND_OPTIONS[backgroundIndex] || !FACE_FILTER_OPTIONS[filterIndex] || !FACIAL_EXPRESSION_OPTIONS[expressionIndex] || !ASPECT_RATIO_OPTIONS[aspectRatioIndex]) return null;
    return `${POSE_INSTRUCTIONS[poseIndex].label}|${CAMERA_ANGLES[angleIndex]}|${LIGHTING_OPTIONS[lightingIndex]}|${BACKGROUND_OPTIONS[backgroundIndex]}|${FACE_FILTER_OPTIONS[filterIndex]}|${FACIAL_EXPRESSION_OPTIONS[expressionIndex]}|${ASPECT_RATIO_OPTIONS[aspectRatioIndex]}`;
  }, []);

  const hasPendingChanges = useMemo(() => 
    pendingPoseIndex !== currentPoseIndex ||
    pendingCameraAngleIndex !== currentCameraAngleIndex ||
    pendingLightingIndex !== currentLightingIndex ||
    pendingBackgroundIndex !== currentBackgroundIndex ||
    pendingFaceFilterIndex !== currentFaceFilterIndex ||
    pendingFacialExpressionIndex !== currentFacialExpressionIndex ||
    pendingAspectRatioIndex !== currentAspectRatioIndex,
    [pendingPoseIndex, currentPoseIndex, pendingCameraAngleIndex, currentCameraAngleIndex, pendingLightingIndex, currentLightingIndex, pendingBackgroundIndex, currentBackgroundIndex, pendingFaceFilterIndex, currentFaceFilterIndex, pendingFacialExpressionIndex, currentFacialExpressionIndex, pendingAspectRatioIndex, currentAspectRatioIndex]
  );
  
  const displayImageUrl = useMemo(() => {
    if (Object.keys(sceneImages).length === 0) return modelImageUrl;
    const compositeKey = getCompositeKey(currentPoseIndex, currentCameraAngleIndex, currentLightingIndex, currentBackgroundIndex, currentFaceFilterIndex, currentFacialExpressionIndex, currentAspectRatioIndex);
    return compositeKey ? (sceneImages[compositeKey] ?? modelImageUrl) : modelImageUrl;
  }, [sceneImages, currentPoseIndex, currentCameraAngleIndex, currentLightingIndex, currentBackgroundIndex, currentFaceFilterIndex, currentFacialExpressionIndex, currentAspectRatioIndex, modelImageUrl, getCompositeKey]);

  useEffect(() => {
    try {
      const hasCompleted = window.localStorage.getItem('fitCheckOnboardingCompleted');
      if (!hasCompleted) {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.error("Could not access localStorage:", e);
    }
  }, []);

  const handleCompleteOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try {
      window.localStorage.setItem('fitCheckOnboardingCompleted', 'true');
    } catch (e) {
       console.error("Could not write to localStorage:", e);
    }
  }, []);
  
  useEffect(() => {
    if (!showOnboarding || !modelImageUrl) return;
    if (onboardingStep === 0 && hasPendingChanges) {
      setTimeout(() => setOnboardingStep(1), 500);
    }
  }, [hasPendingChanges, onboardingStep, showOnboarding, modelImageUrl]);

  const onboardingSteps: OnboardingStep[] = [
    { selector: isMobile ? '#onboarding-edit-scene-button' : '#onboarding-edit-scene-controls-desktop', title: 'Welcome to the Editor!', description: 'Your scene is ready. Use these controls to change the pose, camera angle, background, and more.', position: 'top' },
    { selector: isMobile ? '#onboarding-apply-button-mobile' : '#onboarding-apply-button-desktop', title: 'Apply Your Changes', description: "When you make a change you like, click here to apply it to your model and see the magic happen.", position: 'top' },
    { selector: '#onboarding-export-button', title: 'Export Your Creation', description: "When you're happy with the result, click here to go to the export page.", position: 'bottom' },
    { selector: '#onboarding-save-button', title: 'Save Your Project', description: 'You can save your current scene as a project to come back to it later.', position: 'bottom' },
    { selector: '#onboarding-dashboard-button', title: 'Back to Dashboard', description: 'Access all your saved projects from the Dashboard.', position: 'bottom' },
    { isFinal: true, title: "You're All Set!", description: "You've learned the basics. Feel free to experiment and create amazing virtual photoshoots. Enjoy!" }
  ];

  const handleModelFinalized = (url: string) => {
    setModelImageUrl(url);
    const initialKey = getCompositeKey(0, 0, 0, 0, 0, 0, 0);
    if (!initialKey) return;
    
    // Reset state for new project
    setSceneImages({ [initialKey]: url });
    setCurrentPoseIndex(0);
    setCurrentCameraAngleIndex(0);
    setCurrentLightingIndex(0);
    setCurrentBackgroundIndex(0);
    setCurrentFaceFilterIndex(0);
    setCurrentFacialExpressionIndex(0);
    setCurrentAspectRatioIndex(0);
    setView('editor');
  };

  const handleReturnToDashboard = () => {
    setModelImageUrl(null);
    setSceneImages({});
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setView('editor');
  };
  
  const handleApplyChanges = useCallback(async () => {
    if (isLoading || !modelImageUrl || !hasPendingChanges) return;

    const sceneChanged = pendingPoseIndex !== currentPoseIndex ||
                         pendingCameraAngleIndex !== currentCameraAngleIndex ||
                         pendingLightingIndex !== currentLightingIndex ||
                         pendingBackgroundIndex !== currentBackgroundIndex ||
                         pendingFacialExpressionIndex !== currentFacialExpressionIndex ||
                         pendingAspectRatioIndex !== currentAspectRatioIndex;

    const filterChanged = pendingFaceFilterIndex !== currentFaceFilterIndex;

    const finalCompositeKey = getCompositeKey(pendingPoseIndex, pendingCameraAngleIndex, pendingLightingIndex, pendingBackgroundIndex, pendingFaceFilterIndex, pendingFacialExpressionIndex, pendingAspectRatioIndex);
    if (!finalCompositeKey) return;

    if (sceneImages[finalCompositeKey]) {
        setCurrentPoseIndex(pendingPoseIndex);
        setCurrentCameraAngleIndex(pendingCameraAngleIndex);
        setCurrentLightingIndex(pendingLightingIndex);
        setCurrentBackgroundIndex(pendingBackgroundIndex);
        setCurrentFaceFilterIndex(pendingFaceFilterIndex);
        setCurrentFacialExpressionIndex(pendingFacialExpressionIndex);
        setCurrentAspectRatioIndex(pendingAspectRatioIndex);
        setSceneUpdateMessage('Scene updated from cache');
        if (showOnboarding) setOnboardingStep(2);
        return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setError(null);

    try {
        let newImageUrl: string;
        const currentKey = getCompositeKey(currentPoseIndex, currentCameraAngleIndex, currentLightingIndex, currentBackgroundIndex, currentFaceFilterIndex, currentFacialExpressionIndex, currentAspectRatioIndex);
        const sourceImageUrl = currentKey ? sceneImages[currentKey] : modelImageUrl;
        if (!sourceImageUrl) throw new Error("Could not find a source image to modify.");

        if (sceneChanged) {
            setLoadingMessage('Generating new scene...');
            newImageUrl = await generatePoseVariation(
                sourceImageUrl,
                POSE_INSTRUCTIONS[pendingPoseIndex].label,
                CAMERA_ANGLES[pendingCameraAngleIndex],
                LIGHTING_OPTIONS[pendingLightingIndex],
                BACKGROUND_OPTIONS[pendingBackgroundIndex],
                FACIAL_EXPRESSION_OPTIONS[pendingFacialExpressionIndex],
                ASPECT_RATIO_OPTIONS[pendingAspectRatioIndex]
            );
            if (filterChanged && FACE_FILTER_OPTIONS[pendingFaceFilterIndex] !== 'Photorealistic') {
                 setLoadingMessage('Applying face filter...');
                 setLoadingProgress(50);
                 newImageUrl = await applyFaceFilter(newImageUrl, FACE_FILTER_OPTIONS[pendingFaceFilterIndex]);
            }
        } else if (filterChanged) {
            setLoadingMessage('Applying face filter...');
            newImageUrl = await applyFaceFilter(sourceImageUrl, FACE_FILTER_OPTIONS[pendingFaceFilterIndex]);
        } else {
            setIsLoading(false);
            return;
        }

        setLoadingProgress(100);
        setSceneImages(prev => ({ ...prev, [finalCompositeKey]: newImageUrl }));

        setCurrentPoseIndex(pendingPoseIndex);
        setCurrentCameraAngleIndex(pendingCameraAngleIndex);
        setCurrentLightingIndex(pendingLightingIndex);
        setCurrentBackgroundIndex(pendingBackgroundIndex);
        setCurrentFaceFilterIndex(pendingFaceFilterIndex);
        setCurrentFacialExpressionIndex(pendingFacialExpressionIndex);
        setCurrentAspectRatioIndex(pendingAspectRatioIndex);
        setSceneUpdateMessage('Scene generated successfully!');
        if (showOnboarding) setOnboardingStep(2);

    } catch (e) {
        setError(getFriendlyErrorMessage(e, 'Failed to apply changes'));
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
        setLoadingProgress(0);
    }
  }, [isLoading, hasPendingChanges, modelImageUrl, sceneImages, getCompositeKey, currentPoseIndex, currentCameraAngleIndex, currentLightingIndex, currentBackgroundIndex, currentFaceFilterIndex, currentFacialExpressionIndex, currentAspectRatioIndex, pendingPoseIndex, pendingCameraAngleIndex, pendingLightingIndex, pendingBackgroundIndex, pendingFaceFilterIndex, pendingFacialExpressionIndex, pendingAspectRatioIndex, showOnboarding]);

  // --- Project Management Handlers ---

  const handleSaveProject = async (projectName: string) => {
    if (!displayImageUrl) {
        setError("Cannot save an empty scene.");
        return;
    }
    setIsSaving(true);
    try {
        const projectState: ProjectState = {
            sceneImages,
            currentPoseIndex,
            currentCameraAngleIndex,
            currentLightingIndex,
            currentBackgroundIndex,
            currentFaceFilterIndex,
            currentFacialExpressionIndex,
            currentAspectRatioIndex,
            modelImageUrl,
        };
        const newProject: Project = {
            id: `proj_${Date.now()}`,
            name: projectName,
            createdAt: new Date().toISOString(),
            thumbnailUrl: displayImageUrl,
            state: projectState,
        };
        const updatedProjects = [newProject, ...projects];
        setProjects(updatedProjects);
        saveProjects(updatedProjects);
        setActionConfirmation(`Project "${projectName}" saved`);
        if (showOnboarding) setOnboardingStep(4);
    } catch(e) {
        setError(getFriendlyErrorMessage(e, 'Failed to save project'));
    } finally {
        setIsSaving(false);
        setIsSaveModalOpen(false);
    }
  };

  const handleLoadProject = (project: Project) => {
      const { state } = project;
      setSceneImages(state.sceneImages);
      setCurrentPoseIndex(state.currentPoseIndex);
      setCurrentCameraAngleIndex(state.currentCameraAngleIndex);
      setCurrentLightingIndex(state.currentLightingIndex);
      setCurrentBackgroundIndex(state.currentBackgroundIndex);
      setCurrentFaceFilterIndex(state.currentFaceFilterIndex);
      setCurrentFacialExpressionIndex(state.currentFacialExpressionIndex);
      setCurrentAspectRatioIndex(state.currentAspectRatioIndex);
      setModelImageUrl(state.modelImageUrl);
      setActionConfirmation(`Loaded project "${project.name}"`);
      setView('editor');
  };

  const handleDeleteProject = (projectId: string) => {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
      setActionConfirmation('Project deleted');
  };

  return (
    <div className="bg-background w-screen h-screen flex flex-col items-center justify-center font-sans antialiased overflow-hidden">
      <AnimatePresence>
        {error && <ErrorToast message={error} onClose={() => setError(null)} />}
        {actionConfirmation && <ConfirmationToast message={actionConfirmation} />}
      </AnimatePresence>

      {modelImageUrl && view === 'editor' && (
          <EditorHeader 
              onSave={() => setIsSaveModalOpen(true)}
              onDashboard={handleReturnToDashboard}
              onExport={() => setView('export')}
          />
      )}

      <main className="w-full h-full flex-grow flex items-center justify-center lg:pb-16">
        <AnimatePresence mode="wait">
          {modelImageUrl ? (
            view === 'editor' ? (
              <motion.div 
                key="editor"
                className="w-full h-full flex flex-col items-start justify-center p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Canvas
                  displayImageUrl={displayImageUrl}
                  onStartOver={handleReturnToDashboard}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  loadingProgress={loadingProgress}
                  poseInstructions={POSE_INSTRUCTIONS}
                  cameraAngles={CAMERA_ANGLES}
                  lightingOptions={LIGHTING_OPTIONS}
                  backgroundOptions={BACKGROUND_OPTIONS}
                  aspectRatioOptions={ASPECT_RATIO_OPTIONS}
                  faceFilterOptions={FACE_FILTER_OPTIONS}
                  facialExpressionOptions={FACIAL_EXPRESSION_OPTIONS}
                  pendingPoseIndex={pendingPoseIndex}
                  onSelectPose={setPendingPoseIndex}
                  pendingCameraAngleIndex={pendingCameraAngleIndex}
                  onSelectCameraAngle={setPendingCameraAngleIndex}
                  pendingLightingIndex={pendingLightingIndex}
                  onSelectLighting={setPendingLightingIndex}
                  pendingBackgroundIndex={pendingBackgroundIndex}
                  onSelectBackground={setPendingBackgroundIndex}
                  pendingAspectRatioIndex={pendingAspectRatioIndex}
                  onSelectAspectRatio={setPendingAspectRatioIndex}
                  pendingFaceFilterIndex={pendingFaceFilterIndex}
                  onSelectFaceFilter={setPendingFaceFilterIndex}
                  pendingFacialExpressionIndex={pendingFacialExpressionIndex}
                  onSelectFacialExpression={setPendingFacialExpressionIndex}
                  onApplyChanges={handleApplyChanges}
                  hasPendingChanges={hasPendingChanges}
                  sceneUpdateMessage={sceneUpdateMessage}
                />
              </motion.div>
            ) : (
              <ExportPage
                key="export"
                displayImageUrl={displayImageUrl}
                onBack={() => setView('editor')}
              />
            )
          ) : (
            <motion.div 
              key="dashboard"
              className="w-full h-full flex items-center justify-center"
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <Dashboard
                projects={projects}
                onLoadProject={handleLoadProject}
                onDeleteProject={handleDeleteProject}
                onModelFinalized={handleModelFinalized}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      
      {showOnboarding && modelImageUrl && view === 'editor' && (
        <Onboarding
          step={onboardingStep}
          steps={onboardingSteps}
          onNext={() => setOnboardingStep(s => Math.min(s + 1, onboardingSteps.length - 1))}
          onPrev={() => setOnboardingStep(s => Math.max(s - 1, 0))}
          onSkip={handleCompleteOnboarding}
        />
      )}
      
      <SaveProjectModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveProject}
        isSaving={isSaving}
      />
    </div>
  );
};

export default App;
