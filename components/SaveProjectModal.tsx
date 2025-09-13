/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, SaveIcon } from './icons';
import Spinner from './Spinner';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectName: string) => Promise<void>;
  isSaving: boolean;
}

const SaveProjectModal: React.FC<SaveProjectModalProps> = ({ isOpen, onClose, onSave, isSaving }) => {
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset name when modal opens
      setProjectName(`My Scene ${new Date().toLocaleDateString()}`);
    }
  }, [isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && !isSaving) {
      onSave(projectName.trim());
    }
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
            className="relative bg-surface rounded-3xl w-full max-w-md flex flex-col shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-outline">
              <h2 id="save-modal-title" className="text-xl sm:text-2xl font-title font-bold tracking-wider text-onSurface">Save Project</h2>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full text-onSurfaceVariant hover:bg-surfaceVariant hover:text-onSurface transition-colors"
                aria-label="Close save dialog"
              >
                <XIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <label htmlFor="project-name" className="block text-sm font-medium text-onSurfaceVariant mb-2">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Summer Collection"
                className="w-full px-3 py-2 bg-surfaceVariant border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                required
              />
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-onSurface bg-surfaceVariant rounded-full hover:bg-outline/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !projectName.trim()}
                  className="px-6 py-2 flex items-center justify-center gap-2 text-sm font-semibold text-onPrimary bg-primary rounded-full hover:bg-indigo-700 transition-colors disabled:bg-slate-400"
                >
                  {isSaving ? (
                      <>
                          <Spinner className="w-5 h-5" />
                          <span>Saving...</span>
                      </>
                  ) : (
                      <>
                          <SaveIcon className="w-5 h-5" />
                          <span>Save</span>
                      </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveProjectModal;