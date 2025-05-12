
import React from "react";

interface ZoomControlsProps {
  scale: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  showReferenceImage: boolean;
  toggleReferenceImage: () => void;
  showSeatList: boolean;
  toggleSeatList: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  zoomIn,
  zoomOut,
  resetZoom,
  showReferenceImage,
  toggleReferenceImage,
  showSeatList,
  toggleSeatList
}) => {
  return (
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
          onClick={toggleReferenceImage}
          className="ml-4 flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
          title="Show/hide reference floor plan"
        >
          {showReferenceImage ? 'Hide Floor Plan' : 'Show Floor Plan'}
        </button>
        
        <button
          onClick={toggleSeatList}
          className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
          title="Show/hide seat list"
        >
          {showSeatList ? 'Hide Seat List' : 'Show Seat List'}
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
