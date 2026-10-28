import { Home, Box, Calculator, FileText, Bot } from 'lucide-react';

export default function BottomNav({ currentScreen, onMenuClick, onOpenHelper }) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: Home, path: 'home' },
    { id: 'projects', label: '3D План', icon: Box, path: 'projects' },
    { id: 'calc', label: 'Расчеты', icon: Calculator, path: 'calc-hub' },
    { id: 'estimate', label: 'Смета', icon: FileText, path: 'estimate' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-gray-700 z-50 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* 👇 Изменено на flex, чтобы кнопки распределились равномерно (теперь их 5, а не 6) */}
      <div className="flex justify-around items-center h-16 px-1">
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          
          const isActive = 
            currentScreen === tab.id || 
            (tab.id === 'projects' && currentScreen === 'projects-list') ||
            (tab.id === 'calc' && (
              currentScreen === 'calc-hub' || 
              currentScreen === 'calc-electric' || 
              currentScreen === 'calc-finishing' || 
              currentScreen === 'calc-construction'
            ));

          return (
            <button
              key={tab.id}
              onClick={() => onMenuClick(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Кнопка Помощник (открывает ИИ) */}
        <button
          onClick={onOpenHelper}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-primary transition-colors"
        >
          <Bot size={20} />
          <span className="text-[10px] font-medium">Помощник</span>
        </button>

        {/* 👇 Кнопка "Ещё" полностью удалена */}

      </div>
    </div>
  );
}