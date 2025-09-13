/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, XIcon, PlusIcon } from './icons';
import { generateModelImage, generateCollageImage } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '../lib/utils';
import { ErrorToast } from './ConfirmationToast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    e.target.value = '';
  };

  return (
    <div className="w-full sm:w-1/2 md:w-[240px] flex flex-col items-center gap-2">
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


const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onModelFinalized }) => {
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

  const handleStartOver = () => {
    setUserImage1(null);
    setUserImage2(null);
    setUserImage3(null);
    setUserImage4(null);
    setNumPeople(2);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
  };

  const handleProceed = () => {
    if (generatedModelUrl) {
      onModelFinalized(generatedModelUrl);
      onClose();
    }
  };
  
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => handleStartOver(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const hasStarted = isGenerating || generatedModelUrl || error;
  const uploadedImagesCount = [userImage1, userImage2, userImage3, userImage4].filter(Boolean).length;
  const canGenerate = uploadedImagesCount > 0 && !isGenerating;

  const screenVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-surface rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-modal-title"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-outline">
              <h2 id="create-modal-title" className="text-xl sm:text-2xl font-title font-bold tracking-wider text-onSurface">
                {generatedModelUrl ? 'Your Scene is Ready' : 'Create New Scene'}
              </h2>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full text-onSurfaceVariant hover:bg-surfaceVariant hover:text-onSurface transition-colors"
                aria-label="Close create new scene dialog"
              >
                <XIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
              </button>
            </div>
            
            <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                {!hasStarted ? (
                  <motion.div
                    key="uploader"
                    className="w-full flex flex-col items-center justify-center gap-6"
                    variants={screenVariants} initial="initial" animate="animate" exit="exit"
                  >
                    <div className="text-center max-w-3xl">
                      <h3 className="text-2xl font-serif font-bold text-onBackground leading-tight">
                        Upload Your Models
                      </h3>
                      <p className="mt-2 text-onSurfaceVariant">
                        Upload one to four photos. Our AI will place them in a professional scene.
                      </p>
                    </div>
                    <div className="w-full grid grid-cols-2 lg:grid-cols-4 items-start justify-center gap-4 sm:gap-6">
                      <ImageUploaderSlot image={userImage1} onFileSelect={(file) => handleFileSelect(file, 1)} onClear={() => setUserImage1(null)} label="Upload Person 1" isGenerating={isGenerating} />
                      <ImageUploaderSlot image={userImage2} onFileSelect={(file) => handleFileSelect(file, 2)} onClear={() => setUserImage2(null)} label="Upload Person 2" isGenerating={isGenerating} />
                      {numPeople >= 3 && <ImageUploaderSlot image={userImage3} onFileSelect={(file) => handleFileSelect(file, 3)} onClear={() => setUserImage3(null)} label="Upload Person 3" isGenerating={isGenerating} />}
                      {numPeople >= 4 && <ImageUploaderSlot image={userImage4} onFileSelect={(file) => handleFileSelect(file, 4)} onClear={() => setUserImage4(null)} label="Upload Person 4" isGenerating={isGenerating} />}
                    </div>

                    <div className="flex flex-col items-center mt-4 w-full max-w-sm space-y-4">
                      {numPeople < 4 && !isGenerating && (
                        <button onClick={() => setNumPeople(p => p + 1)} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-primary bg-surface border border-primary/50 rounded-full cursor-pointer hover:bg-primaryContainer transition-colors">
                          <PlusIcon className="w-5 h-5" /> Add {numPeople === 2 ? 'a Third' : 'a Fourth'} Person
                        </button>
                      )}
                      <button onClick={handleGenerate} disabled={!canGenerate} className="w-full relative flex items-center justify-center px-8 py-4 text-lg font-semibold text-onPrimary bg-primary rounded-full cursor-pointer group hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isGenerating ? <Spinner /> : 'Generate Scene'}
                      </button>
                      <p className="text-onSurfaceVariant/80 text-xs text-center !mt-2">By uploading, you agree not to create harmful content.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
                    variants={screenVariants} initial="initial" animate="animate" exit="exit"
                  >
                    <div className="md:w-1/2 flex items-center justify-center">
                      <div className="relative w-[280px] h-[420px] sm:w-[320px] sm:h-[480px] rounded-3xl bg-surface flex items-center justify-center border border-outline shadow-xl">
                        {isGenerating && (<div className="flex flex-col items-center gap-3 text-lg text-onSurface font-serif"><Spinner /><span>Generating...</span></div>)}
                        {generatedModelUrl && (<img src={generatedModelUrl} alt="Generated model scene" className="w-full h-full object-contain rounded-3xl animate-fade-in" />)}
                      </div>
                    </div>
                    <div className="md:w-1/2 flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
                      <p className="mt-2 text-md text-onSurfaceVariant">The AI has generated your model. You can now proceed to styling.</p>
                      <AnimatePresence>
                        {!isGenerating && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                            <button onClick={handleStartOver} className="w-full sm:w-auto px-6 py-3 text-base font-semibold text-onSecondaryContainer bg-secondaryContainer rounded-full cursor-pointer hover:bg-surfaceVariant transition-colors">Start Over</button>
                            {generatedModelUrl && !error && (<button onClick={handleProceed} className="w-full sm:w-auto relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-onPrimary bg-primary rounded-full cursor-pointer group hover:bg-indigo-700 transition-colors">Proceed to Styling &rarr;</button>)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {error && <ErrorToast message={error} onClose={() => setError(null)} />}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;