
import { useLayoutEffect, useState } from 'react';

export const useTextWidth = (texts: string[], fontStyle: string = '14px -apple-system, system-ui, sans-serif') => {
  const [maxWidth, setMaxWidth] = useState(0);

  useLayoutEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (context) {
      context.font = fontStyle;
      
      const maxTextWidth = texts.reduce((max, text) => {
        const width = context.measureText(text).width;
        return Math.max(max, width);
      }, 0);
      
      // Add padding (24px on each side)
      const totalWidth = Math.ceil(maxTextWidth) + 48;
      setMaxWidth(totalWidth);
    }
  }, [texts, fontStyle]);

  return maxWidth;
};
