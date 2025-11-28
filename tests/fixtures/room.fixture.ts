/**
 * Room Fixtures
 * Physical classrooms and labs for scheduling
 */

import type { Database } from '../../src/types/test-schema';

type Room = Database['public']['Tables']['room']['Row'];

export const TEST_ROOMS: Room[] = [
  // Regular Classrooms (A Building)
  {
    number: 'A101',
    building: 'Building A',
    capacity: 30,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard', 'speakers'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  {
    number: 'A102',
    building: 'Building A',
    capacity: 30,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard', 'speakers'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  {
    number: 'A103',
    building: 'Building A',
    capacity: 28,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  {
    number: 'A104',
    building: 'Building A',
    capacity: 28,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  
  // Medium Classrooms (B Building)
  {
    number: 'B201',
    building: 'Building B',
    capacity: 25,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard', 'speakers', 'smartboard'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  {
    number: 'B202',
    building: 'Building B',
    capacity: 25,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard', 'speakers', 'smartboard'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  {
    number: 'B203',
    building: 'Building B',
    capacity: 22,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard', 'speakers'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  {
    number: 'B204',
    building: 'Building B',
    capacity: 22,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard', 'speakers'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  
  // Lab Rooms (Lab Building)
  {
    number: 'LAB-101',
    building: 'Lab Building',
    capacity: 20,
    type: 'LAB',
    equipment: ['computers', 'projector', 'lab_workstations', 'power_outlets'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  {
    number: 'LAB-102',
    building: 'Lab Building',
    capacity: 20,
    type: 'LAB',
    equipment: ['computers', 'projector', 'lab_workstations', 'power_outlets'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  {
    number: 'LAB-201',
    building: 'Lab Building',
    capacity: 18,
    type: 'LAB',
    equipment: ['computers', 'projector', 'lab_workstations', 'power_outlets', 'servers'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  
  // Large Auditorium
  {
    number: 'AUD-101',
    building: 'Main Hall',
    capacity: 100,
    type: 'AUDITORIUM',
    equipment: ['projector', 'sound_system', 'microphones', 'recording_equipment', 'smartboard'],
    is_available: true,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-08-01T10:00:00Z',
  },
  
  // Unavailable Room (for testing)
  {
    number: 'A999',
    building: 'Building A',
    capacity: 30,
    type: 'CLASSROOM',
    equipment: ['projector', 'whiteboard'],
    is_available: false, // Under maintenance
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2024-10-01T10:00:00Z',
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getRoomByNumber = (number: string): Room | undefined => {
  return TEST_ROOMS.find(r => r.number === number);
};

export const getRoomsByBuilding = (building: string): Room[] => {
  return TEST_ROOMS.filter(r => r.building === building);
};

export const getRoomsByType = (type: Room['type']): Room[] => {
  return TEST_ROOMS.filter(r => r.type === type);
};

export const getAvailableRooms = (): Room[] => {
  return TEST_ROOMS.filter(r => r.is_available === true);
};

export const getRoomsByCapacity = (minCapacity: number, maxCapacity?: number): Room[] => {
  if (maxCapacity) {
    return TEST_ROOMS.filter(r => r.capacity >= minCapacity && r.capacity <= maxCapacity);
  }
  return TEST_ROOMS.filter(r => r.capacity >= minCapacity);
};

export const getRoomsWithEquipment = (equipment: string): Room[] => {
  return TEST_ROOMS.filter(r => {
    const equipmentArray = r.equipment as string[];
    return equipmentArray && equipmentArray.includes(equipment);
  });
};

// =====================================================
// STATISTICS
// =====================================================

export const getRoomStatistics = () => {
  const available = getAvailableRooms();
  const classrooms = getRoomsByType('CLASSROOM');
  const labs = getRoomsByType('LAB');
  const auditoriums = getRoomsByType('AUDITORIUM');
  
  return {
    total_rooms: TEST_ROOMS.length,
    available_rooms: available.length,
    classrooms: classrooms.length,
    labs: labs.length,
    auditoriums: auditoriums.length,
    total_capacity: TEST_ROOMS.reduce((sum, r) => sum + r.capacity, 0),
    avg_capacity: Math.round(TEST_ROOMS.reduce((sum, r) => sum + r.capacity, 0) / TEST_ROOMS.length),
    buildings: [...new Set(TEST_ROOMS.map(r => r.building))].length,
  };
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const ROOMS_QUICK_REF = {
  all: TEST_ROOMS,
  available: getAvailableRooms(),
  classrooms: getRoomsByType('CLASSROOM'),
  labs: getRoomsByType('LAB'),
  auditoriums: getRoomsByType('AUDITORIUM'),
  buildingA: getRoomsByBuilding('Building A'),
  buildingB: getRoomsByBuilding('Building B'),
  labBuilding: getRoomsByBuilding('Lab Building'),
  withProjectors: getRoomsWithEquipment('projector'),
  withComputers: getRoomsWithEquipment('computers'),
  statistics: getRoomStatistics(),
};

// Export for easy access
export const TEST_ROOM_DATA = {
  all: TEST_ROOMS,
  quickRef: ROOMS_QUICK_REF,
  helpers: {
    getByNumber: getRoomByNumber,
    getByBuilding: getRoomsByBuilding,
    getByType: getRoomsByType,
    getAvailable: getAvailableRooms,
    getByCapacity: getRoomsByCapacity,
    getWithEquipment: getRoomsWithEquipment,
    getStatistics: getRoomStatistics,
  },
};


