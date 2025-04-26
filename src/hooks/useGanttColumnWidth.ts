
import { useState, useEffect } from 'react';

interface UseGanttColumnWidthProps {
  totalDatesCount: number;
  taskListWidth?: number;
  minColumnWidth?: number;
}

export const useGanttColumnWidth = ({
  totalDatesCount,
  taskListWidth = 200,
  minColumnWidth = 60
}: UseGanttColumnWidthProps) => {
  const [columnWidth, setColumnWidth] = useState(minColumnWidth);

  useEffect(() => {
    const calculateColumnWidth = () => {
      const availableWidth = window.innerWidth - taskListWidth - 48; // 48px for padding/scrollbar
      const calculatedWidth = Math.floor(availableWidth / totalDatesCount);
      setColumnWidth(Math.max(calculatedWidth, minColumnWidth));
    };

    calculateColumnWidth();
    window.addEventListener('resize', calculateColumnWidth);
    
    return () => {
      window.removeEventListener('resize', calculateColumnWidth);
    };
  }, [totalDatesCount, taskListWidth, minColumnWidth]);

  return columnWidth;
};
