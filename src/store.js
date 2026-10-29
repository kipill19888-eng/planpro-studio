import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProjectsStore } from './storeProjects';

const getActiveRooms = (state) => {
  const activeId = useProjectsStore.getState().activeProjectId;
  return state.projectRooms[activeId] || [];
};

export const useHouseStore = create(
  persist(
    (set, get) => ({
      projectRooms: {},
      projectFloors: {},
      activeFloorId: 'floor-1',
      selectedRoomId: null,
      selectedWall: null,
      isolateRoomId: null,

      past: [],
      future: [],

      setActiveFloorId: (id) => set({ activeFloorId: id }),

      addFloor: () => {
        const activeId = useProjectsStore.getState().activeProjectId;
        const floors = get().projectFloors[activeId] || [{ id: 'floor-1', name: '1 Этаж' }];
        const newFloor = { id: `floor-${Date.now()}`, name: `${floors.length + 1} Этаж` };
        
        set((state) => ({
          projectFloors: {
            ...state.projectFloors,
            [activeId]: [...floors, newFloor]
          },
          activeFloorId: newFloor.id
        }));
      },

      removeFloor: (floorId) => {
        const activeId = useProjectsStore.getState().activeProjectId;
        const floors = get().projectFloors[activeId] || [];
        if (floors.length <= 1) return;

        const newFloors = floors.filter(f => f.id !== floorId);
        const currentRooms = getActiveRooms(get());
        const newRooms = currentRooms.filter(r => r.floorId !== floorId);

        set((state) => {
          const newProjectRooms = { ...state.projectRooms, [activeId]: newRooms };
          return {
            projectFloors: { ...state.projectFloors, [activeId]: newFloors },
            projectRooms: newProjectRooms,
            activeFloorId: state.activeFloorId === floorId ? newFloors[0].id : state.activeFloorId
          };
        });
      },

      saveHistory: () => {
        const currentRooms = getActiveRooms(get());
        set((state) => ({
          past: [...state.past, JSON.parse(JSON.stringify(currentRooms))].slice(-50),
          future: []
        }));
      },

      undo: () => set((state) => {
        if (state.past.length === 0) return state;
        const previousRooms = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        
        const activeId = useProjectsStore.getState().activeProjectId;
        set((s) => ({
          projectRooms: { ...s.projectRooms, [activeId]: previousRooms }
        }));

        return {
          past: newPast,
          future: [JSON.parse(JSON.stringify(getActiveRooms(state))), ...state.future]
        };
      }),

      redo: () => set((state) => {
        if (state.future.length === 0) return state;
        const nextRooms = state.future[0];
        const newFuture = state.future.slice(1);

        const activeId = useProjectsStore.getState().activeProjectId;
        set((s) => ({
          projectRooms: { ...s.projectRooms, [activeId]: nextRooms }
        }));

        return {
          past: [...state.past, JSON.parse(JSON.stringify(getActiveRooms(state)))],
          future: newFuture
        };
      }),

      setSelectedRoomId: (id) => set({ selectedRoomId: id, selectedWall: null }),
      setSelectedWall: (wall) => set({ selectedWall: wall }),
      setIsolateRoomId: (id) => set({ isolateRoomId: id }),

      setRooms: (newRooms) => {
        const activeId = useProjectsStore.getState().activeProjectId;
        set((state) => ({
          projectRooms: {
            ...state.projectRooms,
            [activeId]: newRooms
          }
        }));
      },

      addFirstRoom: (roomParams) => {
        get().saveHistory();
        const activeFloorId = get().activeFloorId;
        const newId = `room-${Date.now()}`;
        get().setRooms([{
          id: newId,
          groupId: `group-${Date.now()}`,
          floorId: activeFloorId,
          name: roomParams.name || 'Комната 1',
          length: roomParams.length || 4,
          width: roomParams.width || 3,
          height: roomParams.height || 2.7,
          posX: 0,
          posZ: 0,
          openings: [],
          deletedWalls: [],
          showAllWalls: false
        }]);
        set({ selectedRoomId: newId, selectedWall: null });
      },

      addRoomAtPosition: (posX, posZ, roomParams) => {
        get().saveHistory();
        const activeFloorId = get().activeFloorId;
        const newId = `room-${Date.now()}`;
        const currentRooms = getActiveRooms(get());
        get().setRooms([...currentRooms, {
          id: newId,
          groupId: `group-${Date.now()}`,
          floorId: activeFloorId,
          name: roomParams.name || 'Новая комната',
          length: roomParams.length || 4,
          width: roomParams.width || 3,
          height: roomParams.height || 2.7,
          posX: posX,
          posZ: posZ,
          openings: [],
          deletedWalls: [],
          showAllWalls: false
        }]);
        set({ selectedRoomId: newId, selectedWall: null });
      },

      updateRoom: (id, updates) => {
        get().saveHistory();
        const currentRooms = getActiveRooms(get());
        
        if (updates.name) {
          const targetRoom = currentRooms.find(r => r.id === id);
          const existingRoom = currentRooms.find(r => r.name === updates.name && r.id !== id);

          if (targetRoom && existingRoom) {
            const sharedGroupId = existingRoom.groupId || targetRoom.groupId;
            get().setRooms(currentRooms.map(r => {
              if (r.id === id || r.id === existingRoom.id) {
                return { ...r, name: updates.name, groupId: sharedGroupId };
              }
              return r;
            }));
            return;
          }
        }

        get().setRooms(currentRooms.map(r => r.id === id ? { ...r, ...updates } : r));
      },

      removeRoom: (id) => {
        get().saveHistory();
        get().setRooms(getActiveRooms(get()).filter(r => r.id !== id));
        set((state) => ({
          selectedRoomId: state.selectedRoomId === id ? null : state.selectedRoomId,
          selectedWall: state.selectedWall?.roomId === id ? null : state.selectedWall
        }));
      },

      deleteWall: (roomId, wallSide) => {
        get().saveHistory();
        const currentRooms = getActiveRooms(get());
        const room = currentRooms.find(r => r.id === roomId);
        if (!room) return;

        let oppositeSide = null;
        if (wallSide === 'top') oppositeSide = 'bottom';
        if (wallSide === 'bottom') oppositeSide = 'top';
        if (wallSide === 'left') oppositeSide = 'right';
        if (wallSide === 'right') oppositeSide = 'left';

        const tolerance = 0.2;

        const neighbor = currentRooms.find(other => {
          if (other.id === roomId) return false;
          
          if (wallSide === 'top') {
            const myEdge = room.posZ - room.width / 2;
            const otherEdge = other.posZ + other.width / 2;
            return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(room.posX - other.posX) < (room.length + other.length) / 2 - 0.1;
          }
          if (wallSide === 'bottom') {
            const myEdge = room.posZ + room.width / 2;
            const otherEdge = other.posZ - other.width / 2;
            return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(room.posX - other.posX) < (room.length + other.length) / 2 - 0.1;
          }
          if (wallSide === 'left') {
            const myEdge = room.posX - room.length / 2;
            const otherEdge = other.posX + other.length / 2;
            return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(room.posZ - other.posZ) < (room.width + other.width) / 2 - 0.1;
          }
          if (wallSide === 'right') {
            const myEdge = room.posX + room.length / 2;
            const otherEdge = other.posX - other.length / 2;
            return Math.abs(myEdge - otherEdge) < tolerance && Math.abs(room.posZ - other.posZ) < (room.width + other.width) / 2 - 0.1;
          }
          return false;
        });

        // 👇 Если нашли соседа, объединяем их группы (чтобы считались одной комнатой)
        const mergedGroupId = neighbor ? neighbor.groupId : room.groupId;

        get().setRooms(currentRooms.map(r => {
          if (r.id === roomId) {
            return { 
              ...r, 
              groupId: mergedGroupId, // Присваиваем общий groupId
              showAllWalls: false, 
              deletedWalls: [...new Set([...(r.deletedWalls || []), wallSide])] 
            };
          }
          if (neighbor && r.id === neighbor.id) {
            return { 
              ...r, 
              groupId: mergedGroupId, // Присваиваем общий groupId
              showAllWalls: false, 
              deletedWalls: [...new Set([...(r.deletedWalls || []), oppositeSide])] 
            };
          }
          return r;
        }));
      },

      hideWallsOnContact: (roomId) => {
        const currentRooms = getActiveRooms(get());
        const room = currentRooms.find(r => r.id === roomId);
        if (!room) return;

        const tolerance = 0.15;
        let updatedRoom = { ...room };

        currentRooms.forEach(other => {
          if (other.id === roomId) return;

          if (Math.abs((room.posX + room.length / 2) - (other.posX - other.length / 2)) < tolerance && 
              Math.abs(room.posZ - other.posZ) < (room.width + other.width) / 2) {
            updatedRoom.deletedWalls = [...new Set([...(updatedRoom.deletedWalls || []), 'right'])];
          }
          if (Math.abs((room.posX - room.length / 2) - (other.posX + other.length / 2)) < tolerance && 
              Math.abs(room.posZ - other.posZ) < (room.width + other.width) / 2) {
            updatedRoom.deletedWalls = [...new Set([...(updatedRoom.deletedWalls || []), 'left'])];
          }
          if (Math.abs((room.posZ + room.width / 2) - (other.posZ - other.width / 2)) < tolerance && 
              Math.abs(room.posX - other.posX) < (room.length + other.length) / 2) {
            updatedRoom.deletedWalls = [...new Set([...(updatedRoom.deletedWalls || []), 'bottom'])];
          }
          if (Math.abs((room.posZ - room.width / 2) - (other.posZ + other.width / 2)) < tolerance && 
              Math.abs(room.posX - other.posX) < (room.length + other.length) / 2) {
            updatedRoom.deletedWalls = [...new Set([...(updatedRoom.deletedWalls || []), 'top'])];
          }
        });

        get().setRooms(currentRooms.map(r => r.id === roomId ? updatedRoom : r));
      },

      restoreWall: (roomId, wallSide) => {
        get().saveHistory();
        const currentRooms = getActiveRooms(get());
        const room = currentRooms.find(r => r.id === roomId);
        if (!room) return;

        let oppositeSide = null;
        if (wallSide === 'top') oppositeSide = 'bottom';
        if (wallSide === 'bottom') oppositeSide = 'top';
        if (wallSide === 'left') oppositeSide = 'right';
        if (wallSide === 'right') oppositeSide = 'left';

        get().setRooms(currentRooms.map(r => {
          if (r.id === roomId) {
            return { ...r, deletedWalls: (r.deletedWalls || []).filter(w => w !== wallSide) };
          }
          if (r.deletedWalls && r.deletedWalls.includes(oppositeSide)) {
            const neighbor = currentRooms.find(n => n.id === r.id);
            const tolerance = 0.2;
            let isNeighbor = false;
            if (wallSide === 'top' && Math.abs((room.posZ - room.width / 2) - (neighbor.posZ + neighbor.width / 2)) < tolerance) isNeighbor = true;
            if (wallSide === 'bottom' && Math.abs((room.posZ + room.width / 2) - (neighbor.posZ - neighbor.width / 2)) < tolerance) isNeighbor = true;
            if (wallSide === 'left' && Math.abs((room.posX - room.length / 2) - (neighbor.posX + neighbor.length / 2)) < tolerance) isNeighbor = true;
            if (wallSide === 'right' && Math.abs((room.posX + room.length / 2) - (neighbor.posX - neighbor.length / 2)) < tolerance) isNeighbor = true;
            
            if (isNeighbor) {
              return { ...r, deletedWalls: r.deletedWalls.filter(w => w !== oppositeSide) };
            }
          }
          return r;
        }));
      },

      restoreAllWalls: (roomId) => {
        get().saveHistory();
        get().setRooms(getActiveRooms(get()).map(r => {
          if (r.id === roomId) {
            return { ...r, deletedWalls: [], showAllWalls: true };
          }
          return r;
        }));
      },

      addOpening: (roomId, wallSide = 'top') => {
        get().saveHistory();
        get().setRooms(getActiveRooms(get()).map(r => {
          if (r.id === roomId) {
            return { ...r, openings: [...(r.openings || []), { id: `open-${Date.now()}`, type: 'window', wall: wallSide, offset: 1.0, width: 1.5, height: 1.5, sill: 0.8 }] };
          }
          return r;
        }));
      },

      updateOpening: (roomId, openingId, updates) => {
        get().saveHistory();
        get().setRooms(getActiveRooms(get()).map(r => {
          if (r.id === roomId) {
            return { ...r, openings: r.openings.map(o => o.id === openingId ? { ...o, ...updates } : o) };
          }
          return r;
        }));
      },

      removeOpening: (roomId, openingId) => {
        get().saveHistory();
        get().setRooms(getActiveRooms(get()).map(r => {
          if (r.id === roomId) return { ...r, openings: r.openings.filter(o => o.id !== openingId) };
          return r;
        }));
      },

      getGroupStats: (groupId) => {
        const rooms = getActiveRooms(get());
        let totalArea = 0;
        let totalPerimeter = 0;

        rooms.forEach(room => {
          if (room.groupId === groupId) {
            totalArea += room.length * room.width;
            let roomPerimeter = 2 * (room.length + room.width);
            if (room.deletedWalls) {
              room.deletedWalls.forEach(side => {
                const wallLength = (side === 'top' || side === 'bottom') ? room.length : room.width;
                roomPerimeter -= wallLength;
              });
            }
            totalPerimeter += roomPerimeter;
          }
        });

        return { area: totalArea, perimeter: totalPerimeter };
      },

      getRoomWallsArea: (room) => {
        const perimeter = 2 * (room.length + room.width);
        let wallsArea = perimeter * room.height;

        const deleted = room.deletedWalls || [];

        deleted.forEach(side => {
          const wallLength = (side === 'top' || side === 'bottom') ? room.length : room.width;
          wallsArea -= wallLength * room.height;
        });

        if (room.openings) {
          room.openings.forEach(op => {
            if (deleted.includes(op.wall)) return;
            wallsArea -= op.width * op.height;
          });
        }

        return Math.max(0, wallsArea);
      },

      getCalculatedAreas: () => {
        const rooms = getActiveRooms(get());
        let totalFloorArea = 0, totalWallsArea = 0, totalPerimeter = 0, totalOpeningsArea = 0;

        rooms.forEach(room => {
          totalFloorArea += room.length * room.width;
          totalWallsArea += get().getRoomWallsArea(room);

          if (room.openings) {
            room.openings.forEach(op => { totalOpeningsArea += (op.width * op.height); });
          }
        });

        const groups = {};
        rooms.forEach(room => {
          if (!groups[room.groupId]) groups[room.groupId] = [];
          groups[room.groupId].push(room);
        });

        Object.keys(groups).forEach(groupId => {
          const stats = get().getGroupStats(groupId);
          totalPerimeter += stats.perimeter;
        });

        return {
          floorArea: totalFloorArea,
          wallsArea: Math.max(0, totalWallsArea),
          perimeter: totalPerimeter,
          openingsArea: totalOpeningsArea
        };
      }
    }),
    {
      name: 'planpro-house-storage',
      version: 3,
      migrate: (persistedState, version) => {
        if (version === 0 || version === 1) {
          return {
            projectRooms: { 'proj-default': persistedState.rooms || [] },
            projectFloors: { 'proj-default': [{ id: 'floor-1', name: '1 Этаж' }] },
            activeFloorId: 'floor-1'
          };
        }
        if (version === 2) {
          const oldRooms = persistedState.projectRooms || {};
          const newRooms = {};
          Object.keys(oldRooms).forEach(projId => {
            newRooms[projId] = oldRooms[projId].map(r => ({ ...r, floorId: r.floorId || 'floor-1' }));
          });
          
          return {
            ...persistedState,
            projectRooms: newRooms,
            projectFloors: { 'proj-default': [{ id: 'floor-1', name: '1 Этаж' }] },
            activeFloorId: 'floor-1'
          };
        }
        return persistedState;
      }
    }
  )
);

export const useRooms = () => {
  const activeProjectId = useProjectsStore((state) => state.activeProjectId);
  const allProjectRooms = useHouseStore((state) => state.projectRooms);
  return allProjectRooms[activeProjectId] || [];
};

export const useActiveFloorRooms = () => {
  const rooms = useRooms();
  const activeFloorId = useHouseStore((state) => state.activeFloorId);
  return activeFloorId === 'all' ? rooms : rooms.filter(r => r.floorId === activeFloorId || !r.floorId);
};

export const useFloors = () => {
  const activeProjectId = useProjectsStore((state) => state.activeProjectId);
  const projectFloors = useHouseStore((state) => state.projectFloors);
  return projectFloors[activeProjectId] || [{ id: 'floor-1', name: '1 Этаж' }];
};