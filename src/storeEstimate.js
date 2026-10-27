import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProjectsStore } from './storeProjects';

export const useEstimateStore = create(
  persist(
    (set, get) => ({
      // Храним сметы в объекте: { 'proj-id': [позиции] }
      projectEstimates: {},

      // Получаем список позиций для ТЕКУЩЕГО активного проекта
      getCurrentItems: () => {
        const activeId = useProjectsStore.getState().activeProjectId;
        return get().projectEstimates[activeId] || [];
      },

      // Обновляем смету текущего проекта
      updateCurrentEstimate: (newItems) => {
        const activeId = useProjectsStore.getState().activeProjectId;
        set((state) => ({
          projectEstimates: {
            ...state.projectEstimates,
            [activeId]: newItems
          }
        }));
      },

      addItem: (item) => {
        const currentItems = get().getCurrentItems();
        
        // Проверяем, есть ли уже такой материал (склеиваем)
        const existing = currentItems.find(
          i => i.name === item.name && i.unit === item.unit
        );

        let newItems;
        if (existing) {
          newItems = currentItems.map(i =>
            i.id === existing.id
              ? { ...i, quantity: (i.quantity || 0) + (item.quantity || 0) }
              : i
          );
        } else {
          newItems = [...currentItems, { ...item, id: `item-${Date.now()}-${Math.random()}` }];
        }

        get().updateCurrentEstimate(newItems);
      },

      removeItem: (id) => {
        const currentItems = get().getCurrentItems();
        get().updateCurrentEstimate(currentItems.filter(i => i.id !== id));
      },

      updateItem: (id, field, value) => {
        const currentItems = get().getCurrentItems();
        get().updateCurrentEstimate(
          currentItems.map(i => i.id === id ? { ...i, [field]: value } : i)
        );
      },

      clearEstimate: () => {
        get().updateCurrentEstimate([]);
      }
    }),
    {
      name: 'planpro-estimate-storage',
      version: 2,
      migrate: (persistedState, version) => {
        // Миграция со старого формата (массив items) на новый (объект projectEstimates)
        if (version === 0 || version === 1) {
          return {
            projectEstimates: {
              'proj-default': persistedState.items || []
            }
          };
        }
        return persistedState;
      }
    }
  )
);