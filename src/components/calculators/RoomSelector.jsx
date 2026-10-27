import { useEffect } from 'react';
import { Info } from 'lucide-react';
import { useHouseStore, useRooms } from '../../store'; // <-- useRooms

export default function RoomSelector({ 
  selectedId, 
  onSelect, 
  surface = 'walls',
  showPerimeter = false 
}) {
  const rooms = useRooms(); // <-- Стабильный массив
  const { getRoomWallsArea } = useHouseStore();

  const uniqueGroups = [];
  rooms.forEach(room => {
    const gId = room.groupId || `single-${room.id}`;
    if (!uniqueGroups.find(g => g.id === gId)) {
      uniqueGroups.push({ id: gId, name: room.name });
    }
  });

  const isAll = selectedId === 'all';
  const activeGroup = uniqueGroups.find(g => g.id === selectedId);
  
  const activeGroupRooms = !isAll 
    ? rooms.filter(r => (r.groupId || `single-${r.id}`) === selectedId)
    : [];

  const totalFloorArea = activeGroupRooms.reduce((sum, r) => sum + (r.length * r.width), 0);
  const totalWallsArea = activeGroupRooms.reduce((sum, r) => sum + getRoomWallsArea(r), 0);
  const totalPerimeter = activeGroupRooms.reduce((sum, r) => sum + (2 * (r.length + r.width)), 0);

  useEffect(() => {
    if (!isAll && activeGroup) {
      if (surface === 'walls') onSelect(selectedId, totalWallsArea.toFixed(1));
      else if (surface === 'floor') onSelect(selectedId, totalFloorArea.toFixed(1));
      else onSelect(selectedId, { floor: totalFloorArea.toFixed(1), walls: totalWallsArea.toFixed(1) });
    }
  }, [selectedId, rooms, surface]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
      <label className="block text-sm font-bold text-blue-900 mb-2">
        Выберите помещение для расчета:
      </label>
      <select 
        value={selectedId} 
        onChange={(e) => onSelect(e.target.value, null)}
        className="w-full p-3 border border-blue-300 rounded-lg text-base font-medium bg-white focus:border-primary outline-none cursor-pointer"
      >
        <option value="all">Весь дом (Общая площадь)</option>
        {uniqueGroups.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      {!isAll && activeGroup && (
        <div className="mt-4 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Info size={16} className="text-blue-500"/> 
            Детализация: {activeGroup.name}
          </h4>
          
          <div className="space-y-1">
            {(surface === 'floor' || surface === 'both') && (
              <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                <span className="text-gray-600">Площадь пола:</span>
                <span className="font-bold text-gray-800">{totalFloorArea.toFixed(1)} м²</span>
              </div>
            )}

            {(surface === 'walls' || surface === 'both') && (
              <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                <span className="text-gray-600">Площадь стен:</span>
                <span className="font-bold text-gray-800">{totalWallsArea.toFixed(1)} м²</span>
              </div>
            )}

            {showPerimeter && (
              <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                <span className="text-gray-600">Периметр стен:</span>
                <span className="font-bold text-gray-800">{totalPerimeter.toFixed(1)} м</span>
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