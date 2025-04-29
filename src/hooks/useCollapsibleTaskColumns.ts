
import { useState, useEffect } from 'react';

interface CollapsibleState {
  [columnId: string]: boolean;
}

export const useCollapsibleTaskColumns = (projectId: string) => {
  const storageKey = `task-columns-state-${projectId}`;
  
  const getInitialState = (): CollapsibleState => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        return JSON.parse(savedState);
      }
      
      // If no saved state, initialize all columns as collapsed by default
      const initialState: CollapsibleState = {};
      return initialState;
    } catch (error) {
      console.error('Error loading column state from localStorage:', error);
      return {};
    }
  };
  
  const [collapsedState, setCollapsedState] = useState<CollapsibleState>(getInitialState);
  
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(collapsedState));
    } catch (error) {
      console.error('Error saving column state to localStorage:', error);
    }
  }, [collapsedState, storageKey]);
  
  const isColumnCollapsed = (columnId: string): boolean => {
    // If there's no state for this column yet, default to collapsed
    return collapsedState[columnId] !== false;
  };
  
  const toggleColumnCollapsed = (columnId: string) => {
    console.log(`Toggling column ${columnId}`);
    setCollapsedState(prevState => {
      const currentlyCollapsed = isColumnCollapsed(columnId);
      console.log(`Current state: ${currentlyCollapsed}, new state: ${!currentlyCollapsed}`);
      return {
        ...prevState,
        [columnId]: !currentlyCollapsed
      };
    });
  };
  
  return {
    isColumnCollapsed,
    toggleColumnCollapsed
  };
};
