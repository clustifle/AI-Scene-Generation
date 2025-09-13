/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, FolderIcon, Trash2Icon } from './icons';
import type { Project } from '../types';
import CreateProjectModal from './CreateProjectModal';

interface DashboardProps {
  projects: Project[];
  onLoadProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onModelFinalized: (modelUrl: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onLoadProject, onDeleteProject, onModelFinalized }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <>
            <div className="w-full h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-background">
                <header className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-outline">
                    <div>
                        <h1 className="text-3xl font-title font-bold text-onBackground">Dashboard</h1>
                        <p className="text-onSurfaceVariant mt-1">Manage your projects or create a new one to get started.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-shrink-0 flex items-center gap-2 bg-primary text-onPrimary rounded-full py-2.5 px-6 shadow-lg text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Scene
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto pt-6">
                    {projects.length > 0 ? (
                        <motion.ul 
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                            variants={{
                                visible: { transition: { staggerChildren: 0.05 } }
                            }}
                            initial="hidden"
                            animate="visible"
                        >
                            {projects.map(project => (
                                <motion.li 
                                    key={project.id}
                                    layout
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-outline bg-surfaceVariant"
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
                        </motion.ul>
                    ) : (
                        <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                            <FolderIcon className="w-24 h-24 text-outline mx-auto" />
                            <h3 className="mt-6 text-2xl font-semibold text-onSurface">No Projects Yet</h3>
                            <p className="mt-2 text-onSurfaceVariant">Click 'New Scene' to get started.</p>
                        </div>
                    )}
                </main>
            </div>

            <CreateProjectModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onModelFinalized={onModelFinalized}
            />
        </>
    );
};

export default Dashboard;