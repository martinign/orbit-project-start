
import { useState, useEffect } from 'react';

interface CollapsibleState {
  [columnId: string]: boolean;
}

interface ExpandedTaskCards {
  [taskId: string]: boolean;
}

export const useCollapsibleTaskColumns = (projectId: string) => {
  const columnsStorageKey = `task-columns-state-${projectId}`;
  const cardsStorageKey = `task-cards-state-${projectId}`;
  
  const getInitialColumnsState = (): CollapsibleState => {
    try {
      const savedState = localStorage.getItem(columnsStorageKey);
      if (savedState) {
        return JSON.parse(savedState);
      }
      
      // If no saved state, initialize all columns as collapsed by default
      return {};
    } catch (error) {
      console.error('Error loading column state from localStorage:', error);
      return {};
    }
  };
  
  const getInitialCardsState = (): ExpandedTaskCards => {
    try {
      const savedState = localStorage.getItem(cardsStorageKey);
      if (savedState) {
        return JSON.parse(savedState);
      }
      
      // Initialize all cards as collapsed
      return {};
    } catch (error) {
      console.error('Error loading cards state from localStorage:', error);
      return {};
    }
  };
  
  const [collapsedState, setCollapsedState] = useState<CollapsibleState>(getInitialColumnsState);
  const [expandedCards, setExpandedCards] = useState<ExpandedTaskCards>(getInitialCardsState);
  
  useEffect(() => {
    try {
      localStorage.setItem(columnsStorageKey, JSON.stringify(collapsedState));
    } catch (error) {
      console.error('Error saving column state to localStorage:', error);
    }
  }, [collapsedState, columnsStorageKey]);
  
  useEffect(() => {
    try {
      localStorage.setItem(cardsStorageKey, JSON.stringify(expandedCards));
    } catch (error) {
      console.error('Error saving cards state to localStorage:', error);
    }
  }, [expandedCards, cardsStorageKey]);
  
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
  
  const isCardExpanded = (taskId: string): boolean => {
    // Default to collapsed
    return expandedCards[taskId] === true;
  };
  
  const toggleCardExpanded = (taskId: string) => {
    setExpandedCards(prevState => ({
      ...prevState,
      [taskId]: !prevState[taskId]
    }));
  };
  
  return {
    isColumnCollapsed,
    toggleColumnCollapsed,
    isCardExpanded,
    toggleCardExpanded
  };
};
