import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Базовые цены
const defaultPrices = {
  electric: { cable: 45, breaker: 450, dif: 1800, workLine: 1000, meter: 3500, mainBreaker: 1200, fireRCD: 3500 },
  plaster: { gypsum: 450, cement: 350, work: 550 },
  putty: { start: 400, finish: 450, work: 300 },
  wallpaper: { roll: 2500, glue: 450, work: 350 },
  laminate: { pack: 1800, underlay: 1200, plinth: 350, workStraight: 400, workDiagonal: 600 },
  tile: { material: 800, glue: 350, grout: 120, work: 1200 },
};

export const useMaterialsStore = create(
  persist(
    (set, get) => ({
      prices: defaultPrices,
      customMaterials: [], 

      updatePrice: (category, key, newPrice) => set((state) => ({
        prices: {
          ...state.prices,
          [category]: {
            ...state.prices[category],
            [key]: newPrice
          }
        }
      })),

      addCustomMaterial: (material) => set((state) => ({
        customMaterials: [...state.customMaterials, { ...material, id: `mat-${Date.now()}` }]
      })),

      removeCustomMaterial: (id) => set((state) => ({
        customMaterials: state.customMaterials.filter(m => m.id !== id)
      })),

      // Умный поиск цены: сначала ищем в добавленных вручную, потом в базовых
      getMaterialPrice: (searchName, category, defaultKey) => {
        const state = get();
        
        // 1. Ищем совпадение по названию (игнорируя регистр)
        const customMatch = state.customMaterials.find(m => 
          m.name.toLowerCase().includes(searchName.toLowerCase())
        );
        
        if (customMatch) return customMatch.price;

        // 2. Если не нашли, берем базовую цену
        return state.prices[category]?.[defaultKey] || 0;
      }
    }),
    { name: 'planpro-materials-storage' }
  )
);