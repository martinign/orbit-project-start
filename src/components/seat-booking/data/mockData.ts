
import { addDays, format, isSameDay } from 'date-fns';
import { Office, Room, Seat, OfficeLayout } from '../types';

// Mock data for offices
export const offices: Office[] = [
  { id: 'o1', name: 'Berlin Office', location: 'Germany', hasCustomLayout: true },
  { id: 'o2', name: 'Buenos Aires Office', location: 'Argentina' },
  { id: 'o3', name: 'New York Office', location: 'USA' },
  { id: 'o4', name: 'Bangalore Office', location: 'India' },
];

// Mock data for rooms
export const rooms: Room[] = [
  { id: 'r1', officeId: 'o1', name: 'Main Hall', capacity: 24, description: 'Main working area' },
  { id: 'r2', officeId: 'o1', name: 'Focus Room', capacity: 8, description: 'Quiet working space' },
  { id: 'r3', officeId: 'o1', name: 'Meeting Area', capacity: 12, description: 'Collaborative space' },
  { id: 'r4', officeId: 'o2', name: 'Open Space', capacity: 16, description: 'Open plan working area' },
  { id: 'r5', officeId: 'o2', name: 'Corner Office', capacity: 6, description: 'Private working area' },
  { id: 'r6', officeId: 'o3', name: 'Downtown Floor', capacity: 20, description: 'Main working area' },
  { id: 'r7', officeId: 'o3', name: 'Midtown Space', capacity: 15, description: 'Secondary working area' },
  { id: 'r8', officeId: 'o4', name: 'Tech Park', capacity: 18, description: 'Main area with ergonomic desks' },
  { id: 'r9', officeId: 'o4', name: 'Garden View', capacity: 10, description: 'Area with view of the garden' },
];

// Berlin office layout definition based on the image
export const berlinOfficeLayout: OfficeLayout = {
  width: 1000,
  height: 600,
  elements: [
    // Hallway at the bottom
    { type: 'hallway', x: 50, y: 500, width: 900, height: 50, label: 'Hallway' },
    // Entrance
    { type: 'entrance', x: 450, y: 550, width: 100, height: 20, label: 'Entrance' },
  ]
};

