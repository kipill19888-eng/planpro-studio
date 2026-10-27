import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => {
        const newDark = !state.isDark;
        if (newDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDark: newDark };
      }),
      initTheme: () => {
        const isDark = useThemeStore.getState().isDark;
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
      }
    }),
    { name: 'planpro-theme-storage' }
  )
);