import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid, Text } from '@react-three/drei';
import { useHouseStore, useActiveFloorRooms, useFloors } from '../store';

function WallWithOpenings({
  roomLength, roomWidth, height, wallSide, openings, isSelected, isWallSelected, onClick
}) {
  const wallThickness = 0.2;
  const isTopBottom = wallSide === 'top' || wallSide === 'bottom';
  const wallLength = isTopBottom ? roomLength : roomWidth;

  let posX = 0, posZ = 0, rotY = 0;
  if (wallSide === 'top') { posZ = -roomWidth / 2; }
  else if (wallSide === 'bottom') { posZ = roomWidth / 2; }
  else if (wallSide === 'left') { posX = -roomLength / 2; rotY = Math.PI / 2; }
  else if (wallSide === 'right') { posX = roomLength / 2; rotY = Math.PI / 2; }

  const wallOpenings = (openings || []).filter(op => op.wall === wallSide).sort((a, b) => a.offset - b.offset);
  const segmentsToRender = [];
  const labelsToRender = [];

  const color = isWallSelected ? '#ef4444' : (isSelected ? '#3b82f6' : '#94a3b8');
  let currentX = -wallLength / 2;

  const addLabel = (xPos, yPos, text, isOpening = false) => {
    labelsToRender.push(
      <Text
        key={`label-${xPos}-${yPos}`}
        position={[xPos, yPos, 0]}
        fontSize={0.3}
        color={isOpening ? '#b91c1c' : '#1e293b'}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.03}
        outlineColor="#ffffff"
        fontWeight="bold"
      >
        {text}
      </Text>
    );
  };

  wallOpenings.forEach((op, index) => {
    let effectiveOffset = op.offset;
    if (wallSide === 'left' || wallSide === 'right') {
      effectiveOffset = wallLength - op.offset - op.width;
    }

    const opStart = -wallLength / 2 + effectiveOffset;
    const opEnd = opStart + op.width;
    const safeStart = Math.max(-wallLength / 2, Math.min(wallLength / 2, opStart));
    const safeEnd = Math.max(-wallLength / 2, Math.min(wallLength / 2, opEnd));

    if (safeStart > currentX) {
      const segWidth = safeStart - currentX;
      const midX = currentX + segWidth / 2;
      segmentsToRender.push(
        <mesh key={`seg-${index}-left`} position={[midX, height / 2, 0]} castShadow receiveShadow onPointerDown={onClick}>
          <boxGeometry args={[segWidth, height, wallThickness]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
      if (segWidth > 0.3) addLabel(midX, height + 0.1, `${(segWidth * 100).toFixed(0)}`);
    }

    const opHeight = Math.min(op.height, height);
    const opSill = Math.min(op.sill, height);
    const midOpX = safeStart + (safeEnd - safeStart) / 2;

    if (opSill > 0) {
      segmentsToRender.push(
        <mesh key={`seg-${index}-bottom`} position={[midOpX, opSill / 2, 0]} castShadow receiveShadow onPointerDown={onClick}>
          <boxGeometry args={[safeEnd - safeStart, opSill, wallThickness]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }

    const topStartY = opSill + opHeight;
    if (topStartY < height) {
      const topHeight = height - topStartY;
      segmentsToRender.push(
        <mesh key={`seg-${index}-top`} position={[midOpX, topStartY + topHeight / 2, 0]} castShadow receiveShadow onPointerDown={onClick}>
          <boxGeometry args={[safeEnd - safeStart, topHeight, wallThickness]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    }
    addLabel(midOpX, height + 0.1, `${(op.width * 100).toFixed(0)}`, true);
    currentX = Math.max(currentX, safeEnd);
  });

  if (currentX < wallLength / 2) {
    const segWidth = wallLength / 2 - currentX;
    const midX = currentX + segWidth / 2;
    segmentsToRender.push(
      <mesh key="seg-last" position={[midX, height / 2, 0]} castShadow receiveShadow onPointerDown={onClick}>
        <boxGeometry args={[segWidth, height, wallThickness]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
    if (segWidth > 0.3) addLabel(midX, height + 0.1, `${(segWidth * 100).toFixed(0)}`);
  }

  return <group position={[posX, 0, posZ]} rotation={[0, rotY, 0]}>{segmentsToRender}{labelsToRender}</group>;
}

function Room({ room, isSelected, selectedWall, onSelect, onSelectWall, allRooms, floorY }) {
  const { name, length, width, height, posX, posZ, openings = [], deletedWalls = [], groupId } = room;

  if (isNaN(posX) || isNaN(posZ) || isNaN(length) || isNaN(width) || isNaN(height)) return null;

  const handleFloorClick = (e) => { 
    e.stopPropagation(); 
    onSelect(room.id); 
  };
  
  const handleWallClick = (e, side) => { 
    e.stopPropagation(); 
    onSelectWall({ roomId: room.id, side }); 
  };

  const isWallSelected = (side) => selectedWall && selectedWall.roomId === room.id && selectedWall.side === side;

  const groupRooms = allRooms.filter(r => r.groupId === groupId);
  const isFirstInGroup = groupRooms.length <= 1 || groupRooms[0].id === room.id;

  const hasNeighbor = (side) => {
    if (room.showAllWalls) return false;

    return allRooms.some(other => {
      if (other.id === room.id) return false;
      if (room.id < other.id) return false;

      const tolerance = 0.1;
      if (side === 'top') {
        const myEdge = posZ - width / 2;
        const otherEdge = other.posZ + other.width / 2;
        return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(posX - other.posX) < (length + other.length) / 2 - tolerance;
      }
      if (side === 'bottom') {
        const myEdge = posZ + width / 2;
        const otherEdge = other.posZ - other.width / 2;
        return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(posX - other.posX) < (length + other.length) / 2 - tolerance;
      }
      if (side === 'left') {
        const myEdge = posX - length / 2;
        const otherEdge = other.posX + other.length / 2;
        return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(posZ - other.posZ) < (width + other.width) / 2 - tolerance;
      }
      if (side === 'right') {
        const myEdge = posX + length / 2;
        const otherEdge = other.posX - other.length / 2;
        return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(posZ - other.posZ) < (width + other.width) / 2 - tolerance;
      }
      return false;
    });
  };

  return (
    <group position={[posX, floorY, posZ]}>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, 0]} 
        receiveShadow 
        onClick={handleFloorClick}
        raycast={() => null}
      >
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color={isSelected ? '#bfdbfe' : '#f8fafc'} />
      </mesh>

      {isFirstInGroup && (
        <Text
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={Math.min(length, width) * 0.15}
          color={isSelected ? '#1d4ed8' : '#64748b'}
          anchorX="center"
          anchorY="middle"
          maxWidth={length * 0.8}
          textAlign="center"
        >
          {name}
        </Text>
      )}

      {['top', 'bottom', 'left', 'right'].map(side => {
        if (deletedWalls.includes(side)) return null;
        if (hasNeighbor(side) && !isWallSelected(side)) return null;

        return (
          <WallWithOpenings
            key={side}
            roomLength={length}
            roomWidth={width}
            height={height}
            wallSide={side}
            openings={openings}
            isSelected={isSelected}
            isWallSelected={isWallSelected(side)}
            onClick={(e) => handleWallClick(e, side)}
          />
        );
      })}

      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} raycast={() => null}>
          <planeGeometry args={[length + 0.1, width + 0.1]} />
          <meshBasicMaterial color="#3b82f6" wireframe />
        </mesh>
      )}
    </group>
  );
}

function CameraController({ targetRoom }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    if (targetRoom) {
      camera.position.set(targetRoom.posX + 10, targetRoom.height * 2, targetRoom.posZ + 10);
      if (controls) { controls.target.set(targetRoom.posX, 0, targetRoom.posZ); controls.update(); }
    } else {
      camera.position.set(15, 15, 15);
      if (controls) { controls.target.set(0, 0, 0); controls.update(); }
    }
  }, [targetRoom, camera, controls]);
  return null;
}

