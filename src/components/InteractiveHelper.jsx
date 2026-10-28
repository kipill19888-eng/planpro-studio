import { useState, useEffect, useRef } from 'react';
import { Send, Bot, X } from 'lucide-react';

const knowledgeBase = [
  {
    keywords: ['смет', 'формир', 'счита', 'как работ', 'что так'],
    answer: 'Смета формируется автоматически. Вы заходите в калькуляторы, выбираете нужные материалы и работы, нажимаете «В смету». Все позиции собираются в разделе «Сметы». Там вы можете менять количество и цены. Смета привязана к активному проекту.'
  },
  {
    keywords: ['плитк', 'полож', 'укладк'],
    answer: 'Чтобы рассчитать плитку, перейдите в раздел «Калькулятор: Отделка» -> вкладка «Плитка». Выберите поверхность (Пол или Стены), укажите размеры плитки и шов. Нажмите «Рассчитать», а затем «В смету».'
  },
  {
    keywords: ['pdf', 'скачат', 'печат', 'документ'],
    answer: 'Скачивание PDF доступно в разделе «Сметы». Обратите внимание: экспорт в PDF доступен только на тарифе PRO.'
  },
  {
    keywords: ['стен', 'комнат', '3d', 'план', 'добав'],
    answer: 'Чтобы создать комнату, перейдите в «3D планировщик». На панели справа введите название, длину и ширину комнаты, затем нажмите «Создать комнату».'
  },
  {
    keywords: ['цен', 'стоим', 'материал', 'деньг'],
    answer: 'Все цены на материалы и работы хранятся в разделах «Материалы» и «База работ». Вы можете изменить их вручную.'
  },
  {
    keywords: ['про', 'pro', 'тариф', 'оплат', 'подписк'],
    answer: 'Тариф PRO открывает неограниченное количество проектов и экспорт в PDF без водяных знаков. Подробнее — на странице «Тарифы».'
  },
  {
    keywords: ['привет', 'здравств', 'хай', 'добрый'],
    answer: 'Здравствуйте! Я — виртуальный помощник PlanPro Studio. Подскажу, как работать с калькуляторами, сметами и 3D-планировщиком. Чем могу помочь?'
  }
];

export default function InteractiveHelper({ forceOpen, onCloseExternal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Привет! Я ваш помощник по PlanPro Studio. Спросите меня о том, как посчитать материалы или создать комнату.', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      const foundAnswer = knowledgeBase.find(item => 
        item.keywords.some(keyword => lowerInput.includes(keyword))
      );

      const botResponse = {
        id: Date.now() + 1,
        text: foundAnswer 
          ? foundAnswer.answer 
          : 'Извините, я пока не знаю ответа на этот вопрос. Попробуйте спросить про «плитку», «смету», «PDF» или «создание комнаты».',
        isBot: true
      };

      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  return (
    <>
      {/* Окно чата (на мобильных занимает весь экран, на ПК - висит справа) */}
      {isOpen && (
        <>
          {/* Затемнение фона только для мобильных */}
          <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={handleClose} />
          
          <div className="fixed inset-0 z-[70] md:inset-auto md:bottom-20 md:right-6 md:w-96 md:h-[500px] bg-white dark:bg-[#1e293b] md:rounded-2xl shadow-2xl border-none md:border md:border-gray-200 dark:md:border-gray-700 flex flex-col overflow-hidden animate-fade-in print:hidden">
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-[#0f172a] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-sm">Помощник</h3>
                  <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> В сети
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition p-2 bg-white dark:bg-gray-800 rounded-full md:bg-transparent md:dark:bg-transparent">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc] dark:bg-[#0f172a]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  {msg.isBot && (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                    msg.isBot 
                      ? 'bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-tl-sm shadow-sm' 
                      : 'bg-primary text-white rounded-tr-sm shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ваш вопрос..."
                className="flex-1 p-3 bg-gray-100 dark:bg-[#0f172a] border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500"
              />
              <button type="submit" className="p-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition">
                <Send size={18} />
              </button>
            </form>
          </div>
        </>
      )}

      {/* Плавающая кнопка (ПОКАЗЫВАЕТСЯ ТОЛЬКО НА ПК) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-xl items-center justify-center hover:scale-105 transition-transform animate-pulse-slow print:hidden"
        >
          <Bot size={28} />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      )}
    </>
  );
}