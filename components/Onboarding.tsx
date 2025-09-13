/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
// Fix: Import MotionStyle for explicit typing
import { motion, AnimatePresence, type MotionStyle } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from './icons';

// Fix: Export OnboardingStep interface to be used in App.tsx
export interface OnboardingStep {
  selector?: string;
  title: string;
  description: string;
  isFinal?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingProps {
  step: number;
  steps: OnboardingStep[];
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ step, steps, onNext, onPrev, onSkip }) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const currentStep = steps[step];

  useEffect(() => {
    if (!currentStep?.selector) {
      setTargetRect(null);
      return;
    }

    const findElement = () => {
      const element = document.querySelector(currentStep.selector as string);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null); 
      }
    };

    // Initial check
    findElement();

    // Retry if element not found immediately (for elements that render conditionally)
    const interval = setInterval(() => {
        if (!document.querySelector(currentStep.selector as string)) {
             findElement();
        } else {
            clearInterval(interval);
        }
    }, 200);
    
    // Also re-check on resize
    window.addEventListener('resize', findElement);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', findElement);
    };
  }, [currentStep?.selector]);


  const getTooltipPosition = () => {
    if (!targetRect) {
      // Center for final step or if target not found
      return { top: '50%', left: '50%', x: '-50%', y: '-50%' };
    }

    const PADDING = 16;
    const position = currentStep.position || 'bottom';

    switch (position) {
        case 'top':
            return { bottom: window.innerHeight - targetRect.top + PADDING, left: targetRect.left + targetRect.width / 2, x: '-50%' };
        case 'left':
            return { top: targetRect.top + targetRect.height / 2, right: window.innerWidth - targetRect.left + PADDING, y: '-50%' };
        case 'right':
            return { top: targetRect.top + targetRect.height / 2, left: targetRect.right + PADDING, y: '-50%' };
        case 'bottom':
        default:
             return { top: targetRect.bottom + PADDING, left: targetRect.left + targetRect.width / 2, x: '-50%' };
    }
  };

  // Fix: Explicitly type highlightStyle as MotionStyle to fix pointerEvents type error
  const highlightStyle: MotionStyle = targetRect ? {
    position: 'fixed',
    top: targetRect.top,
    left: targetRect.left,
    width: targetRect.width,
    height: targetRect.height,
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
    borderRadius: '12px',
    transition: 'top 0.3s, left 0.3s, width 0.3s, height 0.3s',
    pointerEvents: 'none',
    zIndex: 9998,
  } : {};

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className="fixed inset-0 z-[9997]">
      {/* Highlighter */}
       <AnimatePresence>
        {targetRect && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={highlightStyle}
            />
        )}
      </AnimatePresence>

      {/* Tooltip / Modal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="fixed z-[9999] w-[calc(100%-2rem)] max-w-sm p-5 bg-surface rounded-3xl shadow-xl"
          style={getTooltipPosition()}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={tooltipVariants}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {currentStep.isFinal ? (
            <div className="text-center">
                 <h3 className="text-2xl font-title font-bold text-onSurface">{currentStep.title}</h3>
                <p className="mt-2 text-onSurfaceVariant">{currentStep.description}</p>
                 <button
                    onClick={onSkip}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-onPrimary bg-primary rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    <SparklesIcon className="w-5 h-5"/>
                    Get Started
                </button>
            </div>
          ) : (
            <>
                <h3 className="text-xl font-title font-bold text-onSurface">{currentStep.title}</h3>
                <p className="mt-1 text-sm text-onSurfaceVariant">{currentStep.description}</p>
                <div className="mt-6 flex items-center justify-between">
                    <button onClick={onSkip} className="text-sm font-semibold text-onSurfaceVariant hover:text-onSurface">Skip</button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-onSurfaceVariant">{step + 1} / {steps.length-1}</span>
                         <button onClick={onNext} className="px-4 py-2 text-sm font-semibold text-onPrimary bg-primary rounded-full hover:bg-indigo-700">Next</button>
                    </div>
                </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Final step overlay */}
      {currentStep.isFinal && (
         <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
         />
      )}
    </div>
  );
};

export default Onboarding;