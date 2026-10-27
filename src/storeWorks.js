import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultWorks = {
  plaster: 550,         // Штукатурка стен
  putty: 300,           // Шпаклевка стен
  wallpaper: 350,       // Поклейка обоев
  tile: 1200,           // Укладка плитки
  laminateStraight: 400,// Укладка ламината (прямая)
  laminateDiagonal: 600,// Укладка ламината (диагональ)
  electricLine: 1000,   // Монтаж линии (электрика)
};

export const useWorksStore = create(
  persist(
    (set, get) => ({
      works: defaultWorks,

      updateWork: (key, newPrice) => set((state) => ({
        works: {
          ...state.works,
          [key]: newPrice
        }
      })),

      getWorkPrice: (key) => get().works[key] || 0,
    }),
    { name: 'planpro-works-storage' }
  )
);