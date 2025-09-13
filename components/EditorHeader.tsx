/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { SaveIcon, FolderIcon, DownloadIcon } from './icons';
import { motion } from 'framer-motion';

interface EditorHeaderProps {
    onSave: () => void;
    onDashboard: () => void;
    onExport: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ onSave, onDashboard, onExport }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-end pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
            <motion.button
                id="onboarding-export-button"
                onClick={onExport}
                className="flex items-center gap-2 bg-surface/60 border border-outline/80 text-onSurface font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-surface hover:border-onSurfaceVariant active:scale-95 text-sm backdrop-blur-sm"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                exit={{ opacity: 0, x: 10 }}
            >
                <DownloadIcon className="w-4 h-4" />
                Export
            </motion.button>
            <motion.button
                id="onboarding-save-button"
                onClick={onSave}
                className="flex items-center gap-2 bg-surface/60 border border-outline/80 text-onSurface font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-surface hover:border-onSurfaceVariant active:scale-95 text-sm backdrop-blur-sm"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
                exit={{ opacity: 0, x: 10 }}
            >
                <SaveIcon className="w-4 h-4" />
                Save
            </motion.button>
            <button
                id="onboarding-dashboard-button"
                onClick={onDashboard}
                className="flex items-center gap-2 bg-surface/60 border border-outline/80 text-onSurface font-semibold py-2 pl-2 pr-4 rounded-full transition-all duration-200 ease-in-out hover:bg-surface hover:border-onSurfaceVariant active:scale-95 text-sm backdrop-blur-sm"
            >
                <div className="w-7 h-7 bg-secondaryContainer rounded-full flex items-center justify-center">
                    <FolderIcon className="w-4 h-4 text-onSecondaryContainer" />
                </div>
                <span>Dashboard</span>
            </button>
        </div>
    </header>
  );
};

export default EditorHeader;