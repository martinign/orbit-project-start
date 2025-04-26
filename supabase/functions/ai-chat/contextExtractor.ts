
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
      .order('created_at', { ascending: false });

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

    // For each project, get all related data
    const projectsWithData = await Promise.all(
      projects.map(async (project: any) => {
        // Get tasks with detailed information
        const { data: tasks, error: tasksError } = await supabase
          .from('project_tasks')
          .select(`
            id, title, description, status, priority,
            due_date, start_date, duration_days,
            notes, is_gantt_task, assigned_to
          `)
          .eq('project_id', project.id)
          .order('created_at', { ascending: false });

        if (tasksError) {
          console.error(`Error fetching tasks for project ${project.id}:`, tasksError);
          throw tasksError;
        }
        
        console.log(`Found ${tasks?.length || 0} tasks for project ${project.id}`);

        // Get project notes
        const { data: notes, error: notesError } = await supabase
          .from('project_notes')
          .select('id, title, content, created_at')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false });

        if (notesError) {
          console.error(`Error fetching notes for project ${project.id}:`, notesError);
          throw notesError;
        }
        
        console.log(`Found ${notes?.length || 0} notes for project ${project.id}`);

        // Get team members with detailed info
        const { data: teamMembers, error: teamError } = await supabase
          .from('project_team_members')
          .select(`
            id, full_name, last_name, role,
            location, permission_level
          `)
          .eq('project_id', project.id);

        if (teamError) {
          console.error(`Error fetching team members for project ${project.id}:`, teamError);
          throw teamError;
        }
        
        console.log(`Found ${teamMembers?.length || 0} team members for project ${project.id}`);

        // Get project events
        const { data: events, error: eventsError } = await supabase
          .from('project_events')
          .select(`
            id, title, description, event_date,
            created_at
          `)
          .eq('project_id', project.id)
          .order('event_date', { ascending: true });

        if (eventsError) {
          console.error(`Error fetching events for project ${project.id}:`, eventsError);
          throw eventsError;
        }
        
        console.log(`Found ${events?.length || 0} events for project ${project.id}`);

        // Get project contacts
        const { data: contacts, error: contactsError } = await supabase
          .from('project_contacts')
          .select(`
            id, full_name, last_name, role,
            company, email, telephone, location
          `)
          .eq('project_id', project.id);

        if (contactsError) {
          console.error(`Error fetching contacts for project ${project.id}:`, contactsError);
          throw contactsError;
        }
        
        console.log(`Found ${contacts?.length || 0} contacts for project ${project.id}`);

        // Get project invitations
        const { data: invitations, error: invitationsError } = await supabase
          .from('project_invitations')
          .select(`
            id, status, permission_level,
            created_at
          `)
          .eq('project_id', project.id);

        if (invitationsError) {
          console.error(`Error fetching invitations for project ${project.id}:`, invitationsError);
          throw invitationsError;
        }
        
        console.log(`Found ${invitations?.length || 0} invitations for project ${project.id}`);

        // Get Gantt tasks
        const { data: ganttTasks, error: ganttTasksError } = await supabase
          .from('gantt_tasks')
          .select(`
            id, duration_days, start_date, dependencies
          `)
          .eq('project_id', project.id);

        if (ganttTasksError) {
          console.error(`Error fetching Gantt tasks for project ${project.id}:`, ganttTasksError);
          throw ganttTasksError;
        }
        
        console.log(`Found ${ganttTasks?.length || 0} Gantt tasks for project ${project.id}`);

        // Get task updates
        const { data: taskUpdates, error: taskUpdatesError } = await supabase
          .from('project_task_updates')
          .select(`
            id, content, task_id, created_at
          `)
          .in('task_id', tasks?.map((t: any) => t.id) || []);

        if (taskUpdatesError && tasks?.length > 0) {
          console.error(`Error fetching task updates for project ${project.id}:`, taskUpdatesError);
          throw taskUpdatesError;
        }
        
        console.log(`Found ${taskUpdates?.length || 0} task updates for project ${project.id}`);

        // Get subtasks
        const { data: subtasks, error: subtasksError } = await supabase
          .from('project_subtasks')
          .select(`
            id, title, description, status, assigned_to,
            due_date, notes
          `)
          .in('parent_task_id', tasks?.map((t: any) => t.id) || []);

        if (subtasksError && tasks?.length > 0) {
          console.error(`Error fetching subtasks for project ${project.id}:`, subtasksError);
          throw subtasksError;
        }
        
        console.log(`Found ${subtasks?.length || 0} subtasks for project ${project.id}`);

        return {
          ...project,
          tasks: tasks || [],
          notes: notes || [],
          teamMembers: teamMembers || [],
          events: events || [],
          contacts: contacts || [],
          invitations: invitations || [],
          ganttTasks: ganttTasks || [],
          taskUpdates: taskUpdates || [],
          subtasks: subtasks || []
        };
      })
    );

    return projectsWithData;
  } catch (error) {
    console.error('Error extracting project info:', error);
    return [];
  }
};
