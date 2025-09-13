/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons';
import { Pose } from '../App';

interface PoseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPose: (index: number) => void;
  poses: Pose[];
  currentPoseIndex: number;
}

const PoseSelectionModal: React.FC<PoseSelectionModalProps> = ({ isOpen, onClose, onSelectPose, poses, currentPoseIndex }) => {
  const groupedPoses = poses.reduce((acc, pose, index) => {
    if (!acc[pose.category]) {
      acc[pose.category] = [];
    }
    acc[pose.category].push({ ...pose, originalIndex: index });
    return acc;
  }, {} as Record<string, (Pose & { originalIndex: number })[]>);

  // Define the order of categories
  const categoryOrder = ["Solo", "Couple", "Couple (Playful)", "Couple (Intimate)", "Group (3 People)", "Group (4 People)", "Meme"];
  const sortedCategories = Object.entries(groupedPoses).sort(([a], [b]) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1; // Put unknown categories at the end
    if (indexB === -1) return -1;
    return indexA - indexB;
  });


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
            className="relative bg-surface rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pose-modal-title"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-outline">
              <h2 id="pose-modal-title" className="text-xl sm:text-2xl font-title font-bold tracking-wider text-onSurface">Select a Pose</h2>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full text-onSurfaceVariant hover:bg-surfaceVariant hover:text-onSurface transition-colors"
                aria-label="Close pose selection"
              >
                <XIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
              </button>
            </div>
            <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
              {sortedCategories.map(([category, posesInCategory]) => (
                <div key={category} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-semibold text-onSurface mb-3 sticky top-0 bg-surface/80 backdrop-blur-sm py-2 -my-2">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {posesInCategory.map((pose) => (
                      <button
                        key={pose.originalIndex}
                        onClick={() => {
                          onSelectPose(pose.originalIndex);
                          onClose();
                        }}
                        className={`w-full text-left text-sm font-medium p-3.5 rounded-xl transition-colors
                          ${currentPoseIndex === pose.originalIndex
                            ? 'bg-primaryContainer text-onPrimaryContainer font-semibold'
                            : 'bg-secondaryContainer/50 text-onSurface hover:bg-secondaryContainer'
                          }`}
                      >
                        {pose.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PoseSelectionModal;