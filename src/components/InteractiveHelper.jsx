import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, X } from 'lucide-react';

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

export default function InteractiveHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Привет! Я ваш помощник по PlanPro Studio. Спросите меня о том, как посчитать материалы или создать комнату.', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end print:hidden">
      
      {/* Окно чата */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 md:w-96 flex flex-col transition-all duration-300 origin-bottom-right mb-3 overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 h-[450px]' : 'scale-0 opacity-0 h-0'
        }`}
      >
        <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Помощник</h3>
              <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> В сети
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8fafc]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              {msg.isBot && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={12} />
                </div>
              )}
              <div className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                msg.isBot 
                  ? 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm' 
                  : 'bg-primary text-white rounded-tr-sm shadow-md'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-2 border-t border-gray-200 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ваш вопрос..."
            className="flex-1 p-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-xs text-gray-900 placeholder-gray-500"
          />
          <button type="submit" className="p-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition">
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Кнопка-робот (без пузыря) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform relative ${
          !isOpen ? 'animate-pulse-slow' : ''
        }`}
      >
        <Bot size={24} />
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

    </div>
  );
}