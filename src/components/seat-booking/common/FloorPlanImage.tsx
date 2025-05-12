
import React, { useState } from "react";

const FloorPlanImage: React.FC = () => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="mb-4 flex justify-center">
      <div className="border rounded overflow-hidden max-w-full">
        {imageError ? (
          <div className="bg-gray-100 p-8 text-center">
            <p className="text-gray-600 mb-2">Floor plan image not found</p>
            <p className="text-sm text-gray-500">Please upload an image named "berlin-office-layout.png" to the public folder</p>
          </div>
        ) : (
          <img 
            src="/berlin-office-layout.png" 
            alt="Berlin Office Layout Reference" 
            className="max-w-full h-auto"
            onError={() => setImageError(true)}
          />
        )}
      </div>
    </div>
  );
};

export default FloorPlanImage;
