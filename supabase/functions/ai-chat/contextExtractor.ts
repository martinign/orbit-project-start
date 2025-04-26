
import { createAdminClient } from './supabaseClient.ts';

export const getUserProfile = async (supabase: any, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, last_name, role,
        location, telephone, avatar_url
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    console.log(`Fetched profile for user ${userId}:`, data ? 'Found' : 'Not found');
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const getUserTemplates = async (supabase: any, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select(`
        id, title, description, created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5); // Limit to most recent templates

    if (error) {
      console.error('Error fetching user templates:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} templates for user ${userId}`);
    return data || [];
  } catch (error) {
    console.error('Error getting user templates:', error);
    return [];
  }
};

export const extractProjectInfo = async (supabase: any, userId: string) => {
  try {
    // Get user's projects with detailed information
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id, 
        project_number,
        protocol_title,
        protocol_number,
        Sponsor,
        status,
        description,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    console.log(`Found ${projects?.length || 0} projects for user ${userId}`);

    if (!projects || projects.length === 0) {
      return [];
    }

    // For each project, get related data in parallel for better performance
    const projectsWithData = await Promise.all(
      projects.map(async (project: any) => {
        const [
          tasksResult,
          notesResult, 
          teamMembersResult, 
          eventsResult, 
          contactsResult,
          invitationsResult
        ] = await Promise.all([
          // Get tasks with detailed information
          supabase.from('project_tasks')
            .select(`
              id, title, description, status, priority,
              due_date, start_date, duration_days,
              created_at, updated_at, is_gantt_task
            `)
            .eq('project_id', project.id)
            .order('created_at', { ascending: false })
            .limit(20), // Limit to most recent/important tasks

          // Get project notes
          supabase.from('project_notes')
            .select('id, title, content, created_at')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false })
            .limit(10), // Limit to most recent notes

          // Get team members with detailed info
          supabase.from('project_team_members')
            .select(`
              id, full_name, last_name, role,
              location, permission_level
            `)
            .eq('project_id', project.id),

          // Get project events
          supabase.from('project_events')
            .select(`
              id, title, description, event_date,
              created_at
            `)
            .eq('project_id', project.id)
            .order('event_date', { ascending: true })
            .limit(10), // Limit to most relevant events

          // Get project contacts
          supabase.from('project_contacts')
            .select(`
              id, full_name, last_name, role,
              company, email, telephone
            `)
            .eq('project_id', project.id)
            .limit(10), // Limit to most important contacts

          // Get project invitations
          supabase.from('project_invitations')
            .select(`
              id, status, permission_level,
              created_at
            `)
            .eq('project_id', project.id)
        ]);

        // Extract data from results
        const tasks = tasksResult.error ? [] : tasksResult.data || [];
        const notes = notesResult.error ? [] : notesResult.data || [];
        const teamMembers = teamMembersResult.error ? [] : teamMembersResult.data || [];
        const events = eventsResult.error ? [] : eventsResult.data || [];
        const contacts = contactsResult.error ? [] : contactsResult.data || [];
        const invitations = invitationsResult.error ? [] : invitationsResult.data || [];
        
        console.log(`Fetched data for project ${project.id}: ${tasks.length} tasks, ${notes.length} notes, ${teamMembers.length} team members, ${events.length} events, ${contacts.length} contacts, ${invitations.length} invitations`);

        // For active tasks, get their updates (but limit them to save tokens)
        let taskUpdates = [];
        let subtasks = [];
        
        if (tasks.length > 0) {
          // Only get updates for non-completed tasks
          const activeTasks = tasks.filter((task: any) => task.status !== 'completed');
          if (activeTasks.length > 0) {
            const activeTaskIds = activeTasks.map((task: any) => task.id);
            
            // Run these queries in parallel
            const [updatesResult, subtasksResult] = await Promise.all([
              // Get task updates
              supabase.from('project_task_updates')
                .select(`id, content, task_id, created_at`)
                .in('task_id', activeTaskIds)
                .order('created_at', { ascending: false })
                .limit(20), // Limit to most recent updates
              
              // Get subtasks
              supabase.from('project_subtasks')
                .select(`
                  id, title, description, status, assigned_to,
                  due_date, notes, parent_task_id
                `)
                .in('parent_task_id', activeTaskIds)
            ]);
            
            taskUpdates = updatesResult.error ? [] : updatesResult.data || [];
            subtasks = subtasksResult.error ? [] : subtasksResult.data || [];
          }
        }

        return {
          ...project,
          tasks,
          notes,
          teamMembers,
          events,
          contacts,
          invitations,
          taskUpdates,
          subtasks
        };
      })
    );

    return projectsWithData;
  } catch (error) {
    console.error('Error extracting project info:', error);
    return [];
  }
};
