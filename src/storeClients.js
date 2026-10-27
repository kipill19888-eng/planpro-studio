import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useClientsStore = create(
  persist(
    (set) => ({
      clients: [],
      
      addClient: (client) => set((state) => ({
        clients: [...state.clients, { ...client, id: `client-${Date.now()}` }]
      })),
      
      removeClient: (id) => set((state) => ({
        clients: state.clients.filter(c => c.id !== id)
      })),
      
      updateClient: (id, updates) => set((state) => ({
        clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
    }),
    { name: 'planpro-clients-storage' }
  )
);