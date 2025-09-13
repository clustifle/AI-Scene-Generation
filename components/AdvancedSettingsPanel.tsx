/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ChevronDownIcon, CpuIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelEngine } from '../types';

interface AdvancedSettingsPanelProps {
    selectedModel: ModelEngine;
    onSelectModel: (model: ModelEngine) => void;
    defaultOpen?: boolean;
}

const AdvancedSettingsPanel: React.FC<AdvancedSettingsPanelProps> = ({ selectedModel, onSelectModel, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const ControlButton: React.FC<{
        label: string;
        description: string;
        value: ModelEngine;
    }> = ({ label, description, value }) => (
        <button
            onClick={() => onSelectModel(value)}
            className={`p-3 text-left border rounded-lg transition-colors duration-200 ${
                selectedModel === value
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
            }`}
            aria-pressed={selectedModel === value}
        >
            <span className="font-semibold text-sm">{label}</span>
            <p className="text-xs mt-1">{description}</p>
        </button>
    );

    return (
        <div className="flex flex-col border-b border-gray-400/50 pb-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full"
                aria-expanded={isOpen}
            >
                <h2 className="text-xl font-serif tracking-wider text-gray-800">Advanced Settings</h2>
                <ChevronDownIcon className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden mt-4"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <CpuIcon className="w-4 h-4" />
                                    Model Engine
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <ControlButton
                                        label="Quality"
                                        description="Nano Banana"
                                        value="nano-banana"
                                    />
                                    <ControlButton
                                        label="Speed"
                                        description="Gemini Flash"
                                        value="gemini-flash"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    'Quality' provides specialized image editing. 'Speed' is a faster, general model. If you experience quota issues, try switching models.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedSettingsPanel;