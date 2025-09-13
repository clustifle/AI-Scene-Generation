/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, AlertTriangleIcon, XIcon } from './icons';

interface ConfirmationToastProps {
  message: string;
}

const ConfirmationToast: React.FC<ConfirmationToastProps> = ({ message }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-0 flex items-center gap-3 bg-onSurface/90 backdrop-blur-sm text-surface text-sm font-semibold px-4 py-3 rounded-xl shadow-lg z-40"
      role="status"
      aria-live="polite"
    >
      <CheckCircleIcon className="w-5 h-5 text-green-400" />
      <span>{message}</span>
    </motion.div>
  );
};

export default ConfirmationToast;

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 7000); // Auto-dismiss after 7 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [message, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md p-4 flex items-start gap-3 bg-error text-onError text-sm rounded-xl shadow-2xl z-50"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0 pt-0.5">
          <AlertTriangleIcon className="w-5 h-5" />
      </div>
      <div className="flex-grow">
          <p className="font-bold">Something went wrong</p>
          <p className="font-normal mt-1">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 -mr-1 -mt-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close error message"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </motion.div>
  );
};