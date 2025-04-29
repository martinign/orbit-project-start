
import { useState, useEffect } from 'react';
import { fetchWorkdayCodes, fetchProjectWorkdayCodes, WorkdayCodeOption } from '@/utils/workdayCombinedUtils';

export const useWorkdayCodes = (projectId?: string, taskProjectId?: string) => {
  const [workdayCodes, setWorkdayCodes] = useState<WorkdayCodeOption[]>([]);
  const [selectedWorkdayCode, setSelectedWorkdayCode] = useState<string>('none');

  // Load workday codes based on project context
  const loadWorkdayCodes = async (projectIdToUse?: string) => {
    if (projectIdToUse) {
      // Fetch only workday codes assigned to this project
      const { data } = await fetchProjectWorkdayCodes(projectIdToUse);
      setWorkdayCodes(data);
    } else {
      // Fallback to all workday codes if no project context
      const { data } = await fetchWorkdayCodes();
      setWorkdayCodes(data);
    }
  };

  // Initial load of workday codes
  useEffect(() => {
    const effectiveProjectId = projectId || taskProjectId;
    loadWorkdayCodes(effectiveProjectId);
  }, [projectId, taskProjectId]);

  // Reset selected workday code when codes change
  useEffect(() => {
    if (workdayCodes.length > 0 && selectedWorkdayCode !== 'none') {
      const codeExists = workdayCodes.some(code => code.id === selectedWorkdayCode);
      if (!codeExists) {
        setSelectedWorkdayCode('none');
      }
    }
  }, [workdayCodes, selectedWorkdayCode]);

  return {
    workdayCodes,
    selectedWorkdayCode,
    setSelectedWorkdayCode,
    loadWorkdayCodes
  };
};
