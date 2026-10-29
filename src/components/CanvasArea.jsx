import { useState } from 'react';
import { Info, Trash2, Plus, PanelRight, Undo2, Redo2, Layers, Home, Ruler } from 'lucide-react';
import Plan2D from './Plan2D';
import { useHouseStore, useRooms, useFloors, useActiveFloorRooms } from '../store';
import { useUserStore } from '../storeUser';
import { useToastStore } from '../storeToast';

export default function CanvasArea({ onShowProperties }) {
  const allRooms = useRooms();
  const activeRooms = useActiveFloorRooms();
  const floors = useFloors();
  const { isDemoExpired } = useUserStore();
  const { addToast } = useToastStore();
  
  const {
    removeRoom, 
    selectedRoomId, setSelectedRoomId,
    addRoomAtPosition, addFirstRoom,
    undo, redo, past, future,
    activeFloorId, setActiveFloorId,
    addFloor, removeFloor
  } = useHouseStore();

  const handleCreateRoom = () => {
    if (isDemoExpired()) {
      addToast('Демо-режим истек. Купите тариф для редактирования.', 'error');
      return;
    }
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
    if (isDemoExpired()) {
      addToast('Демо-режим истек. Купите тариф для редактирования.', 'error');
      return;
    }
    const name = prompt('Введите название этажа:', `${floors.length + 1} Этаж`);
    if (name) {
      addFloor();
    }
  };

  return (
    <div className="relative flex-1 bg-white dark:bg-[#1e293b] rounded-xl border border-gray-200 dark:border-[#334155] flex flex-col p-2 md:p-4 overflow-hidden animate-fade-in">
      
      {/* Верхний ряд */}
      <div className="flex justify-between items-center gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 dark:bg-[#0f172a] px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-bold text-primary">
            <Ruler size={16} /> 2D Режим
          </div>
          
          <div className="flex gap-1 bg-gray-100 dark:bg-[#0f172a] p-1 rounded-lg">
            <button onClick={undo} disabled={past.length === 0 || isDemoExpired()} className={`p-2 rounded-md transition ${past.length === 0 || isDemoExpired() ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
              <Undo2 size={16} />
            </button>
            <button onClick={redo} disabled={future.length === 0 || isDemoExpired()} className={`p-2 rounded-md transition ${future.length === 0 || isDemoExpired() ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
              <Redo2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button 
            onClick={handleCreateRoom} 
            disabled={isDemoExpired() || activeFloorId === 'all'} 
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition shadow-sm shrink-0 ${
              isDemoExpired() || activeFloorId === 'all' 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-blue-700'
            }`}
          >
            <Home size={16} /> Комната
          </button>

          <button onClick={onShowProperties} className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#334155] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm shrink-0">
            <PanelRight size={16} /> Свойства
          </button>
        </div>
      </div>

      {/* Нижний ряд: Этажи */}
      <div className="flex items-center gap-2 w-full overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#0f172a] p-1 rounded-lg shrink-0">
          <Layers size={16} className="text-gray-500 ml-1.5" />
          <select 
            value={activeFloorId} 
            onChange={(e) => setActiveFloorId(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none cursor-pointer py-1 pr-1 max-w-[100px] text-gray-700 dark:text-gray-300"
            disabled={isDemoExpired()}
          >
            {floors.map((f, i) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
            <option value="all">Весь дом</option>
          </select>
          {activeFloorId !== 'all' && floors.length > 1 && (
            <button onClick={() => {
              if (window.confirm('Удалить этот этаж и все комнаты на нем?')) removeFloor(activeFloorId);
            }} className="text-red-400 hover:text-red-600 p-1" disabled={isDemoExpired()}>
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <button onClick={handleAddFloor} disabled={isDemoExpired()} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition shrink-0 ${isDemoExpired() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-100 dark:bg-[#0f172a] text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}>
          <Plus size={16} /> Этаж
        </button>
      </div>

      {/* Сама сцена - только 2D */}
      <div className="flex-1 flex gap-4 overflow-hidden relative mt-2">
        <div className="flex-1 relative rounded-lg overflow-hidden bg-[#e8eaed] dark:bg-[#0f172a] border border-gray-300 dark:border-gray-700">
          <Plan2D />
        </div>
      </div>

      <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2 flex-shrink-0">
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
                <button onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }} className="text-gray-400 hover:text-red-500" disabled={isDemoExpired()}>
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