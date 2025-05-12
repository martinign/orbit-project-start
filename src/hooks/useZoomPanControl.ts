
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
    // Only start panning with middle mouse button or if holding the spacebar
    if (e.button === 1 || e.altKey) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, []);
  
  const pan = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setState(prev => ({
      ...prev,
      offsetX: prev.offsetX + (e.clientX - dragStart.x),
      offsetY: prev.offsetY + (e.clientY - dragStart.y)
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);
  
  const endPan = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Handle wheel zoom events
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newScale = Math.max(MIN_SCALE, Math.min(state.scale + delta, MAX_SCALE));
      
      // Calculate cursor position relative to the center of the board
      // This helps maintain zoom position under the cursor
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate new offsets to zoom toward cursor position
      const ratio = 1 - newScale / state.scale;
      const newOffsetX = state.offsetX + (x - state.offsetX) * ratio;
      const newOffsetY = state.offsetY + (y - state.offsetY) * ratio;
      
      setState({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      });
    }
  }, [state.scale, state.offsetX, state.offsetY]);
  
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
    endPan,
    handleWheel
  };
};
