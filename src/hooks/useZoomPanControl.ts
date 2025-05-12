
import { useState, useCallback, useEffect } from 'react';

interface ZoomPanState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const useZoomPanControl = (initialScale = 1) => {
  const [state, setState] = useState<ZoomPanState>({
    scale: initialScale,
    offsetX: 0,
    offsetY: 0
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Min and max scale limits
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 2;
  const ZOOM_STEP = 0.1;
  
  const zoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      scale: Math.min(prev.scale + ZOOM_STEP, MAX_SCALE)
    }));
  }, []);
  
  const zoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      scale: Math.max(prev.scale - ZOOM_STEP, MIN_SCALE)
    }));
  }, []);
  
  const resetZoom = useCallback(() => {
    setState({
      scale: 1,
      offsetX: 0,
      offsetY: 0
    });
  }, []);
  
  const startPan = useCallback((e: React.MouseEvent) => {
    // Only start panning with middle mouse button or if alt key is pressed
    if (e.button === 0) { // Changed to left mouse button for easier panning
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);
  
  const pan = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setState(prev => ({
      ...prev,
      offsetX: prev.offsetX + (e.clientX - dragStart.x) / prev.scale,
      offsetY: prev.offsetY + (e.clientY - dragStart.y) / prev.scale
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);
  
  const endPan = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  return {
    scale: state.scale,
    offsetX: state.offsetX,
    offsetY: state.offsetY,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    startPan,
    pan,
    endPan
  };
};
