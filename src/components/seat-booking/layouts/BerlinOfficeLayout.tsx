
import React from "react";
import { Seat } from "../types";
import { User } from "lucide-react";

interface BerlinOfficeLayoutProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  startPan: (e: React.MouseEvent) => void;
  pan: (e: React.MouseEvent) => void;
  endPan: (e: React.MouseEvent) => void;
}

const BerlinOfficeLayout: React.FC<BerlinOfficeLayoutProps> = ({
  seats,
  selectedSeat,
  onSeatSelect,
  scale,
  offsetX,
  offsetY,
  isDragging,
  startPan,
  pan,
  endPan
}) => {
  return (
    <div className="flex justify-center">
      <div 
        className="relative bg-gray-50 border rounded-lg overflow-hidden"
        style={{ 
          width: '800px', 
          height: '600px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={startPan}
        onMouseMove={pan}
        onMouseUp={endPan}
        onMouseLeave={endPan}
      >
        <div
          className="absolute"
          style={{
            transform: `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`,
            transformOrigin: 'top left',
            transition: 'transform 0.1s ease-out',
            width: '100%',
            height: '100%'
          }}
        >
          {/* Hallway */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-200 flex items-center justify-center text-sm font-medium">
            Hallway
          </div>
          
          {/* Entrance */}
          <div className="absolute bottom-0 left-[450px] w-[100px] h-5 bg-gray-300 flex items-center justify-center text-xs">
            Entrance
          </div>
          
          {/* Desks */}
          {seats.filter(seat => seat.position).map(seat => {
            const isSelected = selectedSeat === seat.id;
            const isBooked = seat.isBooked;
            
            return (
              <div
                key={seat.id}
                className={`absolute flex flex-col items-center justify-center border-2 cursor-pointer transition-colors rounded-md ${
                  isBooked 
                    ? "bg-red-100 border-red-300" 
                    : isSelected 
                      ? "bg-blue-500 border-blue-600 text-white" 
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                }`}
                style={{
                  left: `${seat.position?.x}px`,
                  top: `${seat.position?.y}px`,
                  width: `${seat.position?.width}px`,
                  height: `${seat.position?.height}px`,
                  transform: seat.position?.rotation ? `rotate(${seat.position.rotation}deg)` : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isBooked) onSeatSelect(seat.id);
                }}
                title={`${seat.row}${seat.number} ${seat.employeeName ? `- ${seat.employeeName}` : ''}${isBooked ? ' (Booked)' : ''}`}
              >
                <div className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>
                  {seat.row}{seat.number}
                </div>
                {seat.employeeName && (
                  <div className={`text-xs ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                    {seat.employeeName}
                  </div>
                )}
                <User className={`h-4 w-4 mt-1 ${
                  isBooked ? 'text-red-500' : 
                  isSelected ? 'text-white' : 
                  'text-gray-500'
                }`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BerlinOfficeLayout;
