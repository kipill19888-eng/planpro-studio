import { useState } from 'react';
import { Search, Bell, ChevronDown, Plus, Trash2, Menu, X, Sun, Moon } from 'lucide-react';
import { useProjectsStore } from '../storeProjects';
import { useHouseStore } from '../store';
import { useThemeStore } from '../storeTheme';
import { useNavigate } from 'react-router-dom';

const searchableSections = [
  { name: 'Главная (Рабочий стол)', path: '/', keywords: ['главная', 'рабочий', 'стол', 'домой'] },
  { name: '3D Планировщик', path: '/project', keywords: ['3d', 'план', 'проект', 'комнат'] },
  { name: 'Калькулятор: Электрика', path: '/calc/electric', keywords: ['электрик', 'кабель', 'щит', 'автомат'] },
  { name: 'Калькулятор: Отделка', path: '/calc/finishing', keywords: ['отделка', 'плитка', 'обои', 'ламинат', 'штукатурка'] },
  { name: 'Материалы и цены', path: '/materials', keywords: ['материал', 'цена', 'прайс', 'импорт'] },
  { name: 'База работ', path: '/works', keywords: ['работ', 'услуг', 'стоимост'] },
  { name: 'Смета проекта', path: '/estimate', keywords: ['смет', 'итог', 'pdf'] },
  { name: 'Клиенты', path: '/clients', keywords: ['клиент', 'заказчик', 'база'] },
  { name: 'Настройки', path: '/settings', keywords: ['настройк', 'профиль', 'имя'] },
  { name: 'Тарифы (PRO)', path: '/pricing', keywords: ['тариф', 'pro', 'оплат', 'подписк'] },
];

export default function Header({ currentScreen, onOpenMenu }) {
  const { projects, activeProjectId, setActiveProject, addProject, removeProject } = useProjectsStore();
  const { projectRooms } = useHouseStore();
  const { isDark, toggleTheme } = useThemeStore(); // 👈 Достаем тему
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const totalRooms = Object.values(projectRooms).reduce((sum, rooms) => sum + rooms.length, 0);

  const searchResults = searchQuery.trim() === '' ? [] : searchableSections.filter(section => 
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    section.keywords.some(k => k.includes(searchQuery.toLowerCase()))
  );

  let title = 'Рабочий стол';
  let subtitle = 'Главная';

  if (currentScreen === 'projects') {
    title = activeProject?.name || 'Проект';
    subtitle = 'План > 3D модель';
  } else if (currentScreen === 'calc-electric' || currentScreen === 'calc-finishing') {
    title = 'Инженерные калькуляторы';
    subtitle = 'Расчеты';
  } else if (currentScreen === 'estimate') {
    title = 'Смета проекта';
    subtitle = 'Документы';
  } else if (currentScreen === 'materials') {
    title = 'Материалы и цены';
    subtitle = 'Справочники';
  } else if (currentScreen === 'works') {
    title = 'База работ';
    subtitle = 'Справочники';
  } else if (currentScreen === 'clients') {
    title = 'Клиенты';
    subtitle = 'CRM';
  } else if (currentScreen === 'settings') {
    title = 'Настройки';
    subtitle = 'Профиль';
  } else if (currentScreen === 'pricing') {
    title = 'Тарифы';
    subtitle = 'Подписка';
  } else if (currentScreen === 'terms') {
    title = 'Пользовательское соглашение';
    subtitle = 'Документы';
  }

  const handleCreateProject = () => {
    const name = prompt('Введите название нового проекта:', 'Новый проект');
    if (name) {
      addProject(name);
      setIsDropdownOpen(false);
    }
  };

  const handleDeleteProject = (e, id) => {
    e.stopPropagation();
    if (projects.length === 1) {
      alert('Нельзя удалить единственный проект');
      return;
    }
    if (window.confirm('Удалить этот проект?')) {
      removeProject(id);
    }
  };

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  return (
    <header className="h-[70px] bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-[#334155] flex items-center justify-between px-4 md:px-6 flex-shrink-0 print:hidden relative z-50 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-3">
        
        <button 
          onClick={onOpenMenu}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <Menu size={24} />
        </button>

        <div className="relative">
          <div 
            className="flex items-center gap-2 text-base md:text-lg font-bold text-gray-800 cursor-pointer hover:text-primary transition"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="truncate max-w-[150px] md:max-w-none">{title}</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          <div className="text-xs text-gray-500 mt-1 hidden sm:block">{subtitle}</div>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20">
                <div className="p-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b">Мои проекты</div>
                <div className="max-h-60 overflow-y-auto">
                  {projects.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => { setActiveProject(p.id); setIsDropdownOpen(false); }}
                      className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between group ${p.id === activeProjectId ? 'bg-blue-50 text-primary font-medium' : 'text-gray-700'}`}
                    >
                      <span className="truncate pr-2">{p.name}</span>
                      <button 
                        onClick={(e) => handleDeleteProject(e, p.id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 p-2 bg-gray-50">
                  <button 
                    onClick={handleCreateProject}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary hover:bg-blue-100 rounded-md transition font-medium"
                  >
                    <Plus size={16} /> Создать проект
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        
        <div className="relative hidden md:block">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-gray-400 focus-within:ring-2 focus-within:ring-primary/20 transition">
            <Search size={18} />
            <input
              type="text"
              placeholder="Поиск по сайту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="bg-transparent border-none outline-none text-sm w-48 text-gray-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 🌙 Кнопка переключения темы */}
        <button 
          onClick={toggleTheme} 
          className="p-2 text-gray-500 hover:text-primary transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          title={isDark ? 'Включить светлую тему' : 'Включить темную тему'}
        >
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        
        <div className="relative cursor-pointer text-gray-500 hover:text-primary transition">
          <Bell size={22} />
          {totalRooms > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white font-bold">
              {totalRooms > 9 ? '9+' : totalRooms}
            </span>
          )}
        </div>

        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold border border-blue-200 cursor-pointer hover:bg-blue-200 transition">
          А
        </div>
      </div>
    </header>
  );
}