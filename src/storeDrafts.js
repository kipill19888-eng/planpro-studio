import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDraftsStore = create(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (calcKey, data) => set((state) => ({
        drafts: { ...state.drafts, [calcKey]: data }
      })),
      clearDraft: (calcKey) => set((state) => {
        const newDrafts = { ...state.drafts };
        delete newDrafts[calcKey];
        return { drafts: newDrafts };
      })
    }),
    { name: 'planpro-drafts-storage' }
  )
);