import { useState } from 'react';
import { Plus, Trash2, Check, Layers, ArrowRight, Maximize2, Minimize2, RotateCcw, Eye } from 'lucide-react';
import { useHouseStore, useRooms } from '../store';
import { useProjectsStore } from '../storeProjects';
import { useToastStore } from '../storeToast';

const NumericInput = ({ value, onChange, className, min = 0.1, disabled = false }) => {
  const [localValue, setLocalValue] = useState(value ? String(value) : '');

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(localValue);
    if (isNaN(num) || num < min) {
      setLocalValue(value ? String(value) : String(min));
      onChange(value || min);
    } else {
      onChange(num);
    }
  };

  const handleFocus = (e) => {
    if (e.target.value === '0' || e.target.value === '0.0') {
      setLocalValue('');
    }
    e.target.select();
  };

  return (
    <input
      type="number"
      step="0.1"
      min={min}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled}
      className={className}
    />
  );
};

export default function PropertiesPanel({ onClose }) {
  const rooms = useRooms();
  
  const {
    selectedWall, setSelectedWall,
    addFirstRoom, updateRoom, removeRoom, getCalculatedAreas,
    addOpening, updateOpening, removeOpening,
    isolateRoomId, setIsolateRoomId,
    deleteWall, restoreWall, restoreAllWalls,
    selectedRoomId, setSelectedRoomId
  } = useHouseStore();

  const { projects, activeProjectId, updateProjectName } = useProjectsStore();
  const { addToast } = useToastStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId);

  const areas = getCalculatedAreas();
  
  const activeRoom = selectedWall ? rooms.find(r => r.id === selectedWall.roomId) : null;
  const wallOpenings = activeRoom && activeRoom.openings 
    ? activeRoom.openings.filter(o => o.wall === selectedWall.side) 
    : [];

  const isWallDeleted = activeRoom?.deletedWalls?.includes(selectedWall?.side);
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const handleAddRoom = () => {
    addFirstRoom({ name: `Комната ${rooms.length + 1}`, length: 4, width: 3, height: 2.7 });
  };

  const handleSave = () => {
    if (activeProject.name === 'Новый проект' || activeProject.name === 'Новый проект по умолчанию') {
      setIsEditingName(true);
      setProjectName('');
    } else {
      addToast('Все изменения проекта сохранены', 'success');
    }
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      updateProjectName(activeProjectId, projectName.trim());
      setIsEditingName(false);
      addToast('Проект переименован и сохранен', 'success');
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-[#1e293b] flex flex-col overflow-hidden">
      <div className="p-4 md:p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#1e293b] shrink-0">
        <span className="font-bold text-lg text-gray-900 dark:text-white">Свойства</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {selectedWall && activeRoom ? (
          <div className="space-y-4">
            <button onClick={() => setSelectedWall(null)} className="text-sm text-primary flex items-center gap-1 hover:underline mb-2">
              <ArrowRight size={14} className="rotate-180" /> Вернуться к габаритам
            </button>

            {/* 👇 ИЗМЕНЕННЫЙ СИНИЙ БЛОК */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 text-lg mb-2">
                Стена: {selectedWall.side === 'top' ? 'Задняя' : selectedWall.side === 'bottom' ? 'Передняя' : selectedWall.side === 'left' ? 'Левая' : 'Правая'}
              </h4>
              
              <div className="flex flex-col gap-3">
                <p className="text-sm text-blue-700 dark:text-blue-400 truncate">
                  Комната: <span className="font-bold">{activeRoom.name}</span>
                </p>
                
                <button 
                  onClick={() => setIsolateRoomId(isolateRoomId === activeRoom.id ? null : activeRoom.id)} 
                  className={`flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg transition font-medium w-full ${
                    isolateRoomId === activeRoom.id 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-white dark:bg-[#0f172a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
                  }`}
                >
                  {isolateRoomId === activeRoom.id ? <Minimize2 size={16} /> : <Eye size={16} />}
                  {isolateRoomId === activeRoom.id ? 'Показать весь дом' : 'Показать только эту комнату'}
                </button>
              </div>
            </div>

            {isWallDeleted ? (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-3 font-medium">Эта стена удалена.</p>
                <button onClick={() => restoreWall(activeRoom.id, selectedWall.side)} className="w-full py-2.5 bg-white dark:bg-[#0f172a] border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 rounded-md text-sm font-bold hover:bg-yellow-100 transition flex items-center justify-center gap-2">
                  <RotateCcw size={16}/> Восстановить стену
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-gray-800 dark:text-white">Проемы на стене</span>
                  <button onClick={() => addOpening(activeRoom.id, selectedWall.side)} className="text-xs text-white bg-primary px-3 py-1.5 rounded font-medium flex items-center gap-1 hover:bg-blue-700 transition shadow-sm">
                    <Plus size={14} /> Добавить
                  </button>
                </div>
                
                <div className="space-y-3">
                  {wallOpenings.map(op => (
                    <div key={op.id} className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-sm relative">
                      <button onClick={() => removeOpening(activeRoom.id, op.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Тип проема</label>
                        <select value={op.type} onChange={(e) => { const type = e.target.value; updateOpening(activeRoom.id, op.id, { type, sill: type === 'door' ? 0 : 0.8, height: type === 'door' ? 2.1 : 1.5 }); }} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium focus:border-primary outline-none bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white">
                          <option value="window">Окно</option>
                          <option value="door">Дверь</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Отступ (м)</label>
                          <NumericInput value={op.offset} onChange={(num) => updateOpening(activeRoom.id, op.id, { offset: num })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ширина (м)</label>
                          <NumericInput value={op.width} onChange={(num) => updateOpening(activeRoom.id, op.id, { width: num })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Высота (м)</label>
                          <NumericInput value={op.height} onChange={(num) => updateOpening(activeRoom.id, op.id, { height: num })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">От пола (м)</label>
                          <NumericInput value={op.sill} onChange={(num) => updateOpening(activeRoom.id, op.id, { sill: num })} className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white ${op.type === 'door' ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={op.type === 'door'} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {wallOpenings.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 dark:bg-[#0f172a] rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                      На этой стене пока нет окон или дверей.
                    </div>
                  )}
                </div>

                <button onClick={() => deleteWall(activeRoom.id, selectedWall.side)} className="w-full mt-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md text-sm font-bold hover:bg-red-100 transition">
                  Удалить эту стену
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 text-base mb-3 flex items-center gap-2">
                <Layers size={18} /> Итого по проекту
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-blue-700 dark:text-blue-400 text-xs font-medium block mb-1">Площадь пола:</span><span className="font-bold text-lg text-gray-900 dark:text-white">{areas.floorArea.toFixed(1)} м²</span></div>
                <div><span className="text-blue-700 dark:text-blue-400 text-xs font-medium block mb-1">Площадь стен:</span><span className="font-bold text-lg text-gray-900 dark:text-white">{areas.wallsArea.toFixed(1)} м²</span></div>
                <div><span className="text-blue-700 dark:text-blue-400 text-xs font-medium block mb-1">Периметр:</span><span className="font-bold text-base text-gray-900 dark:text-white">{areas.perimeter.toFixed(1)} м</span></div>
                <div><span className="text-blue-700 dark:text-blue-400 text-xs font-medium block mb-1">Вычтено (проемы):</span><span className="font-bold text-base text-gray-900 dark:text-white">{areas.openingsArea.toFixed(1)} м²</span></div>
              </div>
            </div>

            {selectedRoom ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-[#0f172a]/50">
                <h4 className="font-bold text-gray-800 dark:text-white mb-3">Свойства выбранной</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Название</label>
                    <input type="text" value={selectedRoom.name} onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })} className="w-full p-2 border rounded-md text-sm bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Длина (м)</label>
                      <NumericInput value={selectedRoom.length} onChange={(num) => updateRoom(selectedRoom.id, { length: num })} className="w-full p-2 border rounded-md text-sm bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ширина (м)</label>
                      <NumericInput value={selectedRoom.width} onChange={(num) => updateRoom(selectedRoom.id, { width: num })} className="w-full p-2 border rounded-md text-sm bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Высота стен (м)</label>
                    <NumericInput value={selectedRoom.height} onChange={(num) => updateRoom(selectedRoom.id, { height: num })} className="w-full p-2 border rounded-md text-sm bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                  </div>

                  <button
                    onClick={() => restoreAllWalls(selectedRoom.id)}
                    className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md text-xs font-bold hover:bg-blue-100 transition"
                  >
                    Вернуть все стены
                  </button>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={() => removeRoom(selectedRoom.id)} className="w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-100 transition">
                      Удалить комнату
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                Кликните по комнате на плане.
              </div>
            )}

            <div className="mt-6">
              <h4 className="font-bold text-gray-800 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">Все комнаты ({rooms.length})</h4>
              
              <div className="space-y-2">
                {rooms.map(room => {
                  const groupRooms = rooms.filter(r => r.groupId === room.groupId);
                  const isGrouped = groupRooms.length > 1;
                  
                  if (isGrouped && groupRooms[0].id !== room.id) return null;

                  return (
                    <div 
                      key={room.id} 
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`cursor-pointer border rounded-lg p-3 transition-colors ${selectedRoomId === room.id ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0f172a] hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 dark:text-white text-sm">{room.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {isGrouped && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Группа из {groupRooms.length} частей
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button onClick={handleAddRoom} className="w-full py-3 mt-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition flex items-center justify-center gap-2 text-sm font-medium">
                <Plus size={20} /> Добавить комнату
              </button>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] shrink-0">
        {isolateRoomId && (
          <button onClick={() => setIsolateRoomId(null)} className="w-full mb-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <Minimize2 size={18} /> Показать весь дом
          </button>
        )}

        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex gap-2">
            <input 
              type="text" 
              autoFocus
              placeholder="Название проекта..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:border-primary bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white"
            />
            <button type="submit" className="bg-primary text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700">
              OK
            </button>
          </form>
        ) : (
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-primary text-white rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-blue-700 transition shadow-md"
          >
            <Check size={20} /> Сохранить проект
          </button>
        )}
      </div>
    </div>
  );
}