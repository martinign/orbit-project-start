
import React from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset
}) => {
  // Format scale percentage
  const percentage = Math.round(scale * 100);
  
  return (
    <div className="flex items-center gap-1 bg-white rounded-md border shadow-sm p-1">
      <Button
        variant="ghost" 
        size="icon" 
        onClick={onZoomOut}
        disabled={percentage <= 50}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
        <span className="sr-only">Zoom Out</span>
      </Button>
      
      <div className="mx-1 text-xs font-medium min-w-12 text-center">
        {percentage}%
      </div>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onZoomIn}
        disabled={percentage >= 200}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
        <span className="sr-only">Zoom In</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onReset}
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="sr-only">Reset View</span>
      </Button>
    </div>
  );
};
