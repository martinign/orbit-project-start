
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
    // Default to collapsed (true) if state doesn't exist for this column
    return columnId in collapsedState ? collapsedState[columnId] : true;
  };
  
  const toggleColumnCollapsed = (columnId: string) => {
    setCollapsedState(prevState => ({
      ...prevState,
      [columnId]: !(prevState[columnId] ?? true)
    }));
  };
  
  return {
    isColumnCollapsed,
    toggleColumnCollapsed
  };
};
