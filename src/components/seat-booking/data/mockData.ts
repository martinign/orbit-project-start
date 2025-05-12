
import { addDays, format, isSameDay } from 'date-fns';
import { Office, Room, Seat } from '../types';

// Mock data for offices
export const offices: Office[] = [
  { id: 'o1', name: 'Berlin Office', location: 'Germany' },
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

// Generate seats for each room
const generateSeatsForRoom = (roomId: string): Seat[] => {
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
