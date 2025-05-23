
import { useState, useEffect } from 'react';
import { WorkdayCodeOption, fetchProjectWorkdayCodes } from '@/utils/workdayCombinedUtils';

interface Task {
  id: string;
  title: string;
  project_id: string;
}

export const useWorkdayCodeSelect = (
  parentTask: Task | null,
  initialWorkdayCodeId?: string
) => {
  const [workdayCodes, setWorkdayCodes] = useState<WorkdayCodeOption[]>([]);
  const [selectedWorkdayCode, setSelectedWorkdayCode] = useState<string>(initialWorkdayCodeId || 'none');

  // Load workday codes when parent task changes
  useEffect(() => {
    const loadWorkdayCodes = async () => {
      console.time('loadWorkdayCodesList');
      
      if (parentTask && parentTask.project_id) {
        const { data } = await fetchProjectWorkdayCodes(parentTask.project_id);
        setWorkdayCodes(data);
        console.log(`Loaded ${data.length} workday codes for project: ${parentTask.project_id}`);
      } else {
        setWorkdayCodes([]);
        console.log('No parent task or project ID available to load workday codes');
      }
      
      console.timeEnd('loadWorkdayCodesList');
    };

    loadWorkdayCodes();
  }, [parentTask]);

  // Initialize selected workday code
  useEffect(() => {
    if (initialWorkdayCodeId) {
      setSelectedWorkdayCode(initialWorkdayCodeId);
    } else {
      setSelectedWorkdayCode('none');
    }
  }, [initialWorkdayCodeId]);

  return {
    workdayCodes,
    selectedWorkdayCode,
    setSelectedWorkdayCode
  };
};
