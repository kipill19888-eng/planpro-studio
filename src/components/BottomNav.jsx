import { Home, Box, Calculator, FileText, Menu, Bot } from 'lucide-react';

export default function BottomNav({ currentScreen, onMenuClick, onOpenMenu, onOpenHelper }) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: Home, path: 'home' },
    { id: 'projects', label: '3D План', icon: Box, path: 'projects' },
    { id: 'calc-finishing', label: 'Расчеты', icon: Calculator, path: 'calc-finishing' },
    { id: 'estimate', label: 'Смета', icon: FileText, path: 'estimate' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-1">
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id || (tab.id === 'projects' && currentScreen === 'projects-list');

          return (
            <button
              key={tab.id}
              onClick={() => onMenuClick(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
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

        {/* Кнопка Ещё (Меню) */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center w-full h-full gap-1 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Menu size={20} />
          <span className="text-[10px] font-medium">Ещё</span>
        </button>

      </div>
    </div>
  );
}