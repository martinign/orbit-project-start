
export interface Office {
  id: string;
  name: string;
  location: string;
  hasCustomLayout?: boolean;
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
  employeeName?: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
}

export interface OfficeLayout {
  width: number;
  height: number;
  elements: {
    type: 'desk' | 'room' | 'hallway' | 'entrance';
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
  }[];
}
