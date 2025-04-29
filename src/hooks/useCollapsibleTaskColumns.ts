
import { useState, useEffect } from 'react';

interface CollapsibleState {
  [columnId: string]: boolean;
}

export const useCollapsibleTaskColumns = (projectId: string) => {
  const storageKey = `task-columns-state-${projectId}`;
  
  const getInitialState = (): CollapsibleState => {
    try {
      const savedState = localStorage.getItem(storageKey);
      return savedState ? JSON.parse(savedState) : {};
    } catch (error) {
      console.error('Error loading column state from localStorage:', error);
      return {};
    }
  };
  
  const [collapsedState, setCollapsedState] = useState<CollapsibleState>(getInitialState);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(collapsedState));
    } catch (error) {
      console.error('Error saving column state to localStorage:', error);
    }
  }, [collapsedState, storageKey]);
  
  const isColumnCollapsed = (columnId: string): boolean => {
    // If there's no state for this column yet, default to collapsed (true)
    return columnId in collapsedState ? collapsedState[columnId] : true;
  };
  
  const toggleColumnCollapsed = (columnId: string) => {
    console.log(`Toggling column ${columnId}, current state:`, collapsedState[columnId]);
    setCollapsedState(prevState => {
      const newState = {
        ...prevState,
        [columnId]: !(prevState[columnId] ?? true)
      };
      console.log(`New state for column ${columnId}:`, newState[columnId]);
      return newState;
    });
  };
  
  return {
    isColumnCollapsed,
    toggleColumnCollapsed
  };
};
