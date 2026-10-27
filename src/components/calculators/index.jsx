import { useState, useEffect } from 'react';
import { Zap, PaintRoller, Calculator as CalcIcon, Folder } from 'lucide-react';
import ElectricCalc from './ElectricCalc';
import PlasterCalc from './PlasterCalc';
import TileCalc from './TileCalc';
import WallpaperCalc from './WallpaperCalc';
import LaminateCalc from './LaminateCalc';
import PuttyCalc from './PuttyCalc';
import { useProjectsStore } from '../../storeProjects';

export default function Calculators({ initialGroup = 'electric', isStandalone = false }) {
  const [mainGroup, setMainGroup] = useState(initialGroup);
  const [activeSubTab, setActiveSubTab] = useState('plaster');

  const { projects, activeProjectId } = useProjectsStore();
  const activeProject = projects.find(p => p.id === activeProjectId);

  useEffect(() => {
    setMainGroup(initialGroup);
  }, [initialGroup]);

  return (
    <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-[#334155] flex flex-col p-6 overflow-hidden animate-fade-in">
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <CalcIcon className="text-primary" /> 
          {mainGroup === 'electric' ? 'Калькулятор электрики' : 'Калькулятор отделки'}
        </h2>
        {activeProject && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
            <Folder size={14} /> В смету проекта: <span className="font-bold text-gray-700 dark:text-gray-300">{activeProject.name}</span>
          </p>
        )}
      </div>

      {!isStandalone && (
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <button 
            onClick={() => setMainGroup('electric')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${mainGroup === 'electric' ? 'bg-blue-50 dark:bg-blue-900/30 text-primary border border-primary/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Zap size={20} /> Электрика
          </button>
          <button 
            onClick={() => setMainGroup('finishing')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${mainGroup === 'finishing' ? 'bg-blue-50 dark:bg-blue-900/30 text-primary border border-primary/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <PaintRoller size={20} /> Отделка
          </button>
        </div>
      )}

      {mainGroup === 'electric' && (
        <div className="flex-1 overflow-y-auto">
          <ElectricCalc />
        </div>
      )}

      {mainGroup === 'finishing' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
            <SubTab text="Штукатурка" id="plaster" activeId={activeSubTab} onClick={setActiveSubTab} />
            <SubTab text="Плитка" id="tile" activeId={activeSubTab} onClick={setActiveSubTab} />
            <SubTab text="Обои" id="wallpaper" activeId={activeSubTab} onClick={setActiveSubTab} />
            <SubTab text="Ламинат" id="laminate" activeId={activeSubTab} onClick={setActiveSubTab} />
            <SubTab text="Шпаклевка" id="putty" activeId={activeSubTab} onClick={setActiveSubTab} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeSubTab === 'plaster' && <PlasterCalc />}
            {activeSubTab === 'tile' && <TileCalc />}
            {activeSubTab === 'wallpaper' && <WallpaperCalc />}
            {activeSubTab === 'laminate' && <LaminateCalc />}
            {activeSubTab === 'putty' && <PuttyCalc />}
          </div>
        </div>
      )}
    </div>
  );
}

function SubTab({ text, id, activeId, onClick }) {
  return (
    <button 
      onClick={() => onClick(id)} 
      className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeId === id ? 'bg-primary text-white shadow-md' : 'bg-gray-100 dark:bg-[#0f172a] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
    >
      {text}
    </button>
  );
}