import { useState } from 'react';
import { HardHat, Ruler, Folder } from 'lucide-react';
import StairCalc from './calculators/StairCalc';
import { useProjectsStore } from '../storeProjects';

export default function ConstructionCalc() {
  const { projects, activeProjectId } = useProjectsStore();
  const activeProject = projects.find(p => p.id === activeProjectId);
  
  // Пока у нас одна вкладка, но в будущем сюда можно добавить "Арки", "Ниши" и т.д.
  const [activeTab, setActiveTab] = useState('stair');

  return (
    <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-[#334155] flex flex-col p-6 overflow-hidden animate-fade-in">
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <HardHat className="text-primary" /> 
          Строительные конструкции
        </h2>
        {activeProject && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
            <Folder size={14} /> В смету проекта: <span className="font-bold text-gray-700 dark:text-gray-300">{activeProject.name}</span>
          </p>
        )}
      </div>

      {/* Под-табы (пока только один) */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('stair')} 
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            activeTab === 'stair' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 dark:bg-[#0f172a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Ruler size={14} />
          Калькулятор лестницы
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'stair' && <StairCalc />}
      </div>
    </div>
  );
}