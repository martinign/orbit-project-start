
import { Circle } from "lucide-react";
import { Seat } from "./types";

interface SeatGridProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
  date: Date;
}

const SeatGrid = ({ seats, selectedSeat, onSeatSelect, date }: SeatGridProps) => {
  // Group seats by row to create a grid layout
  const rows = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  // Sort rows and seats within rows
  const sortedRows = Object.keys(rows).sort();
  sortedRows.forEach(row => {
    rows[row] = rows[row].sort((a, b) => a.number - b.number);
  });

  // Find the maximum number of seats in any row
  const maxSeats = Math.max(...Object.values(rows).map(row => row.length), 0);

  return (
    <div className="overflow-auto pb-4">
      <div className="flex justify-center">
        <div className="rounded-lg p-6 bg-gray-50 flex flex-col items-center">
          <div className="w-48 h-12 bg-gray-300 mb-10 rounded-lg flex items-center justify-center text-sm font-medium">
            Front Desk
          </div>
          
          <div className="grid gap-x-16 gap-y-6">
            {sortedRows.map(rowId => (
              <div key={rowId} className="flex items-center gap-4">
                <div className="text-sm font-medium w-6 text-right">
                  {rowId}
                </div>
                
                <div className="flex gap-4">
                  {rows[rowId].map(seat => {
                    const isSelected = selectedSeat === seat.id;
                    const isBooked = seat.isBooked;
                    
                    return (
                      <button
                        key={seat.id}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isBooked 
                            ? "bg-red-100 cursor-not-allowed" 
                            : isSelected 
                              ? "bg-blue-500 text-white" 
                              : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => !isBooked && onSeatSelect(seat.id)}
                        disabled={isBooked}
                        title={`${rowId}${seat.number}${isBooked ? ' (Booked)' : ''}`}
                      >
                        <Circle className={`h-5 w-5 ${isBooked ? 'text-red-500' : isSelected ? 'text-white' : 'text-gray-600'}`} />
                        <span className="absolute text-xs font-bold">{seat.number}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="w-2/3 h-12 bg-gray-300 mt-10 rounded-lg flex items-center justify-center text-sm font-medium">
            Entrance
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;
