/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, Trash2Icon, FolderIcon } from './icons';
import type { Project } from '../types';

interface ProjectsViewProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onLoadProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({
  isOpen,
  onClose,
  projects,
  onLoadProject,
  onDeleteProject,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-surface rounded-3xl w-full h-full flex flex-col shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="projects-title"
          >
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-outline">
              <h2 id="projects-title" className="text-xl sm:text-2xl font-serif tracking-wider text-onSurface">Projects</h2>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full text-onSurfaceVariant hover:bg-surfaceVariant hover:text-onSurface transition-colors"
                aria-label="Close projects view"
              >
                <XIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 sm:p-6">
              {projects.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {projects.map(project => (
                    <motion.li 
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-outline"
                    >
                      <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-bold truncate">{project.name}</h3>
                        <p className="text-xs opacity-80">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onLoadProject(project)}
                          className="px-4 py-2 bg-primary text-onPrimary text-sm font-semibold rounded-full hover:bg-indigo-700"
                        >
                          Load Project
                        </button>
                        <button 
                            onClick={() => onDeleteProject(project.id)}
                            className="absolute top-2 right-2 p-2 bg-surface/20 rounded-full text-white hover:bg-error hover:text-onError transition-colors"
                            aria-label={`Delete project ${project.name}`}
                        >
                            <Trash2Icon className="w-4 h-4"/>
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                  <FolderIcon className="w-16 h-16 text-outline mx-auto" />
                  <h3 className="mt-4 text-xl font-semibold text-onSurface">No Projects Yet</h3>
                  <p className="mt-2 text-onSurfaceVariant">Save a scene to see it here.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectsView;
