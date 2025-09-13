/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons';
import Spinner from './Spinner';

interface TurntableModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  isLoading: boolean;
  loadingMessage: string;
}

const TurntableModal: React.FC<TurntableModalProps> = ({ isOpen, onClose, images, isLoading, loadingMessage }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0); // Reset to first image when opening
        }
    }, [isOpen]);
    
    useEffect(() => {
        if(images.length > 0 && currentIndex >= images.length) {
            setCurrentIndex(images.length - 1);
        }
    }, [images, currentIndex]);


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="turntable-modal-title"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 id="turntable-modal-title" className="text-xl sm:text-2xl font-serif tracking-wider text-gray-800">3D Turntable View</h2>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                aria-label="Close 3D View"
              >
                <XIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
              </button>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                    {isLoading && images.length === 0 && (
                         <div className="flex flex-col items-center gap-3 text-lg text-gray-700 font-serif text-center">
                            <Spinner />
                            <span>{loadingMessage || 'Generating 3D View...'}</span>
                        </div>
                    )}
                    {images.length > 0 && (
                        <AnimatePresence>
                             <motion.img
                                key={images[currentIndex]}
                                src={images[currentIndex]}
                                alt={`Turntable view ${currentIndex + 1}`}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </AnimatePresence>
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 bg-gray-50/50">
                <label htmlFor="turntable-slider" className="sr-only">Rotate Model</label>
                <input
                    id="turntable-slider"
                    type="range"
                    min="0"
                    max={images.length > 0 ? images.length - 1 : 0}
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    disabled={isLoading || images.length === 0}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TurntableModal;