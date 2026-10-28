import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultWorks = [
  { id: 'w-plaster', name: 'Штукатурка стен', price: 550, unit: '₽/м²' },
  { id: 'w-putty', name: 'Шпаклевка стен', price: 300, unit: '₽/м²' },
  { id: 'w-wallpaper', name: 'Поклейка обоев', price: 350, unit: '₽/м²' },
  { id: 'w-tile', name: 'Укладка плитки', price: 1200, unit: '₽/м²' },
  { id: 'w-lam-straight', name: 'Укладка ламината (прямая)', price: 400, unit: '₽/м²' },
  { id: 'w-lam-diag', name: 'Укладка ламината (диагональ)', price: 600, unit: '₽/м²' },
  { id: 'w-electric', name: 'Монтаж линии (электрика)', price: 1000, unit: '₽/шт' },
  { id: 'w-stair', name: 'Монтаж лестницы', price: 5000, unit: '₽/шт' },
];

export const useWorksStore = create(
  persist(
    (set, get) => ({
      works: defaultWorks,

      updateWork: (id, newPrice) => set((state) => ({
        works: state.works.map(w => w.id === id ? { ...w, price: newPrice } : w)
      })),

      addWork: (name, price, unit) => set((state) => ({
        works: [...state.works, { 
          id: `w-${Date.now()}`, 
          name, 
          price: Number(price), 
          unit 
        }]
      })),

      removeWork: (id) => set((state) => ({
        works: state.works.filter(w => w.id !== id)
      })),

      getWorkPrice: (id) => {
        const work = get().works.find(w => w.id === id);
        return work ? work.price : 0;
      },
    }),
    { 
      name: 'planpro-works-storage',
      version: 2 // Поднимаем версию, чтобы сбросить старый формат
    }
  )
);