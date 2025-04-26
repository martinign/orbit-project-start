
import { useState, useEffect } from 'react';

interface UseGanttColumnWidthProps {
  visibleDatesCount: number;
  taskListWidth?: number;
  minColumnWidth?: number;
}

export const useGanttColumnWidth = ({
  visibleDatesCount,
  taskListWidth = 200,
  minColumnWidth = 60
}: UseGanttColumnWidthProps) => {
  const [columnWidth, setColumnWidth] = useState(minColumnWidth);

  useEffect(() => {
    const calculateColumnWidth = () => {
      const availableWidth = window.innerWidth - taskListWidth - 48; // 48px for padding/scrollbar
      const calculatedWidth = Math.floor(availableWidth / visibleDatesCount);
      setColumnWidth(Math.max(calculatedWidth, minColumnWidth));
    };

    calculateColumnWidth();
    window.addEventListener('resize', calculateColumnWidth);
    
    return () => {
      window.removeEventListener('resize', calculateColumnWidth);
    };
  }, [visibleDatesCount, taskListWidth, minColumnWidth]);

  return columnWidth;
};
