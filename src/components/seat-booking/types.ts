
export interface Office {
  id: string;
  name: string;
  location: string;
}

export interface Room {
  id: string;
  officeId: string;
  name: string;
  capacity: number;
  description?: string;
}

export interface Seat {
  id: string;
  roomId: string;
  row: string;
  number: number;
  isBooked: boolean;
}
