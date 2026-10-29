import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useHouseStore, useActiveFloorRooms } from '../store';

export default function Plan2D() {
  const rooms = useActiveFloorRooms();

  const {
    selectedRoomId,
    setSelectedRoomId,
    updateRoom,
    selectedWall,
    setSelectedWall,
    deleteWall,
  } = useHouseStore();

  const [draggingId, setDraggingId] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0, roomX: 0, roomZ: 0, isDragging: false });
  const containerRef = useRef(null);

  const [viewport, setViewport] = useState({ w: 800, h: 600 });
  const [zoom, setZoom] = useState(1);

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => Math.min(Math.max(0.3, z + delta), 3));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
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

  const baseScale = Math.min(viewport.w / planWidth, viewport.h / planHeight, 100);
  const scale = baseScale * zoom;

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

  const handleWallDoubleClick = (e, roomId, side) => {
    e.stopPropagation();
    if (window.confirm('Удалить эту стену? (создать проход)')) {
      deleteWall(roomId, side);
    }
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
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-1">
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 transition" title="Приблизить"><ZoomIn size={18} /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.3))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 transition" title="Отдалить"><ZoomOut size={18} /></button>
        <button onClick={() => setZoom(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 transition border-t border-gray-200 dark:border-gray-700" title="Сбросить масштаб"><Maximize size={18} /></button>
      </div>

      <svg width={viewport.w} height={viewport.h} className="bg-white dark:bg-[#1e293b] rounded-lg" viewBox={`0 0 ${viewport.w} ${viewport.h}`} style={{ touchAction: 'none' }}>
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

          const getWallColor = (side) => {
            if (isWallSelected(side)) return '#ef4444';
            if (isSelected) return '#3b82f6';
            return '#475569';
          };

          const getWallStrokeWidth = (side) => isWallSelected(side) ? 8 : 4;

          // 👇 ПРОСТАЯ ЛОГИКА: рисуем размер для каждой стены
          const getWallLabelInfo = (side) => {
            const isTopBottom = side === 'top' || side === 'bottom';
            const myPos = isTopBottom ? room.posZ : room.posX;
            const myLength = isTopBottom ? room.length : room.width;

            // Ищем соседа строго на этой же линии
            const neighbor = groupRooms.find(other => {
              if (other.id === room.id) return false;
              if (other.deletedWalls?.includes(side)) return false;
              const otherPos = isTopBottom ? other.posZ : other.posX;
              return Math.abs(myPos - otherPos) < 0.1; 
            });

            // Если соседа нет — рисуем размер этой стены
            if (!neighbor) {
              return { 
                show: true, 
                length: myLength, 
                centerX: isTopBottom ? room.posX : myPos, 
                centerZ: isTopBottom ? myPos : room.posZ 
              };
            }

            // Если сосед есть — считаем общую сумму
            const otherLength = isTopBottom ? neighbor.length : neighbor.width;
            const otherPos = isTopBottom ? neighbor.posX : neighbor.posZ;

            const myStart = (isTopBottom ? room.posX : myPos) - myLength / 2;
            const myEnd = (isTopBottom ? room.posX : myPos) + myLength / 2;
            const otherStart = otherPos - otherLength / 2;
            const otherEnd = otherPos + otherLength / 2;

            const combinedStart = Math.min(myStart, otherStart);
            const combinedEnd = Math.max(myEnd, otherEnd);
            const combinedLength = combinedEnd - combinedStart;
            const combinedCenter = (combinedStart + combinedEnd) / 2;

            return { 
              show: isFirstInGroup, // Общий размер рисуем только у первой комнаты группы
              length: combinedLength, 
              centerX: isTopBottom ? combinedCenter : myPos, 
              centerZ: isTopBottom ? myPos : combinedCenter 
            };
          };

          const topInfo = getWallLabelInfo('top');
          const bottomInfo = getWallLabelInfo('bottom');
          const leftInfo = getWallLabelInfo('left');
          const rightInfo = getWallLabelInfo('right');

          return (
            <g key={room.id}>
              <rect
                x={x} y={z} width={w} height={h}
                fill={isSelected ? '#dbeafe' : '#f8fafc'}
                onPointerDown={(e) => handlePointerDown(e, room)}
                className={draggingId === room.id ? "cursor-grabbing" : "cursor-grab"}
                style={{ touchAction: 'none' }}
              />

              {/* ВЕРХНЯЯ СТЕНА */}
              {!deletedWalls.includes('top') && (
                <>
                  <line x1={x} y1={z} x2={x + w} y2={z} stroke={getWallColor('top')} strokeWidth={getWallStrokeWidth('top')} className="cursor-pointer transition-colors" onPointerDown={(e) => handleWallPointerDown(e, room.id, 'top')} onDoubleClick={(e) => handleWallDoubleClick(e, room.id, 'top')} />
                  {topInfo.show && (
                    <foreignObject x={(topInfo.centerX - room.posX) * scale + x + w/2 - 25} y={z - 34} width="50" height="24">
                      <div className="w-full h-full text-center text-[11px] leading-none font-bold bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center pointer-events-none shadow-sm">
                        {(topInfo.length * 100).toFixed(0)}
                      </div>
                    </foreignObject>
                  )}
                </>
              )}

              {/* НИЖНЯЯ СТЕНА */}
              {!deletedWalls.includes('bottom') && (
                <>
                  <line x1={x} y1={z + h} x2={x + w} y2={z + h} stroke={getWallColor('bottom')} strokeWidth={getWallStrokeWidth('bottom')} className="cursor-pointer transition-colors" onPointerDown={(e) => handleWallPointerDown(e, room.id, 'bottom')} onDoubleClick={(e) => handleWallDoubleClick(e, room.id, 'bottom')} />
                  {bottomInfo.show && (
                    <foreignObject x={(bottomInfo.centerX - room.posX) * scale + x + w/2 - 25} y={z + h + 10} width="50" height="24">
                      <div className="w-full h-full text-center text-[11px] leading-none font-bold bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center pointer-events-none shadow-sm">
                        {(bottomInfo.length * 100).toFixed(0)}
                      </div>
                    </foreignObject>
                  )}
                </>
              )}

              {/* ЛЕВАЯ СТЕНА */}
              {!deletedWalls.includes('left') && (
                <>
                  <line x1={x} y1={z} x2={x} y2={z + h} stroke={getWallColor('left')} strokeWidth={getWallStrokeWidth('left')} className="cursor-pointer transition-colors" onPointerDown={(e) => handleWallPointerDown(e, room.id, 'left')} onDoubleClick={(e) => handleWallDoubleClick(e, room.id, 'left')} />
                  {leftInfo.show && (
                    <foreignObject x={x - 46} y={(leftInfo.centerZ - room.posZ) * scale + z + h/2 - 12} width="42" height="24">
                      <div className="w-full h-full text-center text-[11px] leading-none font-bold bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center pointer-events-none shadow-sm">
                        {(leftInfo.length * 100).toFixed(0)}
                      </div>
                    </foreignObject>
                  )}
                </>
              )}

              {/* ПРАВАЯ СТЕНА */}
              {!deletedWalls.includes('right') && (
                <>
                  <line x1={x + w} y1={z} x2={x + w} y2={z + h} stroke={getWallColor('right')} strokeWidth={getWallStrokeWidth('right')} className="cursor-pointer transition-colors" onPointerDown={(e) => handleWallPointerDown(e, room.id, 'right')} onDoubleClick={(e) => handleWallDoubleClick(e, room.id, 'right')} />
                  {rightInfo.show && (
                    <foreignObject x={x + w + 4} y={(rightInfo.centerZ - room.posZ) * scale + z + h/2 - 12} width="42" height="24">
                      <div className="w-full h-full text-center text-[11px] leading-none font-bold bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center pointer-events-none shadow-sm">
                        {(rightInfo.length * 100).toFixed(0)}
                      </div>
                    </foreignObject>
                  )}
                </>
              )}

              {renderOpenings(room)}

              {/* Название и площадь */}
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