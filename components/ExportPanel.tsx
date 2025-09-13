/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getFriendlyErrorMessage, downloadImage } from '../lib/utils';
import Spinner from './Spinner';
import { DownloadIcon, ChevronLeftIcon } from './icons';
import { ErrorToast } from './ConfirmationToast';

interface ExportPageProps {
  displayImageUrl: string | null;
  onBack: () => void;
}

const ExportPage: React.FC<ExportPageProps> = ({ displayImageUrl, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState(`fit-check-${new Date().toISOString().split('T')[0]}`);
  const [addWatermark, setAddWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('Fit Check');

  const handleExport = useCallback(async () => {
    if (!displayImageUrl || isExporting) return;

    setIsExporting(true);
    setError(null);
    try {
        await downloadImage(displayImageUrl, filename, {
            watermarkText: addWatermark ? watermarkText : undefined,
        });
    } catch (err) {
        setError(getFriendlyErrorMessage(err, 'Failed to export image'));
    } finally {
        setIsExporting(false);
    }
  }, [displayImageUrl, isExporting, filename, addWatermark, watermarkText]);

  return (
    <motion.div
      className="w-full h-full flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex-shrink-0 w-full p-4 flex items-center justify-start z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-surface/60 border border-outline/80 text-onSurface font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-surface hover:border-onSurfaceVariant active:scale-95 text-sm backdrop-blur-sm"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to Editor
        </button>
      </header>
      <main className="flex-grow w-full flex flex-col lg:flex-row items-stretch justify-center gap-8 p-4 pt-0">
        <div className="flex-grow w-full lg:w-auto h-full flex items-center justify-center p-4 bg-surfaceVariant/50 rounded-3xl min-h-0">
          {displayImageUrl ? (
            <img src={displayImageUrl} alt="Final creation" className="max-w-full max-h-full object-contain rounded-2xl shadow-lg" />
          ) : (
            <div className="text-onSurfaceVariant">No image to display.</div>
          )}
        </div>
        <div className="w-full lg:w-80 flex-shrink-0 bg-surface/80 backdrop-blur-md rounded-2xl p-6 border border-outline/60">
            <div className="flex flex-col">
                <h2 className="text-2xl font-title font-bold tracking-wider text-onSurface border-b border-outline/50 pb-3 mb-6">Export</h2>
                <div className="space-y-6">
                    {/* Filename */}
                    <div>
                        <label htmlFor="filename-input" className="block text-sm font-medium text-onSurfaceVariant mb-2">Filename</label>
                        <input
                            id="filename-input"
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className="w-full px-3 py-2 bg-surfaceVariant border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                            placeholder="Enter filename"
                        />
                    </div>

                    {/* Watermark */}
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="watermark-toggle" className="text-sm font-medium text-onSurfaceVariant">Add Watermark</label>
                            <button
                                id="watermark-toggle"
                                role="switch"
                                aria-checked={addWatermark}
                                onClick={() => setAddWatermark(!addWatermark)}
                                className={`${addWatermark ? 'bg-primary' : 'bg-surfaceVariant'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                            >
                                <span className={`${addWatermark ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                            </button>
                        </div>
                        <AnimatePresence>
                            {addWatermark && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: '8px' }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <label htmlFor="watermark-text" className="sr-only">Watermark text</label>
                                    <input
                                        id="watermark-text"
                                        type="text"
                                        value={watermarkText}
                                        onChange={(e) => setWatermarkText(e.target.value)}
                                        className="w-full px-3 py-2 bg-surfaceVariant border border-outline rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                                        placeholder="Enter watermark text"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting || !displayImageUrl}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold text-onPrimary bg-primary rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <Spinner className="w-5 h-5" />
                                <span>Exporting...</span>
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="w-5 h-5" />
                                <span>Export Image</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
      </main>
      <AnimatePresence>
        {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExportPage;
