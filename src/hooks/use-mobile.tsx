
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => {
      setMatches(media.matches);
    };
    
    // Add listener for future changes
    media.addEventListener("change", listener);
    
    // Cleanup
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [matches, query]);

  return matches;
}

// Add the useIsMobile hook that's being imported in sidebar.tsx
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}
