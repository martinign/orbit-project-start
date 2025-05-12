
import React from "react";

const SeatLegend: React.FC = () => {
  return (
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
  );
};

export default SeatLegend;
