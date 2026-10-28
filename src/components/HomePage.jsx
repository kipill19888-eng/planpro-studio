import { useState } from 'react';
import { Folder, Calculator, FileText, Plus, ArrowRight, Home as HomeIcon, Clock, Trash2, Layers, Ruler, CheckCircle2, Crown, Box, Zap, PaintRoller, ShieldCheck, Users, Sparkles, HardHat } from 'lucide-react';
import { useProjectsStore } from '../storeProjects';
import { useHouseStore } from '../store';
import { useUserStore } from '../storeUser';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import { useToastStore } from '../storeToast';

export default function HomePage() {
  const { projects, activeProjectId, setActiveProject, addProject, removeProject } = useProjectsStore();
  const { projectRooms } = useHouseStore();
  const { canEdit, isDemoExpired } = useUserStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [projectToDelete, setProjectToDelete] = useState(null);

  const hasRealProjects = projects.some(p => (projectRooms[p.id] || []).length > 0);

  const handleCreateProject = () => {
    if (isDemoExpired()) {
      addToast('Демо-режим истек. Купите тариф для создания проектов.', 'error');
      return;
    }
    const name = prompt('Введите название нового проекта:', 'Новый проект');
    if (name) {
      addProject(name);
      navigate('/project');
    }
  };

  const handleOpenProject = (id) => {
    setActiveProject(id);
    navigate('/project');
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    if (isDemoExpired()) {
      addToast('Демо-режим истек. Купите тариф для редактирования.', 'error');
      return;
    }
    if (projects.length === 1) {
      addToast('Нельзя удалить единственный проект', 'error');
      return;
    }
    setProjectToDelete(project);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    if (d > now) return now.toLocaleDateString('ru-RU');
    return d.toLocaleDateString('ru-RU');
  };

  if (!hasRealProjects) {
    return (
      <div className="flex-1 overflow-y-auto animate-fade-in bg-gradient-to-b from-gray-50 to-white dark:from-[#0f172a] dark:to-[#1e293b]">
        
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-6">
            <Sparkles size={16} /> Личный кабинет Мастера
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Планируйте ремонт <br />
            <span className="text-primary">как профессионал</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Создавайте 3D-планы, точно рассчитывайте материалы и формируйте сметы в PDF. 
            Всё в одном месте, без сложных настроек.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={handleCreateProject}
              disabled={isDemoExpired()}
              className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition ${
                isDemoExpired() 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
              }`}
            >
              <Plus size={20} /> Создать первый проект
            </button>
            <button 
              onClick={() => navigate('/calc/finishing')}
              className="px-8 py-4 bg-white dark:bg-[#1e293b] text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Calculator size={20} /> Попробовать калькуляторы
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-left">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <Box size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3D-Планировщик</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Рисуйте комнаты, добавляйте окна и двери. Поддерживается мультиэтажность и 2D-режим.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-left">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
                <Calculator size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Точные расчеты</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                5 калькуляторов отделки, электрика, лестницы. Карты подрезки плитки с точностью до мм.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-left">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Сметы в PDF</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Формируйте бюджет, привязывайте клиентов и скачивайте готовые документы для заказчика.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 dark:bg-black rounded-3xl p-8 md:p-12 text-left text-white shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Всё, что нужно для ремонта</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-green-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">Мультипроектность</h4>
                  <p className="text-gray-400 text-sm">Ведите неограниченное количество объектов.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-green-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">База клиентов (CRM)</h4>
                  <p className="text-gray-400 text-sm">Храните контакты заказчиков и привязывайте к сметам.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-green-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">Справочники цен</h4>
                  <p className="text-gray-400 text-sm">Импортируйте прайсы из PDF или задавайте цены вручную.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-green-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold mb-1">Темная тема</h4>
                  <p className="text-gray-400 text-sm">Работайте комфортно в любое время суток.</p>
                </div>
              </div>
            </div>
            <div className="mt-10 text-center">
              <button 
                onClick={handleCreateProject}
                disabled={isDemoExpired()}
                className={`px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition ${
                  isDemoExpired() 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                Начать бесплатно <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Личный кабинет Мастера</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            У вас {projects.length} {projects.length === 1 ? 'проект' : 'проектов'}. Продолжайте планирование или создайте новый.
          </p>
        </div>
        <button 
          onClick={handleCreateProject}
          disabled={isDemoExpired()}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold transition shadow-md ${
            isDemoExpired() 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-blue-700'
          }`}
        >
          <Plus size={20} /> Новый проект
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div onClick={() => navigate('/project')} className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition cursor-pointer group">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <HomeIcon size={28} />
          </div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">3D Планировщик</h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Создавайте планировки и визуализируйте ремонт.</p>
          <div className="flex items-center text-primary text-base font-medium">
            Открыть проект <ArrowRight size={18} className="ml-1" />
          </div>
        </div>

        <div onClick={() => navigate('/calc/finishing')} className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition cursor-pointer group">
          <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Calculator size={28} />
          </div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Инженерные калькуляторы</h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Точный расчет электрики, отделки и материалов.</p>
          <div className="flex items-center text-green-600 text-base font-medium">
            Перейти к расчетам <ArrowRight size={18} className="ml-1" />
          </div>
        </div>

        <div onClick={() => navigate('/estimate')} className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition cursor-pointer group">
          <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <FileText size={28} />
          </div>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Смета проекта</h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-4">Формируйте бюджет и рассчитывайте стоимость работ.</p>
          <div className="flex items-center text-purple-600 text-base font-medium">
            Открыть смету <ArrowRight size={18} className="ml-1" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#0f172a]/50">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><Clock size={20} /> Мои проекты</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {projects.map(p => {
            const rooms = projectRooms[p.id] || [];
            const roomsCount = rooms.length;
            
            let totalArea = 0;
            rooms.forEach(room => {
              totalArea += (room.length * room.width);
            });

            return (
              <div 
                key={p.id}
                onClick={() => handleOpenProject(p.id)}
                className={`relative p-4 rounded-xl border transition cursor-pointer group ${
                  p.id === activeProjectId ? 'border-primary bg-blue-50/30 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${p.id === activeProjectId ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Folder size={22} />
                  </div>
                  <button 
                    onClick={(e) => handleDeleteClick(e, p)}
                    className="text-gray-400 hover:text-red-500 transition p-1"
                    title="Удалить проект"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 truncate pr-8">{p.name}</h3>
                
                <div className="flex flex-col gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Layers size={16} className="text-gray-400"/> 
                    {roomsCount > 0 ? `Комнат: ${roomsCount}` : 'Пустой проект'}
                  </span>
                  {totalArea > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Ruler size={16} className="text-gray-400"/> 
                      Площадь: {totalArea.toFixed(1)} м²
                    </span>
                  )}
                  <span className="mt-1 opacity-80">Создан: {formatDate(p.createdAt)}</span>
                </div>

                {p.id === activeProjectId && (
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[11px] font-bold text-primary bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={14}/> Активный
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="text-white mb-4 md:mb-0">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Crown className="text-yellow-500" size={28} /> Откройте все возможности с PRO
          </h3>
          <p className="text-gray-300 text-base">Неограниченные проекты, экспорт в PDF без водяных знаков, облачная синхронизация.</p>
        </div>
        <button 
          onClick={() => navigate('/pricing')}
          className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 transition whitespace-nowrap shadow-md text-base"
        >
          Перейти на PRO
        </button>
      </div>

      <ConfirmModal 
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => {
          if (projectToDelete) removeProject(projectToDelete.id);
        }}
        title="Удалить проект?"
        message={`Вы уверены, что хотите удалить проект "${projectToDelete?.name}"? Все данные о комнатах и сметы внутри него будут потеряны.`}
      />
    </div>
  );
}