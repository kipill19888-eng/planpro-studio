import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 👇 Фотографии для демо-режима
const DEMO_BEFORE = [
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop', // Гостиная до
];

const DEMO_AFTER = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600&auto=format&fit=crop', // Гостиная после
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop', // Дом с бассейном
];

export const useGalleryStore = create(
  persist(
    (set, get) => ({
      // Храним объект: { 'project-id': { before: ['url1', 'url2'], after: ['url3'] } }
      galleries: {
        // 👇 Предзаполняем для дефолтного проекта
        'proj-default': {
          before: DEMO_BEFORE,
          after: DEMO_AFTER
        }
      },

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
    { 
      name: 'planpro-gallery-storage',
      version: 1 // Сбрасывает старый пустой кэш у тех, кто уже заходил
    }
  )
);