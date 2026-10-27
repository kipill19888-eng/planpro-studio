import { useState, useRef, useEffect, useCallback } from 'react';
import { useHouseStore, useActiveFloorRooms } from '../store';

// Компонент числового инпута, который не ломается при стирании
const NumericInput = ({ value, onChange, className, min = 0.1 }) => {
  const [localValue, setLocalValue] = useState(value ? String(value) : '');

  useEffect(() => {
    setLocalValue(value ? String(value) : '');
  }, [value]);

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
    // Если при клике там "0", очищаем поле
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
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={className}
    />
  );
};

export default function Plan2D() {
  const rooms = useActiveFloorRooms();

  const {
    selectedRoomId,
    setSelectedRoomId,
    updateRoom,
    selectedWall,
    setSelectedWall,
  } = useHouseStore();

  const [draggingId, setDraggingId] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0, roomX: 0, roomZ: 0, isDragging: false });
  const containerRef = useRef(null);

  const [viewport, setViewport] = useState({ w: 800, h: 600 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setViewport({
          w: Math.max(clientWidth, 300),
          h: Math.max(clientHeight, 300),
        });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (rooms.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-[#1e293b] text-gray-400 text-sm p-6 text-center">
        <p>Нет комнат на этом этаже. Создайте комнату в панели сверху.</p>
      </div>
    );
  }

  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  rooms.forEach(room => {
    const halfL = room.length / 2;
    const halfW = room.width / 2;
    minX = Math.min(minX, room.posX - halfL);
    maxX = Math.max(maxX, room.posX + halfL);
    minZ = Math.min(minZ, room.posZ - halfW);
    maxZ = Math.max(maxZ, room.posZ + halfW);
  });

  minX -= 2; maxX += 2; minZ -= 2; maxZ += 2;

  const planWidth = maxX - minX;
  const planHeight = maxZ - minZ;

  const scale = Math.min(viewport.w / planWidth, viewport.h / planHeight, 100);
  const offsetX = (viewport.w / 2) - ((minX + maxX) / 2) * scale;
  const offsetZ = (viewport.h / 2) - ((minZ + maxZ) / 2) * scale;

  const applySnap = (currentRoom) => {
    let snappedX = currentRoom.posX;
    let snappedZ = currentRoom.posZ;
    const threshold = 0.5;

    rooms.forEach(otherRoom => {
      if (otherRoom.id === currentRoom.id) return;

      const distRightToLeft = Math.abs((currentRoom.posX + currentRoom.length / 2) - (otherRoom.posX - otherRoom.length / 2));
      const distLeftToRight = Math.abs((currentRoom.posX - currentRoom.length / 2) - (otherRoom.posX + otherRoom.length / 2));

      if (distRightToLeft < threshold) snappedX = otherRoom.posX - otherRoom.length / 2 - currentRoom.length / 2;
      else if (distLeftToRight < threshold) snappedX = otherRoom.posX + otherRoom.length / 2 + currentRoom.length / 2;

      const distBottomToTop = Math.abs((currentRoom.posZ + currentRoom.width / 2) - (otherRoom.posZ - otherRoom.width / 2));
      const distTopToBottom = Math.abs((currentRoom.posZ - currentRoom.width / 2) - (otherRoom.posZ + otherRoom.width / 2));

      if (distBottomToTop < threshold) snappedZ = otherRoom.posZ - otherRoom.width / 2 - currentRoom.width / 2;
      else if (distTopToBottom < threshold) snappedZ = otherRoom.posZ + otherRoom.width / 2 + currentRoom.width / 2;
    });

    return { x: snappedX, z: snappedZ };
  };

  const handlePointerDown = (e, room) => {
    if (e.target.tagName === 'INPUT') return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);

    setSelectedRoomId(room.id);
    setSelectedWall(null);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      roomX: room.posX,
      roomZ: room.posZ,
      isDragging: false,
    };
    setDraggingId(room.id);
  };

  const handlePointerMove = useCallback((e) => {
    if (!draggingId) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (!dragStartRef.current.isDragging) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        dragStartRef.current.isDragging = true;
      } else {
        return;
      }
    }

    updateRoom(draggingId, {
      posX: dragStartRef.current.roomX + dx / scale,
      posZ: dragStartRef.current.roomZ + dy / scale,
    });
  }, [draggingId, scale, updateRoom]);

  const handlePointerUp = useCallback((e) => {
    if (draggingId && dragStartRef.current.isDragging) {
      const currentRoom = rooms.find(r => r.id === draggingId);
      if (currentRoom) {
        const snapped = applySnap(currentRoom);
        updateRoom(draggingId, { posX: snapped.x, posZ: snapped.z });
      }
    }
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDraggingId(null);
    dragStartRef.current.isDragging = false;
  }, [draggingId, rooms, updateRoom]);

  const handleWallPointerDown = (e, roomId, side) => {
    e.stopPropagation();
    if (dragStartRef.current.isDragging) return;
    setSelectedRoomId(roomId);
    setSelectedWall({ roomId, side });
  };

  const renderOpenings = (room) => {
    const elements = [];
    const deletedWalls = room.deletedWalls || [];

    (room.openings || []).forEach(op => {
      if (deletedWalls.includes(op.wall)) return;

      const { wall, offset, width, type } = op;
      const x = (room.posX - room.length / 2) * scale + offsetX;
      const z = (room.posZ - room.width / 2) * scale + offsetZ;
      const w = room.length * scale;
      const h = room.width * scale;

      const pos = offset * scale;
      const size = width * scale;

      let rectX = 0, rectY = 0, rectW = 0, rectH = 0;
      if (wall === 'top') { rectX = x + pos; rectY = z - 6; rectW = size; rectH = 12; }
      else if (wall === 'bottom') { rectX = x + pos; rectY = z + h - 6; rectW = size; rectH = 12; }
      else if (wall === 'left') { rectX = x - 6; rectY = z + pos; rectW = 12; rectH = size; }
      else if (wall === 'right') { rectX = x + w - 6; rectY = z + pos; rectW = 12; rectH = size; }

      const color = type === 'window' ? '#3b82f6' : '#a16207';
      const fillColor = type === 'window' ? '#dbeafe' : '#fef3c7';

      elements.push(
        <g key={op.id}>
          <rect x={rectX} y={rectY} width={rectW} height={rectH} fill={fillColor} stroke={color} strokeWidth="2" className="pointer-events-none" />
          {type === 'window' ? (
            <line x1={rectX + rectW / 2} y1={rectY} x2={rectX + rectW / 2} y2={rectY + rectH} stroke={color} strokeWidth="1" className="pointer-events-none" />
          ) : (
            <line x1={rectX} y1={rectY + rectH / 2} x2={rectX + rectW} y2={rectY + rectH / 2} stroke={color} strokeWidth="1" strokeDasharray="2,2" className="pointer-events-none" />
          )}
        </g>
      );
    });

    return elements;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-white dark:bg-[#1e293b] flex items-center justify-center p-2 md:p-4 select-none relative touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <svg
        width={viewport.w}
        height={viewport.h}
        className="bg-white dark:bg-[#1e293b] rounded-lg"
        viewBox={`0 0 ${viewport.w} ${viewport.h}`}
        style={{ touchAction: 'none' }}
      >
        <defs>
          <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
            <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width={viewport.w} height={viewport.h} fill="url(#grid)" />

        {rooms.map(room => {
          const x = (room.posX - room.length / 2) * scale + offsetX;
          const z = (room.posZ - room.width / 2) * scale + offsetZ;
          const w = room.length * scale;
          const h = room.width * scale;

          const isSelected = room.id === selectedRoomId;
          const deletedWalls = room.deletedWalls || [];

          const groupRooms = rooms.filter(r => r.groupId === room.groupId);
          const isFirstInGroup = groupRooms.length <= 1 || groupRooms[0].id === room.id;
          const groupArea = groupRooms.reduce((sum, r) => sum + (r.length * r.width), 0);

          const isWallSelected = (side) => selectedWall && selectedWall.roomId === room.id && selectedWall.side === side;

          const hasNeighbor = (side) => {
            if (room.showAllWalls) return false;

            return rooms.some(other => {
              if (other.id === room.id) return false;
              if (room.id < other.id) return false;

              const tolerance = 0.1;
              if (side === 'top') {
                const myEdge = room.posZ - room.width / 2;
                const otherEdge = other.posZ + other.width / 2;
                return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(room.posX - other.posX) < (room.length + other.length) / 2 - tolerance;
              }
              if (side === 'bottom') {
                const myEdge = room.posZ + room.width / 2;
                const otherEdge = other.posZ - other.width / 2;
                return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(room.posX - other.posX) < (room.length + other.length) / 2 - tolerance;
              }
              if (side === 'left') {
                const myEdge = room.posX - room.length / 2;
                const otherEdge = other.posX + other.length / 2;
                return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(room.posZ - other.posZ) < (room.width + other.width) / 2 - tolerance;
              }
              if (side === 'right') {
                const myEdge = room.posX + room.length / 2;
                const otherEdge = other.posX - other.length / 2;
                return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(room.posZ - other.posZ) < (room.width + other.width) / 2 - tolerance;
              }
              return false;
            });
          };

          const getWallColor = (side) => {
            if (isWallSelected(side)) return '#ef4444';
            if (isSelected) return '#3b82f6';
            return '#475569';
          };

          const getWallStrokeWidth = (side) => isWallSelected(side) ? 8 : 4;

          return (
            <g key={room.id}>
              <rect
                x={x} y={z} width={w} height={h}
                fill={isSelected ? '#dbeafe' : '#f8fafc'}
                onPointerDown={(e) => handlePointerDown(e, room)}
                className={draggingId === room.id ? "cursor-grabbing" : "cursor-grab"}
                style={{ touchAction: 'none' }}
              />

              {!deletedWalls.includes('top') && (!hasNeighbor('top') || isWallSelected('top')) && (
                <line x1={x} y1={z} x2={x + w} y2={z} stroke={getWallColor('top')} strokeWidth={getWallStrokeWidth('top')} className="cursor-pointer transition-colors" onPointerDown={(e) => handleWallPointerDown(e, room.id, 'top')} />
              )}
              {!deletedWalls.includes('bottom') && (!hasNeighbor('bottom') || isWallSelected('bottom')) && (
                <line x1={x} y1={z + h} x2={x + w} y2={z + h} stroke={getWallColor('bottom')} strokeWidth={getWallStrokeWidth('bottom')} className="cursor-pointer transition-colors" onPointerDown={(e) => handleWallPointerDown(e, room.id, 'bottom')} />
              )}
              {!deletedWalls.includes('left') && (!hasNeighbor('left') || isWallSelected('left')) && (
                <line x1={x} y1={z} x2={x} y2={z + h} stroke={getWallColor('left')} strokeWidth={getWallStrokeWidth('left')} className="cursor-pointer transition-colors" onPointerDown={(e) => handleWallPointerDown(e, room.id, 'left')} />
              )}
              {!deletedWalls.includes('right') && (!hasNeighbor('right') || isWallSelected('right')) && (
                <line x1={x + w} y1={z} x2={x + w} y2={z + h} stroke={getWallColor('right')} strokeWidth={getWallStrokeWidth('right')} className="cursor-pointer transition-colors" onPointerDown={(e) => handleWallPointerDown(e, room.id, 'right')} />
              )}

              {renderOpenings(room)}

              {isFirstInGroup && !deletedWalls.includes('top') && (
                <foreignObject x={x + w / 2 - 35} y={z - 36} width="70" height="30">
                  <NumericInput
                    value={parseFloat(room.length.toFixed(2))}
                    onChange={(num) => updateRoom(room.id, { length: num })}
                    className="w-full h-full text-center text-sm font-bold bg-white border border-gray-300 rounded-md outline-none focus:border-primary"
                  />
                </foreignObject>
              )}
              {isFirstInGroup && !deletedWalls.includes('left') && (
                <foreignObject x={x - 60} y={z + h / 2 - 15} width="55" height="30">
                  <NumericInput
                    value={parseFloat(room.width.toFixed(2))}
                    onChange={(num) => updateRoom(room.id, { width: num })}
                    className="w-full h-full text-center text-sm font-bold bg-white border border-gray-300 rounded-md outline-none focus:border-primary"
                  />
                </foreignObject>
              )}

              {isFirstInGroup && (
                <>
                  <text x={x + w / 2} y={z + h / 2 - 10} textAnchor="middle" dominantBaseline="middle" fontSize={Math.min(w, h) * 0.15} fill={isSelected ? '#1e40af' : '#334155'} fontWeight="bold" className="pointer-events-none">
                    {room.name}
                  </text>
                  <text x={x + w / 2} y={z + h / 2 + Math.min(w, h) * 0.1} textAnchor="middle" dominantBaseline="middle" fontSize={Math.min(w, h) * 0.1} fill={isSelected ? '#2563eb' : '#64748b'} fontWeight="500" className="pointer-events-none">
                    {groupArea.toFixed(1)} м²
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}