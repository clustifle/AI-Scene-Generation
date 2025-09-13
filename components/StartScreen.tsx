/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, XIcon, PlusIcon } from './icons';
import { generateModelImage, generateCollageImage } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '../lib/utils';
import { ErrorToast } from './ConfirmationToast';

interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}

interface ImageState {
  url: string;
  name: string;
}

const ImageUploaderSlot: React.FC<{
  image: ImageState | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  label: string;
  isGenerating: boolean;
}> = ({ image, onFileSelect, onClear, label, isGenerating }) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
    // Reset the input value to allow re-uploading the same file
    e.target.value = '';
  };

  return (
    <div className="w-full sm:w-1/2 md:w-[280px] flex flex-col items-center gap-2">
      {image ? (
        <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-outline shadow-sm">
          <img src={image.url} alt={`Preview for ${label}`} className="w-full h-full object-cover" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 z-10 p-1.5 bg-surface/70 rounded-full text-onSurface hover:bg-surface hover:scale-110 transition-all backdrop-blur-sm"
            aria-label={`Clear ${label}`}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label htmlFor={`upload-${label}`} className={`relative w-full aspect-[2/3] rounded-2xl border-2 border-outline flex flex-col items-center justify-center text-onSurfaceVariant transition-colors ${isGenerating ? 'cursor-not-allowed bg-surfaceVariant/50' : 'hover:border-primary/50 hover:text-primary cursor-pointer bg-surface'}`}>
          <UploadCloudIcon className="w-8 h-8 mb-2" />
          <span className="text-sm font-semibold text-center">{label}</span>
          <input id={`upload-${label}`} type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={isGenerating} />
        </label>
      )}
    </div>
  );
};

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized }) => {
  const [userImage1, setUserImage1] = useState<ImageState | null>(null);
  const [userImage2, setUserImage2] = useState<ImageState | null>(null);
  const [userImage3, setUserImage3] = useState<ImageState | null>(null);
  const [userImage4, setUserImage4] = useState<ImageState | null>(null);
  const [numPeople, setNumPeople] = useState(2);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File, slot: 1 | 2 | 3 | 4) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const setter = {
        1: setUserImage1,
        2: setUserImage2,
        3: setUserImage3,
        4: setUserImage4,
      }[slot];
      setter({ url, name: file.name });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedModelUrl(null);
    setError(null);

    const images = [userImage1, userImage2, userImage3, userImage4]
      .filter((imgState): imgState is ImageState => !!imgState);

    if (images.length === 0) {
      setError("Please upload at least one photo.");
      setIsGenerating(false);
      return;
    }

    try {
      let result: string;
      if (images.length > 1) {
        result = await generateCollageImage(images);
      } else {
        result = await generateModelImage(images[0]);
      }
      setGeneratedModelUrl(result);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to generate scene'));
    } finally {
      setIsGenerating(false);
    }
  };


  const reset = () => {
    setUserImage1(null);
    setUserImage2(null);
    setUserImage3(null);
    setUserImage4(null);
    setNumPeople(2);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
  };

  const hasStarted = isGenerating || generatedModelUrl || error;
  const uploadedImagesCount = [userImage1, userImage2, userImage3, userImage4].filter(Boolean).length;
  const canGenerate = uploadedImagesCount > 0 && !isGenerating;

  const screenVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="uploader"
            className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-8 p-4"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="text-center max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-onBackground leading-tight">
                Create Your Scene.
              </h1>
              <p className="mt-4 text-lg text-onSurfaceVariant">
                Upload one to four photos. Our AI will place them in a professional scene, ready for a virtual try-on.
              </p>
            </div>
            <div id="onboarding-uploader-area" className="w-full grid grid-cols-2 lg:grid-cols-4 items-start justify-center gap-4 sm:gap-6">
              <ImageUploaderSlot
                image={userImage1}
                onFileSelect={(file) => handleFileSelect(file, 1)}
                onClear={() => setUserImage1(null)}
                label="Upload Person 1"
                isGenerating={isGenerating}
              />
              <ImageUploaderSlot
                image={userImage2}
                onFileSelect={(file) => handleFileSelect(file, 2)}
                onClear={() => setUserImage2(null)}
                label="Upload Person 2"
                isGenerating={isGenerating}
              />
              <AnimatePresence>
                {numPeople >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <ImageUploaderSlot
                      image={userImage3}
                      onFileSelect={(file) => handleFileSelect(file, 3)}
                      onClear={() => setUserImage3(null)}
                      label="Upload Person 3"
                      isGenerating={isGenerating}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {numPeople >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <ImageUploaderSlot
                      image={userImage4}
                      onFileSelect={(file) => handleFileSelect(file, 4)}
                      onClear={() => setUserImage4(null)}
                      label="Upload Person 4"
                      isGenerating={isGenerating}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center mt-4 w-full max-w-sm space-y-4">
              {numPeople < 4 && !isGenerating && (
                  <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                  >
                  <button
                      onClick={() => setNumPeople(prev => prev + 1)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-primary bg-surface border border-primary/50 rounded-full cursor-pointer hover:bg-primaryContainer transition-colors"
                  >
                      <PlusIcon className="w-5 h-5" />
                      Add {numPeople === 2 ? 'a Third' : 'a Fourth'} Person
                  </button>
                  </motion.div>
              )}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full relative flex items-center justify-center px-8 py-4 text-lg font-semibold text-onPrimary bg-primary rounded-full cursor-pointer group hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Spinner /> : 'Generate Scene'}
              </button>
              <p className="text-onSurfaceVariant/80 text-xs text-center !mt-2">By uploading, you agree not to create harmful content. This service is for creative and responsible use only.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 p-4"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="md:w-1/2 flex-shrink-0 flex flex-col items-center md:items-start">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-onBackground leading-tight">
                  Your Scene is Ready
                </h1>
                <p className="mt-2 text-md text-onSurfaceVariant">
                  The AI has generated your model. You can now proceed to styling.
                </p>
              </div>
              
              <AnimatePresence>
                {!isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mt-8"
                  >
                    <button
                      onClick={reset}
                      className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-onSecondaryContainer bg-secondaryContainer rounded-full cursor-pointer hover:bg-surfaceVariant transition-colors"
                    >
                      Start Over
                    </button>
                    {generatedModelUrl && !error && (
                      <button
                        onClick={() => onModelFinalized(generatedModelUrl)}
                        className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-onPrimary bg-primary rounded-full cursor-pointer group hover:bg-indigo-700 transition-colors"
                      >
                        Proceed to Styling &rarr;
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="md:w-1/2 w-full flex items-center justify-center">
              <div className="relative w-[280px] h-[420px] sm:w-[320px] sm:h-[480px] lg:w-[400px] lg:h-[600px] rounded-3xl bg-surface flex items-center justify-center border border-outline shadow-xl">
                {isGenerating && (
                  <div className="flex flex-col items-center gap-3 text-lg text-onSurface font-serif">
                    <Spinner />
                    <span>Generating...</span>
                  </div>
                )}
                {generatedModelUrl && (
                  <img
                    src={generatedModelUrl}
                    alt="Generated model scene"
                    className="w-full h-full object-contain rounded-3xl animate-fade-in"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      </AnimatePresence>
    </>
  );
};

export default StartScreen;