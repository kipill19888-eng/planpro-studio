import { useState } from 'react';
import { Box, Ruler, Info, Trash2, Plus, PanelRight, Undo2, Redo2, Layers } from 'lucide-react';
import Scene3D from './Scene3D';
import Plan2D from './Plan2D';
import { useHouseStore, useRooms, useFloors, useActiveFloorRooms } from '../store';

export default function CanvasArea({ onShowProperties }) {
  const allRooms = useRooms();
  const activeRooms = useActiveFloorRooms();
  const floors = useFloors();
  
  const {
    removeRoom, updateRoom, 
    selectedRoomId, setSelectedRoomId,
    selectedWall, setSelectedWall,
    addRoomAtPosition, addFirstRoom,
    undo, redo, past, future,
    activeFloorId, setActiveFloorId,
    addFloor, removeFloor
  } = useHouseStore();

  const [viewMode, setViewMode] = useState('3d'); 

  const [newRoom, setNewRoom] = useState({
    name: 'Комната 1',
    length: 4,
    width: 3,
    height: 2.7,
  });

  const handleCreateRoom2D = () => {
    if (activeRooms.length === 0) {
      addFirstRoom({ name: 'Комната 1', length: 4, width: 3, height: 2.7 });
      return;
    }
    let maxX = -Infinity;
    activeRooms.forEach(r => {
      const rightEdge = r.posX + r.length / 2;
      if (rightEdge > maxX) maxX = rightEdge;
    });
    const newPosX = maxX + 2 + 2;
    const newPosZ = 0;
    addRoomAtPosition(newPosX, newPosZ, {
      name: `Комната ${allRooms.length + 1}`,
      length: 4,
      width: 3,
      height: 2.7
    });
  };

  const handleAddFloor = () => {
    const name = prompt('Введите название этажа:', `${floors.length + 1} Этаж`);
    if (name) {
      addFloor();
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-[#334155] flex flex-col p-2 md:p-4 overflow-hidden animate-fade-in">
      
      {/* Панель управления (адаптивная) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2 md:mb-4">
        
        {/* Левая часть: 2D/3D + Undo/Redo */}
        <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto">
          <div className="bg-gray-100 dark:bg-[#0f172a] p-1 rounded-lg flex gap-1">
            <button onClick={() => setViewMode('2d')} className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm flex items-center gap-1 md:gap-2 transition ${viewMode === '2d' ? 'bg-white dark:bg-[#334155] shadow text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50'}`}>
              <Ruler size={16} /> <span className="hidden md:inline">2D План</span>
            </button>
            <button onClick={() => setViewMode('3d')} className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm flex items-center gap-1 md:gap-2 transition ${viewMode === '3d' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50'}`}>
              <Box size={16} /> <span className="hidden md:inline">3D Модель</span>
            </button>
          </div>

          <div className="flex gap-1 bg-gray-100 dark:bg-[#0f172a] p-1 rounded-lg">
            <button onClick={undo} disabled={past.length === 0} className={`p-1.5 md:p-2 rounded-md transition ${past.length === 0 ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#334155]'}`}>
              <Undo2 size={16} />
            </button>
            <button onClick={redo} disabled={future.length === 0} className={`p-1.5 md:p-2 rounded-md transition ${future.length === 0 ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#334155]'}`}>
              <Redo2 size={16} />
            </button>
          </div>
        </div>

        {/* Правая часть: Этажи, Добавить, Свойства */}
        <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto overflow-x-auto pb-1">
          {/* Переключатель этажей */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#0f172a] p-1 rounded-lg mr-1">
            <Layers size={14} className="text-gray-500 ml-1" />
            <select 
              value={activeFloorId} 
              onChange={(e) => setActiveFloorId(e.target.value)}
              className="bg-transparent text-xs md:text-sm font-medium outline-none cursor-pointer py-1 pr-1 max-w-[100px] text-gray-700 dark:text-gray-300"
            >
              {floors.map((f, i) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
              <option value="all">Весь дом</option>
            </select>
            {activeFloorId !== 'all' && floors.length > 1 && (
              <button onClick={() => {
                if (window.confirm('Удалить этот этаж и все комнаты на нем?')) removeFloor(activeFloorId);
              }} className="text-red-400 hover:text-red-600 p-0.5">
                <Trash2 size={12} />
              </button>
            )}
          </div>

          <button onClick={handleAddFloor} className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 dark:bg-[#0f172a] text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-200 transition" title="Добавить этаж">
            <Plus size={14} /> <span className="hidden md:inline">Этаж</span>
          </button>

          {viewMode === '2d' && activeFloorId !== 'all' && (
            <button onClick={handleCreateRoom2D} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition shadow-sm">
              <Plus size={16} /> <span className="hidden md:inline">Комната</span>
            </button>
          )}

          <button onClick={onShowProperties} className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-white dark:bg-[#334155] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 transition shadow-sm">
            <PanelRight size={16} /> <span className="hidden md:inline">Свойства</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden relative">
        <div className="flex-1 relative rounded-lg overflow-hidden bg-[#e8eaed] dark:bg-[#0f172a] border border-gray-300 dark:border-gray-700">
          {viewMode === '3d' ? (
            <Scene3D
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              selectedWall={selectedWall}
              onSelectWall={setSelectedWall}
            />
          ) : (
            <Plan2D />
          )}
        </div>
      </div>

      <div className="mt-2 md:mt-4 border-t border-gray-200 dark:border-gray-700 pt-2 md:pt-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Info size={14} /> Комнаты ({activeRooms.length})
          </h4>
        </div>
        <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto">
          {activeRooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            return (
              <div key={room.id} onClick={() => setSelectedRoomId(room.id)} className={`cursor-pointer px-2 md:px-3 py-1 md:py-1.5 rounded-md border text-xs flex items-center gap-1 md:gap-2 ${isSelected ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-gray-50 dark:bg-[#0f172a] border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}>
                {room.name}
                <button onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}