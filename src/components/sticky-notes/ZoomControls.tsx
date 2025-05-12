
import React from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { ZoomPanState } from "@/hooks/sticky-notes/useZoomPanControl";

interface ZoomControlsProps {
  zoomPan: ZoomPanState;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomPan,
  zoomIn,
  zoomOut,
  resetZoom,
}) => {
  const zoomPercentage = Math.round(zoomPan.scale * 100);
  
  return (
    <div className="flex items-center space-x-2 bg-white bg-opacity-80 rounded-md shadow-sm px-2 py-1 border border-gray-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomOut}
        disabled={zoomPercentage <= 50}
        className="h-8 w-8 p-0"
        title="Zoom Out (- key)"
      >
        <ZoomOut className="h-4 w-4" />
        <span className="sr-only">Zoom Out</span>
      </Button>
      
      <span className="text-xs font-medium min-w-[40px] text-center">
        {zoomPercentage}%
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomIn}
        disabled={zoomPercentage >= 200}
        className="h-8 w-8 p-0"
        title="Zoom In (+ key)"
      >
        <ZoomIn className="h-4 w-4" />
        <span className="sr-only">Zoom In</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={resetZoom}
        className="h-8 w-8 p-0 ml-1"
        title="Reset Zoom (0 key)"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="sr-only">Reset Zoom</span>
      </Button>
    </div>
  );
};
