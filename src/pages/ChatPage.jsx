import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

// База знаний (захардкоженные ответы)
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
    answer: 'Скачивание PDF доступно в разделе «Сметы». Обратите внимание: экспорт в PDF доступен только на тарифе PRO. Если вы на бесплатном тарифе, появится окно с предложением улучшить аккаунт.'
  },
  {
    keywords: ['стен', 'комнат', '3d', 'план', 'добав'],
    answer: 'Чтобы создать комнату, перейдите в «3D планировщик». На панели справа введите название, длину и ширину комнаты, затем нажмите «Создать комнату». Вы сможете добавлять окна и двери, кликая по стенам.'
  },
  {
    keywords: ['цен', 'стоим', 'материал', 'деньг'],
    answer: 'Все цены на материалы и работы хранятся в разделах «Материалы» и «База работ». Вы можете изменить их вручную. Калькуляторы автоматически берут актуальные цены оттуда.'
  },
  {
    keywords: ['про', 'pro', 'тариф', 'оплат', 'подписк'],
    answer: 'Тариф PRO открывает неограниченное количество проектов и экспорт в PDF без водяных знаков. Подробнее можно узнать на странице «Тарифы» (кнопка «Улучшить» в левом нижнем углу или в меню).'
  },
  {
    keywords: ['клиент', 'заказчик', 'база'],
    answer: 'В разделе «Клиенты» вы можете вести базу заказчиков. При формировании сметы выберите клиента из выпадающего списка в шапке, и его данные автоматически попадут в PDF-документ.'
  },
  {
    keywords: ['привет', 'здравств', 'хай', 'добрый'],
    answer: 'Здравствуйте! Я — виртуальный помощник PlanPro Studio. Подскажу, как работать с калькуляторами, сметами и 3D-планировщиком. Чем могу помочь?'
  },
  {
    keywords: ['работ', 'база', 'услуг'],
    answer: 'В разделе «База работ» вы можете настроить цены на выполнение работ (например, укладка плитки или штукатурка). Эти цены будут автоматически подставляться в смету при добавлении работ.'
  },
  {
    keywords: ['сохра', 'проект', 'данн'],
    answer: 'Все ваши проекты сохраняются автоматически в браузере. Вы можете создавать новые проекты в шапке сайта. Каждый проект хранит свои комнаты и свою смету.'
  }
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Привет! Я ваш помощник по PlanPro Studio. Спросите меня о том, как посчитать материалы, создать комнату или скачать смету.', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Автоскролл вниз при новом сообщении
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Добавляем сообщение пользователя
    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Имитация задержки (печатает...)
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      
      // Ищем ответ в базе знаний
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
    // Добавили h-full, чтобы контейнер занимал всю высоту родителя
    <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col h-full overflow-hidden animate-fade-in">
      
      {/* Шапка чата */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50 flex-shrink-0">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Помощник по сайту</h2>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span> В сети
          </p>
        </div>
      </div>

      {/* История сообщений — flex-1 и overflow-y-auto гарантируют прокрутку */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8fafc]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            
            {msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                <Bot size={16} />
              </div>
            )}

            <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
              msg.isBot 
                ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm' 
                : 'bg-primary text-white rounded-tr-sm shadow-md'
            }`}>
              {msg.text}
            </div>

            {!msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Задайте вопрос по работе с сайтом..."
          className="flex-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
        />
        <button 
          type="submit" 
          className="px-5 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}