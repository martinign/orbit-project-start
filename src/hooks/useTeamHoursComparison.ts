
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTeamAssignedHours } from './useTeamAssignedHours';
import { useWorkdayTimeEntries } from './useWorkdayTimeEntries';
import { useTeamMembers } from './useTeamMembers';
import { format, parse, isValid } from 'date-fns';

interface TeamHoursComparisonItem {
  userId: string;
  memberName: string;
  assignedHours: number;
  workedHours: number;
  variance: number;
}

interface SummaryStats {
  totalAssigned: number;
  totalWorked: number;
  totalVariance: number;
}

export interface VarianceBadgeProps {
  variant: "outline" | "destructive" | "default";
  className?: string;
  children: string;
}

export function useTeamHoursComparison(projectId: string, monthFilter: string = '') {
  const { teamAssignedHours, isLoading: assignedHoursLoading } = useTeamAssignedHours(projectId);
  const { timeEntries, isLoading: timeEntriesLoading } = useWorkdayTimeEntries(projectId);
  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembers(projectId);
  
  // Extract all available months from assigned hours and time entries
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    
    // Add months from assigned hours
    teamAssignedHours.forEach(entry => {
      const monthKey = entry.month.substring(0, 7); // YYYY-MM format
      months.add(monthKey);
    });
    
    // Add months from time entries
    timeEntries.forEach(entry => {
      // Make sure date is valid before trying to format it
      if (entry.date && isValid(new Date(entry.date))) {
        const monthKey = format(new Date(entry.date), 'yyyy-MM');
        months.add(monthKey);
      }
    });
    
    // Sort months in descending order (newest first)
    return Array.from(months).sort().reverse();
  }, [teamAssignedHours, timeEntries]);
  
  // Compute the comparison data
  const teamHoursComparison = useMemo(() => {
    if (!teamMembers || teamMembersLoading) return [];
    
    // Create a map to store the comparison for each team member
    const comparisonMap = new Map<string, TeamHoursComparisonItem>();
    
    // Initialize with team members
    teamMembers.forEach(member => {
      comparisonMap.set(member.user_id, {
        userId: member.user_id,
        memberName: member.full_name,
        assignedHours: 0,
        workedHours: 0,
        variance: 0
      });
    });
    
    // Add assigned hours
    teamAssignedHours.forEach(entry => {
      const entryMonth = entry.month.substring(0, 7); // YYYY-MM format
      
      // Filter by month if specified
      if (monthFilter && entryMonth !== monthFilter) {
        return;
      }
      
      const memberData = comparisonMap.get(entry.user_id);
      if (memberData) {
        memberData.assignedHours += Number(entry.assigned_hours);
        memberData.variance = memberData.assignedHours - memberData.workedHours;
        comparisonMap.set(entry.user_id, memberData);
      }
    });
    
    // Add worked hours
    timeEntries.forEach(entry => {
      // Make sure date is valid before trying to format it
      if (!entry.date || !isValid(new Date(entry.date))) {
        return;
      }
      
      const entryMonth = format(new Date(entry.date), 'yyyy-MM');
      
      // Filter by month if specified
      if (monthFilter && entryMonth !== monthFilter) {
        return;
      }
      
      const memberData = comparisonMap.get(entry.user_id);
      if (memberData) {
        memberData.workedHours += Number(entry.hours);
        memberData.variance = memberData.assignedHours - memberData.workedHours;
        comparisonMap.set(entry.user_id, memberData);
      }
    });
    
    // Convert map to array and filter out entries with no assigned or worked hours
    return Array.from(comparisonMap.values())
      .filter(item => item.assignedHours > 0 || item.workedHours > 0)
      .sort((a, b) => b.variance - a.variance);
  }, [teamMembers, teamAssignedHours, timeEntries, monthFilter, teamMembersLoading]);
  
  // Calculate summary statistics
  const summaryStats = useMemo<SummaryStats>(() => {
    const totalAssigned = teamHoursComparison.reduce((sum, item) => sum + item.assignedHours, 0);
    const totalWorked = teamHoursComparison.reduce((sum, item) => sum + item.workedHours, 0);
    
    return {
      totalAssigned,
      totalWorked,
      totalVariance: totalAssigned - totalWorked
    };
  }, [teamHoursComparison]);
  
  // Helper function to get variance color
  const getVarianceColor = (variance: number): string => {
    if (variance === 0) return 'text-gray-700';
    if (Math.abs(variance) <= 2) return 'text-amber-500';
    return variance > 0 ? 'text-green-600' : 'text-red-600';
  };
  
  // Helper function to get variance badge properties rather than JSX directly
  const getVarianceBadge = (variance: number): VarianceBadgeProps => {
    if (variance === 0) {
      return {
        variant: "outline",
        children: "Matched"
      };
    }
    
    if (Math.abs(variance) <= 2) {
      return {
        variant: "outline",
        className: "bg-amber-50 text-amber-700 hover:bg-amber-50",
        children: "Minor Variance"
      };
    }
    
    return variance > 0 
      ? {
          variant: "outline",
          className: "bg-green-50 text-green-700 hover:bg-green-50",
          children: "Under Hours"
        }
      : {
          variant: "destructive",
          children: "Over Hours"
        };
  };
  
  return {
    teamHoursComparison,
    isLoading: assignedHoursLoading || timeEntriesLoading || teamMembersLoading,
    getVarianceColor,
    getVarianceBadge,
    summaryStats,
    availableMonths
  };
}
