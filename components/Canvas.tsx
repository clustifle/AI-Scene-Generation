/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon, SunIcon, ImageIcon, CameraIcon, PaintBrushIcon, EmotionHappyIcon, PencilRulerIcon, CheckIcon, PersonStandingIcon, AspectRatioIcon } from './icons';
import Spinner from './Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import { Pose } from '../App';
import PoseSelectionModal from './PoseSelectionModal';
import ConfirmationToast from './ConfirmationToast';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  poseInstructions: Pose[];
  cameraAngles: string[];
  lightingOptions: string[];
  backgroundOptions: string[];
  aspectRatioOptions: string[];
  faceFilterOptions: string[];
  facialExpressionOptions: string[];
  
  pendingPoseIndex: number;
  onSelectPose: (index: number) => void;
  pendingCameraAngleIndex: number;
  onSelectCameraAngle: (index: number) => void;
  pendingLightingIndex: number;
  onSelectLighting: (index: number) => void;
  pendingBackgroundIndex: number;
  onSelectBackground: (index: number) => void;
  pendingAspectRatioIndex: number;
  onSelectAspectRatio: (index: number) => void;
  pendingFaceFilterIndex: number;
  onSelectFaceFilter: (index: number) => void;
  pendingFacialExpressionIndex: number;
  onSelectFacialExpression: (index: number) => void;
  
  onApplyChanges: () => void;
  hasPendingChanges: boolean;

  sceneUpdateMessage: string | null;
}

type EditorCategory = 'pose' | 'camera' | 'background' | 'lighting' | 'aspect' | 'filter' | 'expression';

