import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      userName: 'Алексей Иванов',
      
      subscriptionType: 'demo',
      trialStartedAt: null,

      setUserName: (name) => set({ userName: name }),
      setSubscriptionType: (type) => set({ subscriptionType: type }),

      startDemo: () => {
        const { trialStartedAt, subscriptionType } = get();
        if (!trialStartedAt && subscriptionType === 'demo') {
          set({ trialStartedAt: Date.now() });
        }
      },

      isDemoExpired: () => {
        const { subscriptionType, trialStartedAt } = get();
        if (subscriptionType !== 'demo') return false;
        if (!trialStartedAt) return false;
        const twoDays = 2 * 24 * 60 * 60 * 1000;
        return Date.now() - trialStartedAt > twoDays;
      },

      canEdit: () => {
        const { subscriptionType } = get();
        if (subscriptionType !== 'demo') return true;
        return !get().isDemoExpired();
      },

      // 👇 PDF доступен для ВСЕХ платных тарифов (Мастер Отделки, Мастер Стройки, Корпоративный) и для активного демо
      canExportPDF: () => {
        const { subscriptionType } = get();
        if (subscriptionType === 'demo') {
          return !get().isDemoExpired();
        }
        return true; // Платные тарифы — можно
      },

      // 👇 Excel доступен только для Мастера Стройки и Корпоративного
      canExportExcel: () => {
        const { subscriptionType } = get();
        return subscriptionType === 'master' || subscriptionType === 'corporate';
      },

      canUseCRM: () => {
        const { subscriptionType } = get();
        return subscriptionType === 'master' || subscriptionType === 'corporate';
      },

      canCreateProject: (currentProjectsCount) => {
        const { subscriptionType } = get();
        if (subscriptionType === 'finisher') {
          return currentProjectsCount < 1;
        }
        return true;
      }
    }),
    { name: 'planpro-user-storage' }
  )
);