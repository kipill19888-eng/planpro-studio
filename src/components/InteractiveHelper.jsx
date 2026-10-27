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
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Привет! Я ваш помощник по PlanPro Studio. Спросите меня о том, как посчитать материалы или создать комнату.', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(timer);
  }, []);

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
    // Изменили bottom-6 на bottom-20 для мобильных, чтобы не перекрывать кнопку сохранения
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end print:hidden">
      
      {/* Окно чата */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 md:w-96 flex flex-col transition-all duration-300 origin-bottom-right mb-4 overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 h-[500px]' : 'scale-0 opacity-0 h-0'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Помощник</h3>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> В сети
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 transition p-1">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              {msg.isBot && (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
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

        <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ваш вопрос..."
            className="flex-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm text-gray-900 placeholder-gray-500"
          />
          <button type="submit" className="p-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition">
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Приветственный пузырь */}
      {showGreeting && !isOpen && (
        <div className="absolute bottom-20 right-0 bg-white p-4 rounded-2xl rounded-br-sm shadow-2xl border-2 border-primary/20 mb-3 w-64 animate-fade-in relative z-50">
          <p className="text-sm text-gray-800 font-medium leading-snug">
            Привет! Нужна помощь с расчетами? Нажми на меня 👋
          </p>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowGreeting(false); }}
            className="absolute -top-2 -right-2 bg-gray-100 text-gray-500 rounded-full p-1 hover:bg-gray-200 shadow-sm transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Кнопка-робот (сделали чуть меньше на мобильных) */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setShowGreeting(false);
        }}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform relative ${
          !isOpen ? 'animate-pulse-slow' : ''
        }`}
      >
        <Bot size={28} className="md:w-8 md:h-8" />
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

    </div>
  );
}