// Generate seats for each room
const generateSeatsForRoom = (roomId: string): Seat[] => {
  // Special handling for Berlin office main hall
  if (roomId === 'r1') {
    return [
      // Top row (Row A)
      {
        id: `${roomId}-A1`,
        roomId,
        row: 'A',
        number: 1,
        isBooked: false,
        employeeName: 'Thomas',
        position: { x: 100, y: 100, width: 80, height: 60 }
      },
      {
        id: `${roomId}-A2`,
        roomId,
        row: 'A',
        number: 2,
        isBooked: false,
        employeeName: 'Anna',
        position: { x: 200, y: 100, width: 80, height: 60 }
      },
      {
        id: `${roomId}-A3`,
        roomId,
        row: 'A',
        number: 3,
        isBooked: true,
        employeeName: 'Maria',
        position: { x: 300, y: 100, width: 80, height: 60 }
      },
      {
        id: `${roomId}-A4`,
        roomId,
        row: 'A',
        number: 4,
        isBooked: false,
        employeeName: 'David',
        position: { x: 400, y: 100, width: 80, height: 60 }
      },
      {
        id: `${roomId}-A5`,
        roomId,
        row: 'A',
        number: 5,
        isBooked: false,
        employeeName: 'Sarah',
        position: { x: 500, y: 100, width: 80, height: 60 }
      },
      {
        id: `${roomId}-A6`,
        roomId,
        row: 'A',
        number: 6,
        isBooked: true,
        employeeName: 'Michael',
        position: { x: 600, y: 100, width: 80, height: 60 }
      },
      
      // Second row (Row B)
      {
        id: `${roomId}-B1`,
        roomId,
        row: 'B',
        number: 1,
        isBooked: false,
        employeeName: 'Lisa',
        position: { x: 100, y: 180, width: 80, height: 60 }
      },
      {
        id: `${roomId}-B2`,
        roomId,
        row: 'B',
        number: 2,
        isBooked: true,
        employeeName: 'James',
        position: { x: 200, y: 180, width: 80, height: 60 }
      },
      {
        id: `${roomId}-B3`,
        roomId,
        row: 'B',
        number: 3,
        isBooked: false,
        employeeName: 'Emma',
        position: { x: 300, y: 180, width: 80, height: 60 }
      },
      {
        id: `${roomId}-B4`,
        roomId,
        row: 'B',
        number: 4,
        isBooked: false,
        employeeName: 'Robert',
        position: { x: 400, y: 180, width: 80, height: 60 }
      },
      {
        id: `${roomId}-B5`,
        roomId,
        row: 'B',
        number: 5,
        isBooked: true,
        employeeName: 'Jessica',
        position: { x: 500, y: 180, width: 80, height: 60 }
      },
      {
        id: `${roomId}-B6`,
        roomId,
        row: 'B',
        number: 6,
        isBooked: false,
        employeeName: 'Daniel',
        position: { x: 600, y: 180, width: 80, height: 60 }
      },
      
      // Third row (Row C)
      {
        id: `${roomId}-C1`,
        roomId,
        row: 'C',
        number: 1,
        isBooked: false,
        employeeName: 'John',
        position: { x: 100, y: 260, width: 80, height: 60 }
      },
      {
        id: `${roomId}-C2`,
        roomId,
        row: 'C',
        number: 2,
        isBooked: false,
        employeeName: 'Sophie',
        position: { x: 200, y: 260, width: 80, height: 60 }
      },
      {
        id: `${roomId}-C3`,
        roomId,
        row: 'C',
        number: 3,
        isBooked: false,
        employeeName: 'Alex',
        position: { x: 300, y: 260, width: 80, height: 60 }
      },
      {
        id: `${roomId}-C4`,
        roomId,
        row: 'C',
        number: 4,
        isBooked: true,
        employeeName: 'Laura',
        position: { x: 400, y: 260, width: 80, height: 60 }
      },
      {
        id: `${roomId}-C5`,
        roomId,
        row: 'C',
        number: 5,
        isBooked: false,
        employeeName: 'Mark',
        position: { x: 500, y: 260, width: 80, height: 60 }
      },
      {
        id: `${roomId}-C6`,
        roomId,
        row: 'C',
        number: 6,
        isBooked: true,
        employeeName: 'Emily',
        position: { x: 600, y: 260, width: 80, height: 60 }
      },
      
      // Fourth row (Row D)
      {
        id: `${roomId}-D1`,
        roomId,
        row: 'D',
        number: 1,
        isBooked: false,
        employeeName: 'Peter',
        position: { x: 100, y: 340, width: 80, height: 60 }
      },
      {
        id: `${roomId}-D2`,
        roomId,
        row: 'D',
        number: 2,
        isBooked: true,
        employeeName: 'Jennifer',
        position: { x: 200, y: 340, width: 80, height: 60 }
      },
      {
        id: `${roomId}-D3`,
        roomId,
        row: 'D',
        number: 3,
        isBooked: false,
        employeeName: 'Richard',
        position: { x: 300, y: 340, width: 80, height: 60 }
      },
      {
        id: `${roomId}-D4`,
        roomId,
        row: 'D',
        number: 4,
        isBooked: false,
        employeeName: 'Amanda',
        position: { x: 400, y: 340, width: 80, height: 60 }
      },
      {
        id: `${roomId}-D5`,
        roomId,
        row: 'D',
        number: 5,
        isBooked: false,
        employeeName: 'William',
        position: { x: 500, y: 340, width: 80, height: 60 }
      },
      {
        id: `${roomId}-D6`,
        roomId,
        row: 'D',
        number: 6,
        isBooked: true,
        employeeName: 'Karen',
        position: { x: 600, y: 340, width: 80, height: 60 }
      },
    ];
  }
  
  const rowLetters = ['A', 'B', 'C', 'D'];
  const room = rooms.find(r => r.id === roomId);
  const seats: Seat[] = [];
  
  if (!room) return seats;
  
  let seatCount = 0;
  let rowIndex = 0;
  
  while (seatCount < room.capacity) {
    const rowLetter = rowLetters[rowIndex % rowLetters.length];
    const seatsInCurrentRow = Math.min(6, room.capacity - seatCount);
    
    for (let i = 1; i <= seatsInCurrentRow; i++) {
      seats.push({
        id: `${roomId}-${rowLetter}${i}`,
        roomId,
        row: rowLetter,
        number: i,
        isBooked: Math.random() > 0.7 // 30% of seats are booked by default
      });
      seatCount++;
    }
    
    rowIndex++;
  }
  
  return seats;
};

// Mock booking data for specific dates
const bookings: Record<string, string[]> = {
  [format(new Date(), 'yyyy-MM-dd')]: ['r1-A1', 'r1-B3', 'r2-A2'],
  [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: ['r1-A2', 'r1-C1', 'r3-A1'],
};

// Cache generated seats
const seatsCache: Record<string, Seat[]> = {};

// Get seats for a specific room and date
export const getSeatsForRoom = (roomId: string, date: Date): Seat[] => {
  // Generate seats if not in cache
  if (!seatsCache[roomId]) {
    seatsCache[roomId] = generateSeatsForRoom(roomId);
  }
  
  // Clone the seats to avoid modifying the cache
  const seats = JSON.parse(JSON.stringify(seatsCache[roomId])) as Seat[];
  
  // Apply bookings for the specific date
  const dateString = format(date, 'yyyy-MM-dd');
  const dateBookings = bookings[dateString] || [];
  
  return seats.map(seat => ({
    ...seat,
    isBooked: dateBookings.includes(seat.id) || seat.isBooked
  }));
};
