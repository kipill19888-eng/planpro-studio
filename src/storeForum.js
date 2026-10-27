import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialTopics = [
  {
    id: 'topic-1',
    title: 'Как лучше рассчитать плитку на лестницу?',
    category: 'Вопросы',
    author: 'Алексей',
    createdAt: new Date().toISOString(),
    messages: [
      { id: 'msg-1', author: 'Алексей', text: 'Всем привет! Делаю ремонт, не могу понять, как учесть подрезку на ступенях. Кто пользуется калькулятором, подскажите?', createdAt: new Date().toISOString() },
      { id: 'msg-2', author: 'Мария', text: 'Привет! Я беру ширину проступи + свес и добавляю 10% запаса. В калькуляторе PlanPro это уже заложено.', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 'topic-2',
    title: 'Покажите ваши проекты кухонь!',
    category: 'Покажите ремонт',
    author: 'Иван',
    createdAt: new Date().toISOString(),
    messages: [
      { id: 'msg-3', author: 'Иван', text: 'Начну: сделали кухню 12 кв.м, плитка на полу, ламинат в комнате. Смета вышла на 350к.', createdAt: new Date().toISOString() }
    ]
  }
];

export const useForumStore = create(
  persist(
    (set, get) => ({
      topics: initialTopics,

      addTopic: (title, text, category, author) => {
        const newTopic = {
          id: `topic-${Date.now()}`,
          title,
          category,
          author,
          createdAt: new Date().toISOString(),
          messages: [
            { id: `msg-${Date.now()}`, author, text, createdAt: new Date().toISOString() }
          ]
        };
        set((state) => ({ topics: [newTopic, ...state.topics] }));
        return newTopic.id;
      },

      addMessage: (topicId, text, author) => {
        const newMsg = {
          id: `msg-${Date.now()}`,
          author,
          text,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          topics: state.topics.map(t => 
            t.id === topicId ? { ...t, messages: [...t.messages, newMsg] } : t
          )
        }));
      },

      deleteTopic: (id) => {
        set((state) => ({ topics: state.topics.filter(t => t.id !== id) }));
      }
    }),
    { name: 'planpro-forum-storage' }
  )
);