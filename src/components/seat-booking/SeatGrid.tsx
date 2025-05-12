
import React, { useState } from "react";
import { List, Image } from "lucide-react";
import { Seat } from "./types";
import { useZoomPanControl } from "@/hooks/useZoomPanControl";
import BerlinOfficeLayout from "./layouts/BerlinOfficeLayout";
import StandardLayout from "./layouts/StandardLayout";
import ZoomControls from "./controls/ZoomControls";
import SeatLegend from "./common/SeatLegend";
import SeatList from "./common/SeatList";
import FloorPlanImage from "./common/FloorPlanImage";

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
  
  const toggleReferenceImage = () => setShowReferenceImage(!showReferenceImage);
  const toggleSeatList = () => setShowSeatList(!showSeatList);
  
  if (hasCustomLayout) {
    // Custom Berlin office layout
    return (
      <div className="overflow-auto pb-4">
        <ZoomControls
          scale={scale}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
          showReferenceImage={showReferenceImage}
          toggleReferenceImage={toggleReferenceImage}
          showSeatList={showSeatList}
          toggleSeatList={toggleSeatList}
        />
        
        {showSeatList && <SeatList seatsByRow={seatsByRow} sortedRowIds={sortedRowIds} />}
        
        {showReferenceImage && <FloorPlanImage />}
        
        <BerlinOfficeLayout
          seats={seats}
          selectedSeat={selectedSeat}
          onSeatSelect={onSeatSelect}
          scale={scale}
          offsetX={offsetX}
          offsetY={offsetY}
          isDragging={isDragging}
          startPan={startPan}
          pan={pan}
          endPan={endPan}
        />
        
        <SeatLegend />
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

  // Sort seats within rows
  sortedRowIds.forEach(row => {
    rows[row] = rows[row].sort((a, b) => a.number - b.number);
  });

  return (
    <div className="overflow-auto pb-4">
      <div className="mb-4 flex justify-end">
        <button
          onClick={toggleSeatList}
          className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
          title="Show/hide seat list"
        >
          <List className="h-4 w-4" />
          {showSeatList ? 'Hide Seat List' : 'Show Seat List'}
        </button>
      </div>
      
      {showSeatList && <SeatList seatsByRow={seatsByRow} sortedRowIds={sortedRowIds} />}
      
      <StandardLayout
        rows={rows}
        sortedRowIds={sortedRowIds}
        selectedSeat={selectedSeat}
        onSeatSelect={onSeatSelect}
      />
    </div>
  );
};

export default SeatGrid;
