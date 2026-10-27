import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      isPro: false,
      userName: 'Алексей Иванов', // <-- Добавили имя по умолчанию
      setPro: (status) => set({ isPro: status }),
      setUserName: (name) => set({ userName: name }), // <-- Функция смены имени
    }),
    { name: 'planpro-user-storage' }
  )
);