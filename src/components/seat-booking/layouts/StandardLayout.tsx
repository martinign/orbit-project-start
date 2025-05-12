
import React from "react";
import { Seat } from "../types";
import { Circle } from "lucide-react";

interface StandardLayoutProps {
  rows: Record<string, Seat[]>;
  sortedRowIds: string[];
  selectedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
}

const StandardLayout: React.FC<StandardLayoutProps> = ({
  rows,
  sortedRowIds,
  selectedSeat,
  onSeatSelect
}) => {
  return (
    <div className="flex justify-center">
      <div className="rounded-lg p-6 bg-gray-50 flex flex-col items-center">
        <div className="w-48 h-12 bg-gray-300 mb-10 rounded-lg flex items-center justify-center text-sm font-medium">
          Front Desk
        </div>
        
        <div className="grid gap-x-16 gap-y-6">
          {sortedRowIds.map(rowId => (
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
  );
};

export default StandardLayout;
