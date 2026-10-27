import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGalleryStore = create(
  persist(
    (set, get) => ({
      // Храним объект: { 'project-id': { before: ['url1', 'url2'], after: ['url3'] } }
      galleries: {},

      addPhoto: (projectId, type, photoUrl) => set((state) => {
        const currentProjectGallery = state.galleries[projectId] || { before: [], after: [] };
        return {
          galleries: {
            ...state.galleries,
            [projectId]: {
              ...currentProjectGallery,
              [type]: [...currentProjectGallery[type], photoUrl]
            }
          }
        };
      }),

      removePhoto: (projectId, type, index) => set((state) => {
        const currentProjectGallery = state.galleries[projectId] || { before: [], after: [] };
        const newPhotos = currentProjectGallery[type].filter((_, i) => i !== index);
        return {
          galleries: {
            ...state.galleries,
            [projectId]: {
              ...currentProjectGallery,
              [type]: newPhotos
            }
          }
        };
      }),

      getPhotos: (projectId, type) => {
        const gallery = get().galleries[projectId];
        return gallery ? gallery[type] : [];
      }
    }),
    { name: 'planpro-gallery-storage' }
  )
);