const Canvas: React.FC<CanvasProps> = ({ 
  displayImageUrl, 
  onStartOver, 
  isLoading, 
  loadingMessage, 
  loadingProgress,
  poseInstructions, 
  cameraAngles,
  lightingOptions,
  backgroundOptions,
  aspectRatioOptions,
  faceFilterOptions,
  facialExpressionOptions,
  pendingPoseIndex,
  onSelectPose,
  pendingCameraAngleIndex,
  onSelectCameraAngle,
  pendingLightingIndex,
  onSelectLighting,
  pendingBackgroundIndex,
  onSelectBackground,
  pendingAspectRatioIndex,
  onSelectAspectRatio,
  pendingFaceFilterIndex,
  onSelectFaceFilter,
  pendingFacialExpressionIndex,
  onSelectFacialExpression,
  onApplyChanges,
  hasPendingChanges,
  sceneUpdateMessage,
}) => {
  const [isPoseModalOpen, setIsPoseModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EditorCategory>('pose');
  
  const categories: { id: EditorCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'pose', label: 'Pose', icon: <PersonStandingIcon className="w-5 h-5" /> },
    { id: 'camera', label: 'Camera', icon: <CameraIcon className="w-5 h-5" /> },
    { id: 'background', label: 'Background', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'lighting', label: 'Lighting', icon: <SunIcon className="w-5 h-5" /> },
    { id: 'aspect', label: 'Aspect', icon: <AspectRatioIcon className="w-5 h-5" /> },
    { id: 'filter', label: 'Filter', icon: <PaintBrushIcon className="w-5 h-5" /> },
    { id: 'expression', label: 'Expression', icon: <EmotionHappyIcon className="w-5 h-5" /> },
  ];

  const renderCategoryOptions = () => {
    switch (activeCategory) {
      case 'pose':
        return (
            <div className="w-full">
                <button
                    onClick={() => setIsPoseModalOpen(true)}
                    className="text-sm font-semibold text-onSurface w-full text-center truncate hover:bg-surfaceVariant rounded-xl py-2.5 px-4 border border-outline active:bg-secondaryContainer transition-colors"
                    title={poseInstructions[pendingPoseIndex]?.label}
                >
                    {poseInstructions[pendingPoseIndex]?.label || 'Select Pose'}
                </button>
            </div>
        );
      case 'camera':
        return cameraAngles.map((angle, index) => (
            <button key={angle} onClick={() => onSelectCameraAngle(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingCameraAngleIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                {angle}
            </button>
        ));
      case 'background':
        return backgroundOptions.map((background, index) => (
            <button key={background} onClick={() => onSelectBackground(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingBackgroundIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                {background}
            </button>
        ));
      case 'lighting':
        return lightingOptions.map((lighting, index) => (
            <button key={lighting} onClick={() => onSelectLighting(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingLightingIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                {lighting}
            </button>
        ));
      case 'aspect':
        return aspectRatioOptions.map((ratio, index) => (
            <button key={ratio} onClick={() => onSelectAspectRatio(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingAspectRatioIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                {ratio}
            </button>
        ));
      case 'filter':
        return faceFilterOptions.map((filter, index) => (
            <button key={filter} onClick={() => onSelectFaceFilter(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingFaceFilterIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                {filter}
            </button>
        ));
      case 'expression':
        return facialExpressionOptions.map((expression, index) => (
            <button key={expression} onClick={() => onSelectFacialExpression(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingFacialExpressionIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                {expression}
            </button>
        ));
      default:
        return null;
    }
  };


  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 relative animate-zoom-in">
      {/* Header Buttons */}
      <div className="absolute top-4 left-4 z-30 flex items-center justify-between pointer-events-none">
          <button 
              onClick={onStartOver}
              className="flex items-center justify-center text-center bg-surface/60 border border-outline/80 text-onSurface font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-surface hover:border-onSurfaceVariant active:scale-95 text-sm backdrop-blur-sm pointer-events-auto"
          >
              <RotateCcwIcon className="w-4 h-4 mr-2" />
              Start Over
          </button>
      </div>

      {/* Image Display */}
      <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden">
        {displayImageUrl ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={displayImageUrl}
              src={displayImageUrl}
              alt="Virtual try-on model"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="absolute max-w-full max-h-full object-contain rounded-2xl"
            />
          </AnimatePresence>
        ) : (
            <div className="w-full h-full bg-secondaryContainer/50 border border-outline rounded-2xl flex flex-col items-center justify-center">
              <Spinner />
              <p className="text-md font-serif text-onSurfaceVariant mt-4">Loading Model...</p>
            </div>
        )}
        
        <AnimatePresence>
          {isLoading && (
              <motion.div
                  className="absolute inset-0 bg-surface/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Spinner />
                  {loadingMessage && (
                      <p className="text-lg font-serif text-onSurface mt-4 text-center px-4">{loadingMessage}</p>
                  )}
                  <div className="w-48 h-2 bg-surfaceVariant rounded-full mt-4 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                      />
                  </div>
              </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 w-full flex justify-center pointer-events-none">
            <AnimatePresence>
                {sceneUpdateMessage && <ConfirmationToast message={sceneUpdateMessage} />}
            </AnimatePresence>
        </div>
      </div>

      {/* Controls Panel */}
      {displayImageUrl && (
        <motion.div 
          className="w-full max-w-6xl mt-2 flex-shrink-0 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Main Controls */}
          <div className="flex items-center justify-center gap-2 flex-wrap h-12">
              {/* Mobile Edit Scene Button */}
              <button
                id="onboarding-edit-scene-button"
                onClick={() => setIsEditorOpen(true)}
                disabled={isLoading}
                className="lg:hidden flex items-center gap-2 bg-primaryContainer text-onPrimaryContainer rounded-2xl py-2.5 px-5 shadow-sm text-sm font-semibold hover:bg-indigo-200 active:scale-95 transition-all disabled:opacity-50"
              >
                <PencilRulerIcon className="w-5 h-5" /> Edit Scene
              </button>
              {/* Desktop Apply Button */}
              <div className="hidden lg:block">
                  <AnimatePresence>
                      {hasPendingChanges && (
                          <motion.button
                              id="onboarding-apply-button-desktop"
                              onClick={onApplyChanges}
                              disabled={isLoading}
                              className="flex items-center justify-center gap-2 bg-primary text-onPrimary rounded-full py-2.5 px-6 shadow-lg text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                          >
                              <CheckIcon className="w-5 h-5" /> Apply Changes
                          </motion.button>
                      )}
                  </AnimatePresence>
              </div>
          </div>
          
          {/* Desktop Scene Options */}
          <div id="onboarding-edit-scene-controls-desktop" className="hidden lg:grid grid-cols-7 gap-y-6 lg:gap-4 mt-4">
               {/* Pose Controls */}
               <div>
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-onSurfaceVariant mb-2 flex items-center justify-center gap-2">
                    <PersonStandingIcon className="w-4 h-4" /> Pose
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2 px-2">
                    <button
                        onClick={() => setIsPoseModalOpen(true)}
                        className="text-sm font-semibold text-onSurface w-full text-center truncate hover:bg-surfaceVariant rounded-xl py-2.5 px-4 border border-outline active:bg-secondaryContainer transition-colors"
                        title={poseInstructions[pendingPoseIndex]?.label}
                    >
                        {poseInstructions[pendingPoseIndex]?.label || 'Select Pose'}
                    </button>
                  </div>
              </div>
              {/* Camera Angle Controls */}
              <div>
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-onSurfaceVariant mb-2 flex items-center justify-center gap-2">
                    <CameraIcon className="w-4 h-4" /> Camera
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                      {cameraAngles.map((angle, index) => (
                          <button key={angle} onClick={() => onSelectCameraAngle(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingCameraAngleIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                              {angle}
                          </button>
                      ))}
                  </div>
              </div>
              {/* Background Controls */}
              <div>
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-onSurfaceVariant mb-2 flex items-center justify-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Background
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                      {backgroundOptions.map((background, index) => (
                          <button key={background} onClick={() => onSelectBackground(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingBackgroundIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                              {background}
                          </button>
                      ))}
                  </div>
              </div>
              {/* Lighting Controls */}
              <div>
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-onSurfaceVariant mb-2 flex items-center justify-center gap-2">
                      <SunIcon className="w-4 h-4" /> Lighting
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                      {lightingOptions.map((lighting, index) => (
                          <button key={lighting} onClick={() => onSelectLighting(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingLightingIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                              {lighting}
                          </button>
                      ))}
                  </div>
              </div>
              {/* Aspect Ratio Controls */}
              <div>
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-onSurfaceVariant mb-2 flex items-center justify-center gap-2">
                      <AspectRatioIcon className="w-4 h-4" /> Aspect Ratio
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                      {aspectRatioOptions.map((ratio, index) => (
                          <button key={ratio} onClick={() => onSelectAspectRatio(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingAspectRatioIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                              {ratio}
                          </button>
                      ))}
                  </div>
              </div>
               {/* Face Filter Controls */}
               <div>
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-onSurfaceVariant mb-2 flex items-center justify-center gap-2">
                      <PaintBrushIcon className="w-4 h-4" /> Face Filter
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                      {faceFilterOptions.map((filter, index) => (
                          <button key={filter} onClick={() => onSelectFaceFilter(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingFaceFilterIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                              {filter}
                          </button>
                      ))}
                  </div>
              </div>
               {/* Facial Expression Controls */}
               <div>
                  <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-onSurfaceVariant mb-2 flex items-center justify-center gap-2">
                      <EmotionHappyIcon className="w-4 h-4" /> Expression
                  </h3>
                  <div className="flex flex-wrap justify-center gap-2">
                      {facialExpressionOptions.map((expression, index) => (
                          <button key={expression} onClick={() => onSelectFacialExpression(index)} disabled={isLoading} className={`flex-shrink-0 px-3 py-2 text-sm font-medium rounded-full transition-colors duration-200 border ${pendingFacialExpressionIndex === index ? 'bg-secondaryContainer text-onSecondaryContainer border-secondaryContainer' : 'bg-surface text-onSurfaceVariant border-outline hover:bg-surfaceVariant'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                              {expression}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Scene Editor Drawer */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsEditorOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl shadow-2xl flex flex-col max-h-[70vh]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="editor-title"
            >
              <div className="flex-shrink-0 pt-3 pb-2 flex items-center justify-center">
                <div className="w-8 h-1 bg-outline rounded-full" />
              </div>

              <div className="flex-shrink-0 px-4 pb-2 pt-1 border-b border-outline flex items-center justify-between">
                <h2 id="editor-title" className="text-xl font-title font-bold text-onSurface">Edit Scene</h2>
                <button 
                  id={hasPendingChanges ? 'onboarding-apply-button-mobile' : undefined}
                  onClick={() => {
                      if (hasPendingChanges) {
                          onApplyChanges();
                      } else {
                        setIsEditorOpen(false);
                      }
                  }}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                      hasPendingChanges
                          ? 'bg-primary text-onPrimary hover:bg-indigo-700'
                          : 'bg-secondaryContainer text-onSecondaryContainer hover:bg-surfaceVariant'
                  }`}
                >
                  {hasPendingChanges ? 'Apply' : 'Done'}
                </button>
              </div>
              
              <div className="flex-shrink-0 p-2 border-b border-outline overflow-x-auto scrollbar-hide">
                  <div className="flex items-center justify-start sm:justify-center gap-2 px-2">
                    {categories.map(({ id, label, icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveCategory(id)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2 w-20 rounded-xl transition-colors duration-200 ${activeCategory === id ? 'bg-primaryContainer text-onPrimaryContainer' : 'text-onSurfaceVariant hover:bg-surfaceVariant'}`}
                        aria-pressed={activeCategory === id}
                      >
                        {icon}
                        <span className="text-xs font-semibold">{label}</span>
                      </button>
                    ))}
                  </div>
              </div>

              <div className="p-4 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="flex flex-wrap justify-center gap-2"
                    >
                      {renderCategoryOptions()}
                    </motion.div>
                  </AnimatePresence>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <PoseSelectionModal
        isOpen={isPoseModalOpen}
        onClose={() => setIsPoseModalOpen(false)}
        onSelectPose={onSelectPose}
        poses={poseInstructions}
        currentPoseIndex={pendingPoseIndex}
      />
    </div>
  );
};

export default Canvas;