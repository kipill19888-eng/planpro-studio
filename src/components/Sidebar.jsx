import { Home, Folder, Box, List, FileText, Users, Box as Cube, Settings, Crown, PaintRoller, Zap, X, ShieldAlert, HardHat, MessageSquare } from 'lucide-react';
import { useUserStore } from '../storeUser';

export default function Sidebar({ onMenuClick, currentScreen, isOpen, onClose }) {
  const { subscriptionType, setSubscriptionType, userName } = useUserStore();

  // 👇 Обновленные названия тарифов
  const planNames = {
    demo: 'Демо (2 дня)',
    finisher: 'Мастер Отделки',
    master: 'Мастер Стройки',
    corporate: 'Корпоративный',
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[220px] md:w-64 bg-sidebar h-screen flex flex-col text-gray-400 flex-shrink-0 print:hidden
        transition-transform duration-300 md:relative md:translate-x-0 md:sticky md:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-4 py-3 md:p-5 flex items-center justify-between text-white border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Cube className="text-blue-500 w-5 h-5 md:w-8 md:h-8" />
            <div>
              <div className="font-bold text-sm md:text-lg leading-tight">ПланПро</div>
              <div className="text-[8px] md:text-[10px] text-gray-400">Studio</div>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-1 md:py-4 scrollbar-thin">
          <NavItem icon={<Home size={14} />} text="Главная" active={currentScreen === 'home'} onClick={() => onMenuClick('home')} />
          <NavItem icon={<Folder size={14} />} text="Проекты" active={currentScreen === 'projects-list'} onClick={() => onMenuClick('projects-list')} />
          
          <div className="my-1 md:my-2 border-t border-white/5 mx-2"></div>

          <NavItem icon={<Zap size={14} />} text="Электрика" active={currentScreen === 'calc-electric'} onClick={() => onMenuClick('calc-electric')} />
          <NavItem icon={<PaintRoller size={14} />} text="Отделка" active={currentScreen === 'calc-finishing'} onClick={() => onMenuClick('calc-finishing')} />
          <NavItem icon={<HardHat size={14} />} text="Строительство" active={currentScreen === 'calc-construction'} onClick={() => onMenuClick('calc-construction')} />
          
          <div className="my-1 md:my-2 border-t border-white/5 mx-2"></div>

          <NavItem icon={<Box size={14} />} text="Материалы" active={currentScreen === 'materials'} onClick={() => onMenuClick('materials')} />
          <NavItem icon={<List size={14} />} text="Стоимость работ" active={currentScreen === 'works'} onClick={() => onMenuClick('works')} />
          <NavItem icon={<FileText size={14} />} text="Сметы" active={currentScreen === 'estimate'} onClick={() => onMenuClick('estimate')} />
          <NavItem icon={<Users size={14} />} text="Клиенты" active={currentScreen === 'clients'} onClick={() => onMenuClick('clients')} />
          
          <NavItem 
            icon={<MessageSquare size={14} />} 
            text="Форум" 
            active={currentScreen === 'forum'} 
            onClick={() => onMenuClick('forum')} 
          />
          
          <div className="my-1 md:my-2 border-t border-white/5 mx-2"></div>

          <NavItem icon={<Cube size={14} />} text="3D планировщик" active={currentScreen === 'projects'} onClick={() => onMenuClick('projects')} />
          <NavItem icon={<Settings size={14} />} text="Настройки" active={currentScreen === 'settings'} onClick={() => onMenuClick('settings')} />
        </nav>

        {/* Блок с переключателем тарифа */}
        <div className="mx-2 md:m-4 p-2 md:p-4 bg-white/5 border border-white/10 rounded-lg md:rounded-xl shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="text-yellow-500 font-bold flex items-center gap-1 md:gap-2 text-xs md:text-base">
              <Crown size={12} className="md:w-4 md:h-4" /> Тариф
            </div>
          </div>
          
          <select
            value={subscriptionType}
            onChange={(e) => setSubscriptionType(e.target.value)}
            className="w-full bg-gray-800 text-white text-[11px] md:text-xs p-1.5 rounded border border-gray-700 outline-none cursor-pointer mb-2"
          >
            {Object.entries(planNames).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <p className="text-[9px] md:text-[10px] text-gray-500 leading-tight">
            {subscriptionType === 'demo' ? '2 дня пробного доступа' : 'Платный тариф'}
          </p>
        </div>

        <div className="px-3 md:px-5 pb-2">
          <button 
            onClick={() => onMenuClick('terms')}
            className={`flex items-center gap-1 md:gap-2 text-[9px] md:text-xs transition ${currentScreen === 'terms' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <ShieldAlert size={10} className="md:w-3.5 md:h-3.5" /> 
            <span className="hidden md:inline">Пользовательское соглашение</span>
            <span className="md:hidden">Соглашение</span>
          </button>
        </div>

        <div className="p-3 md:p-4 border-t border-white/10 flex items-center gap-2 md:gap-3 shrink-0">
          <div className="w-6 h-6 md:w-9 md:h-9 bg-blue-600 rounded md:rounded-md flex items-center justify-center text-white font-bold text-[10px] md:text-base">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-white text-[11px] md:text-sm font-medium truncate">{userName}</div>
            <div className="text-[9px] md:text-xs text-gray-400">
              {planNames[subscriptionType] || 'Базовый'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon, text, active, badge, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 md:gap-4 px-3 md:px-5 py-2 md:py-3 cursor-pointer transition-colors ${
        active ? 'bg-primary text-white mx-1.5 md:mx-3 rounded-md md:rounded-lg' : 'text-gray-300 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className="shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-[18px] md:[&>svg]:h-[18px]">
        {icon}
      </span>
      <span className="text-[12px] md:text-[15px] flex-1 truncate">{text}</span>
      {badge && <span className="bg-blue-600 text-white text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}