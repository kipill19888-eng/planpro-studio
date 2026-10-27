import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectsStore = create(
  persist(
    (set, get) => ({
      projects: [
        { id: 'proj-default', name: 'Квартира на ул. Ленина 12', createdAt: new Date().toISOString() }
      ],
      activeProjectId: 'proj-default',

      addProject: (name) => {
        const newProject = {
          id: `proj-${Date.now()}`,
          name: name || 'Новый проект',
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id
        }));
        return newProject.id;
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      removeProject: (id) => set((state) => {
        if (state.projects.length === 1) return state;
        
        const newProjects = state.projects.filter(p => p.id !== id);
        const newActiveId = state.activeProjectId === id ? newProjects[0].id : state.activeProjectId;
        
        return {
          projects: newProjects,
          activeProjectId: newActiveId
        };
      }),

      updateProjectName: (id, name) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, name } : p)
      })),
    }),
    {
      name: 'planpro-projects-storage',
    }
  )
);