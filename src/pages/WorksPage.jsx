import { useState } from 'react';
import { Hammer, Save, Plus, Trash2 } from 'lucide-react';
import { useWorksStore } from '../storeWorks';
import { useToastStore } from '../storeToast';

export default function WorksPage() {
  const { works, updateWork, addWork, removeWork } = useWorksStore();
  const { addToast } = useToastStore();

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('₽/м²');

  const handleAddWork = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) {
      addToast('Заполните название и цену', 'error');
      return;
    }
    addWork(newName.trim(), newPrice, newUnit);
    setNewName('');
    setNewPrice('');
    addToast('Работа добавлена', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in">
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Hammer className="text-primary" size={36} /> Стоимость работ
          </h1>
        </div>

        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Save size={24} className="text-primary" /> Ваши работы
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
            Укажите вашу стоимость работ. Эти цены будут автоматически подставляться в смету из калькуляторов.
          </p>

          {/* Форма добавления новой работы */}
          <form onSubmit={handleAddWork} className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Название работы</label>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm" 
                placeholder="Например: Шпаклевка потолка" 
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Цена</label>
              <input 
                type="number" 
                value={newPrice} 
                onChange={(e) => setNewPrice(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm" 
                placeholder="500" 
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Ед. изм.</label>
              <select 
                value={newUnit} 
                onChange={(e) => setNewUnit(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary outline-none bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white text-sm cursor-pointer"
              >
                <option value="₽/м²">₽/м²</option>
                <option value="₽/м.п.">₽/м.п.</option>
                <option value="₽/шт">₽/шт</option>
                <option value="₽/точка">₽/точка</option>
                <option value="₽/компл.">₽/компл.</option>
              </select>
            </div>
            <button type="submit" className="h-[42px] px-6 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 text-sm shrink-0">
              <Plus size={16} /> Добавить
            </button>
          </form>

          {/* Сетка работ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {works.map((work) => (
              <div 
                key={work.id} 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition group"
              >
                <span className="text-base font-semibold text-gray-800 dark:text-white truncate pr-4">
                  {work.name}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={work.price} 
                      onChange={(e) => updateWork(work.id, Number(e.target.value))} 
                      className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-right text-base font-medium focus:border-primary outline-none bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white" 
                    />
                    <span className="text-xs text-gray-500 w-16">{work.unit}</span>
                  </div>
                  <button 
                    onClick={() => removeWork(work.id)} 
                    className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1"
                    title="Удалить работу"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {works.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              У вас пока нет добавленных работ. Создайте первую!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}