export default function Scene3D({ selectedRoomId, onSelectRoom, selectedWall, onSelectWall }) {
  const activeRooms = useActiveFloorRooms();
  const floors = useFloors();
  const activeFloorId = useHouseStore((s) => s.activeFloorId);
  const isolateRoomId = useHouseStore((s) => s.isolateRoomId);

  const displayedRooms = isolateRoomId ? activeRooms.filter(r => r.id === isolateRoomId) : activeRooms;
  const targetRoom = isolateRoomId ? activeRooms.find(r => r.id === isolateRoomId) : null;

  const selectedRoom = activeRooms.find(r => r.id === selectedRoomId);
  const selectedGroupId = selectedRoom ? selectedRoom.groupId : null;

  const getFloorY = (room) => {
    if (activeFloorId === 'all') {
      const floorIndex = floors.findIndex(f => f.id === room.floorId);
      return floorIndex >= 0 ? floorIndex * 3 : 0;
    }
    return 0;
  };

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [15, 15, 15], fov: 45 }} shadows gl={{ antialias: false }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        <Environment preset="city" />
        <Grid args={[40, 40]} cellColor="#94a3b8" sectionColor="#64748b" fadeDistance={40} />

        {displayedRooms.map(room => (
          <Room
            key={room.id}
            room={room}
            floorY={getFloorY(room)}
            isSelected={selectedGroupId ? room.groupId === selectedGroupId : room.id === selectedRoomId}
            selectedWall={selectedWall}
            onSelect={onSelectRoom}
            onSelectWall={onSelectWall}
            allRooms={activeRooms}
          />
        ))}

        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={1.5} far={4} />
        <CameraController targetRoom={targetRoom} />
        <OrbitControls makeDefault enablePan enableZoom enableRotate mouseButtons={{ LEFT: -1, MIDDLE: 0, RIGHT: 2 }} />
      </Canvas>
    </div>
  );
}