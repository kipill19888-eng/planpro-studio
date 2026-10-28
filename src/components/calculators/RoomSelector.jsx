import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useHouseStore, useRooms } from '../../store';

export default function RoomSelector({ 
  selectedId, 
  onSelect, 
  surface = 'walls',
  showPerimeter = false 
}) {
  const rooms = useRooms();
  const { getRoomWallsArea } = useHouseStore();

  const [wallSide, setWallSide] = useState('all');

  const uniqueGroups = [];
  rooms.forEach(room => {
    const gId = room.groupId || `single-${room.id}`;
    if (!uniqueGroups.find(g => g.id === gId)) {
      uniqueGroups.push({ id: gId, name: room.name, room: room });
    }
  });

  const isAll = selectedId === 'all';
  const activeGroup = uniqueGroups.find(g => g.id === selectedId);
  
  const activeGroupRooms = !isAll 
    ? rooms.filter(r => (r.groupId || `single-${r.id}`) === selectedId)
    : [];

  const getWallArea = (room, side) => {
    if (!room) return 0;
    if (side === 'all') return getRoomWallsArea(room);
    if (side === 'top' || side === 'bottom') return room.length * room.height;
    if (side === 'left' || side === 'right') return room.width * room.height;
    return 0;
  };

  const totalFloorArea = activeGroupRooms.reduce((sum, r) => sum + (r.length * r.width), 0);
  const totalWallsArea = activeGroupRooms.reduce((sum, r) => sum + getRoomWallsArea(r), 0);
  const totalPerimeter = activeGroupRooms.reduce((sum, r) => sum + (2 * (r.length + r.width)), 0);

  useEffect(() => {
    if (!isAll && activeGroup) {
      const room = activeGroup.room;
      
      if (surface === 'walls') {
        const area = wallSide === 'all' 
          ? totalWallsArea.toFixed(1) 
          : getWallArea(room, wallSide).toFixed(1);
        onSelect(selectedId, area);
      } else if (surface === 'floor') {
        onSelect(selectedId, totalFloorArea.toFixed(1));
      } else {
        onSelect(selectedId, { floor: totalFloorArea.toFixed(1), walls: totalWallsArea.toFixed(1) });
      }
    }
  }, [selectedId, rooms, surface, wallSide]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
      <label className="block text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
        Выберите помещение для расчета:
      </label>
      <select 
        value={selectedId} 
        onChange={(e) => onSelect(e.target.value, null)}
        className="w-full p-3 border border-blue-300 dark:border-blue-700 rounded-lg text-base font-medium bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white focus:border-primary outline-none cursor-pointer"
      >
        <option value="all">Весь дом (Общая площадь)</option>
        {uniqueGroups.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      {!isAll && surface === 'walls' && (
        <div className="mt-3">
          <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">Какая стена?</label>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setWallSide('all')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${wallSide === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-[#0f172a] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-primary'}`}
            >
              Все стены
            </button>
            <button 
              onClick={() => setWallSide('top')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${wallSide === 'top' ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-[#0f172a] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-primary'}`}
            >
              Задняя
            </button>
            <button 
              onClick={() => setWallSide('bottom')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${wallSide === 'bottom' ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-[#0f172a] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-primary'}`}
            >
              Передняя
            </button>
            <button 
              onClick={() => setWallSide('left')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${wallSide === 'left' ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-[#0f172a] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-primary'}`}
            >
              Левая
            </button>
            <button 
              onClick={() => setWallSide('right')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${wallSide === 'right' ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-[#0f172a] text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-primary'}`}
            >
              Правая
            </button>
          </div>
        </div>
      )}

      {!isAll && activeGroup && (
        <div className="mt-4 bg-white dark:bg-[#0f172a] p-4 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
          <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Info size={16} className="text-blue-500"/> 
            Детализация: {activeGroup.name}
          </h4>
          
          <div className="space-y-1">
            {(surface === 'floor' || surface === 'both') && (
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-[#1e293b] rounded text-sm">
                <span className="text-gray-600 dark:text-gray-400">Площадь пола:</span>
                <span className="font-bold text-gray-800 dark:text-white">{totalFloorArea.toFixed(1)} м²</span>
              </div>
            )}

            {(surface === 'walls' || surface === 'both') && (
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-[#1e293b] rounded text-sm">
                <span className="text-gray-600 dark:text-gray-400">Площадь стен {wallSide !== 'all' ? `(${wallSide === 'top' ? 'задняя' : wallSide === 'bottom' ? 'передняя' : wallSide === 'left' ? 'левая' : 'правая'})` : ''}:</span>
                <span className="font-bold text-gray-800 dark:text-white">
                  {wallSide === 'all' 
                    ? totalWallsArea.toFixed(1) 
                    : getWallArea(activeGroup.room, wallSide).toFixed(1)
                  } м²
                </span>
              </div>
            )}

            {showPerimeter && (
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-[#1e293b] rounded text-sm">
                <span className="text-gray-600 dark:text-gray-400">Периметр стен:</span>
                <span className="font-bold text-gray-800 dark:text-white">{totalPerimeter.toFixed(1)} м</span>
              </div>
            )}
          </div>
          
          {activeGroupRooms.length > 1 && (
            <p className="text-xs text-blue-500 mt-2">
              * Помещение состоит из {activeGroupRooms.length} объединенных частей.
            </p>
          )}
        </div>
      )}
    </div>
  );
}