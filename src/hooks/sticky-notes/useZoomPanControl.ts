import { useState, useCallback, useEffect, RefObject } from 'react';

export interface ZoomPanState {
  scale: number;
  translateX: number;
  translateY: number;
}

interface UseZoomPanControlProps {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  boardRef: RefObject<HTMLDivElement>;
}

export const useZoomPanControl = ({
  minScale = 0.5,
  maxScale = 2,
  scaleStep = 0.1,
  boardRef,
}: UseZoomPanControlProps) => {
  const [zoomPan, setZoomPan] = useState<ZoomPanState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
  
  // Reset the zoom and pan to initial state
  const resetZoomPan = useCallback(() => {
    setZoomPan({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, []);
  
  // Handle zoom in operation
  const zoomIn = useCallback(() => {
    setZoomPan(prev => ({
      ...prev,
      scale: Math.min(prev.scale + scaleStep, maxScale),
    }));
  }, [scaleStep, maxScale]);
  
  // Handle zoom out operation
  const zoomOut = useCallback(() => {
    setZoomPan(prev => ({
      ...prev,
      scale: Math.max(prev.scale - scaleStep, minScale),
    }));
  }, [scaleStep, minScale]);
  
  // Handle zoom to specific point with mouse position
  const zoomToPoint = useCallback((delta: number, clientX: number, clientY: number) => {
    if (!boardRef.current) return;
    
    // Get board element's position
    const boardRect = boardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the board
    const mouseX = clientX - boardRect.left;
    const mouseY = clientY - boardRect.top;
    
    // Calculate mouse position in the scaled/translated space
    const mouseXInBoard = (mouseX - zoomPan.translateX) / zoomPan.scale;
    const mouseYInBoard = (mouseY - zoomPan.translateY) / zoomPan.scale;
    
    // Calculate new scale
    const newScale = Math.max(
      minScale,
      Math.min(maxScale, zoomPan.scale + (delta * scaleStep))
    );
    
    // Calculate new translations to keep the point under the mouse
    const newTranslateX = mouseX - mouseXInBoard * newScale;
    const newTranslateY = mouseY - mouseYInBoard * newScale;
    
    setZoomPan({
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY,
    });
  }, [boardRef, zoomPan, minScale, maxScale, scaleStep]);
  
  // Start panning
  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    setStartPanPoint({ x: clientX, y: clientY });
  }, []);
  
  // Update pan position
  const updatePan = useCallback((clientX: number, clientY: number) => {
    if (!isPanning) return;
    
    const deltaX = clientX - startPanPoint.x;
    const deltaY = clientY - startPanPoint.y;
    
    setZoomPan(prev => ({
      ...prev,
      translateX: prev.translateX + deltaX,
      translateY: prev.translateY + deltaY,
    }));
    
    setStartPanPoint({ x: clientX, y: clientY });
  }, [isPanning, startPanPoint]);
  
  // End panning
  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);
  
  // Handle mouse wheel event for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    // Zoom in or out based on wheel direction
    const delta = e.deltaY < 0 ? 1 : -1;
    zoomToPoint(delta, e.clientX, e.clientY);
  }, [zoomToPoint]);
  
  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom in with + key
      if (e.key === '+' || e.key === '=') {
        zoomIn();
      }
      // Zoom out with - key
      else if (e.key === '-' || e.key === '_') {
        zoomOut();
      }
      // Reset with 0 key
      else if (e.key === '0') {
        resetZoomPan();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomIn, zoomOut, resetZoomPan]);
  
  return {
    zoomPan,
    isPanning,
    zoomIn,
    zoomOut,
    resetZoomPan,
    startPan,
    updatePan,
    endPan,
    handleWheel,
  };
};
