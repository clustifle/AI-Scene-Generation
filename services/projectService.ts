/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Project } from '../types';

const PROJECTS_STORAGE_KEY = 'fitcheck_projects';

export const getProjects = (): Project[] => {
    try {
        const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (projectsJson) {
            // Sort by createdAt date, newest first
            const projects = JSON.parse(projectsJson) as Project[];
            return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    } catch (error) {
        console.error("Failed to parse projects from localStorage", error);
    }
    return [];
};

export const saveProjects = (projects: Project[]): void => {
    try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
        console.error("Failed to save projects to localStorage", error);
    }
};
