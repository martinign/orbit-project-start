
import { Circle, User, List, Image } from "lucide-react";
import { Seat } from "./types";
import { useState } from "react";
import { useZoomPanControl } from "@/hooks/useZoomPanControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SeatGridProps {
  seats: Seat[];
  selectedSeat: string | null;
  onSeatSelect: (seatId: string) => void;
  date: Date;
  officeId: string;
}

const SeatGrid = ({ seats, selectedSeat, onSeatSelect, date, officeId }: SeatGridProps) => {
  // Check if we should use a custom layout for this office
  const hasCustomLayout = officeId === 'o1'; // Berlin office
  
  const {
    scale,
    offsetX,
    offsetY,
    zoomIn,
    zoomOut,
    resetZoom,
    startPan,
    pan,
    endPan,
    isDragging
  } = useZoomPanControl();

  const [showReferenceImage, setShowReferenceImage] = useState(false);
  const [showSeatList, setShowSeatList] = useState(false);
  
  // Group seats by row for the seat list
  const seatsByRow = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});
  
  // Create sorted rows once to use in both layouts
  const sortedRowIds = Object.keys(seatsByRow).sort();
  
  if (hasCustomLayout) {
    // Custom Berlin office layout
    return (
      <div className="overflow-auto pb-4">
        <div className="flex justify-center mb-4">
          <div className="flex gap-2 items-center">
            <button 
              onClick={zoomOut}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              -
            </button>
            <button
              onClick={resetZoom}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              Reset
            </button>
            <button 
              onClick={zoomIn}
              className="bg-gray-200 px-2 py-1 rounded"
            >
              +
            </button>
            <span className="px-2 py-1">Zoom: {Math.round(scale * 100)}%</span>
            
            <button
              onClick={() => setShowReferenceImage(!showReferenceImage)}
              className="ml-4 flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
              title="Show/hide reference floor plan"
            >
              <Image className="h-4 w-4" />
              {showReferenceImage ? 'Hide Floor Plan' : 'Show Floor Plan'}
            </button>
            
            <button
              onClick={() => setShowSeatList(!showSeatList)}
              className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
              title="Show/hide seat list"
            >
              <List className="h-4 w-4" />
              {showSeatList ? 'Hide Seat List' : 'Show Seat List'}
            </button>
          </div>
        </div>
        
        {showSeatList && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle>All Seats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedRowIds.map(rowId => (
                  <div key={rowId} className="space-y-2">
                    <h3 className="font-medium">Row {rowId}</h3>
                    <ul className="space-y-1">
                      {seatsByRow[rowId]
                        .sort((a, b) => a.number - b.number)
                        .map(seat => (
                          <li key={seat.id} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${seat.isBooked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <span>
                              {seat.row}{seat.number} 
                              {seat.employeeName ? ` - ${seat.employeeName}` : ''} 
                              {seat.isBooked ? ' (Booked)' : ''}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {showReferenceImage && (
          <div className="mb-4 flex justify-center">
            <div className="border rounded overflow-hidden max-w-full">
              <img 
                src="/berlin-office-layout.png" 
                alt="Berlin Office Layout Reference" 
                className="max-w-full h-auto"
              />
            </div>
          </div>
        )}
        
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
        
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>
      </div>
    );
  }

  // Original grid layout for other offices
  // Group seats by row to create a grid layout
  const rows = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  // Sort rows and seats within rows
  // Use sortedRowIds instead of creating a new sortedRows variable
  sortedRowIds.forEach(row => {
    rows[row] = rows[row].sort((a, b) => a.number - b.number);
  });

  return (
    <div className="overflow-auto pb-4">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowSeatList(!showSeatList)}
          className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
          title="Show/hide seat list"
        >
          <List className="h-4 w-4" />
          {showSeatList ? 'Hide Seat List' : 'Show Seat List'}
        </button>
      </div>
      
      {showSeatList && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle>All Seats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedRowIds.map(rowId => (
                <div key={rowId} className="space-y-2">
                  <h3 className="font-medium">Row {rowId}</h3>
                  <ul className="space-y-1">
                    {rows[rowId].map(seat => (
                      <li key={seat.id} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${seat.isBooked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span>
                          {seat.row}{seat.number} 
                          {seat.employeeName ? ` - ${seat.employeeName}` : ''} 
                          {seat.isBooked ? ' (Booked)' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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
    </div>
  );
};

export default SeatGrid;
