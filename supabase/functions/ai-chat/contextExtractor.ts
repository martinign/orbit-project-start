import { createAdminClient } from './supabaseClient.ts';
import { extractFileContent } from './fileContentExtractor.ts';

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

export const getProjectAttachments = async (supabase: any, projectIds: string[]) => {
  if (!projectIds || projectIds.length === 0) {
    return [];
  }
  
  try {
    // Get all project attachments (both repository files and other attachments)
    const { data, error } = await supabase
      .from('project_attachments')
      .select(`
        id, 
        file_name, 
        file_path, 
        file_type, 
        file_size, 
        created_at, 
        created_by,
        project_id,
        related_type,
        related_id
      `)
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })
      .limit(30); // Limit to most recent files
    
    if (error) {
      console.error('Error fetching project attachments:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} attachments for ${projectIds.length} projects`);
    
    // Get project notes to match attachment context
    const { data: notesData, error: notesError } = await supabase
      .from('project_notes')
      .select(`
        id,
        title,
        content,
        file_path,
        file_name,
        file_type,
        file_size,
        project_id
      `)
      .in('project_id', projectIds)
      .not('file_path', 'is', null);
      
    if (notesError) {
      console.error('Error fetching notes with attachments:', notesError);
    }
    
    // Create a map of note ID to note details for quick lookup
    const notesMap = {};
    if (notesData) {
      notesData.forEach(note => {
        if (note.id) {
          notesMap[note.id] = note;
        }
      });
    }
    
    // Enhance attachments with URLs and associated note context
    const enhancedAttachments = await Promise.all(data.map(async (attachment) => {
      // Generate public URL for the attachment
      const publicUrl = supabase.storage
        .from('project-attachments')
        .getPublicUrl(attachment.file_path).data.publicUrl;
      
      // Check if this attachment is associated with a note
      let associatedNote = null;
      if (attachment.related_type === 'note' && attachment.related_id && notesMap[attachment.related_id]) {
        associatedNote = notesMap[attachment.related_id];
      }
      
      // Extract file content for text-based files
      let fileContent = null;
      if (attachment.file_type && attachment.file_size) {
        // Only extract content for files under the size limit
        fileContent = await extractFileContent(
          publicUrl,
          attachment.file_type,
          attachment.file_name,
          attachment.file_size
        );
      }
      
      return {
        ...attachment,
        publicUrl,
        fileContent,
        associatedNote: associatedNote ? {
          title: associatedNote.title,
          content: associatedNote.content
        } : null
      };
    }));
    
    console.log(`Enhanced ${enhancedAttachments.length} attachments with URLs, content and context`);
    return enhancedAttachments;
  } catch (error) {
    console.error('Error getting project attachments:', error);
    return [];
  }
};

export const extractProjectInfo = async (supabase: any, userId: string) => {
  try {
    // Get projects where user is the owner
    const { data: ownedProjects, error: ownedProjectsError } = await supabase
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

    if (ownedProjectsError) {
      console.error('Error fetching owned projects:', ownedProjectsError);
      throw ownedProjectsError;
    }

    // Get projects where user is a team member
    const { data: teamProjects, error: teamProjectsError } = await supabase
      .from('project_team_members')
      .select(`
        projects:project_id (
          id, 
          project_number,
          protocol_title,
          protocol_number,
          Sponsor,
          status,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId);

    if (teamProjectsError) {
      console.error('Error fetching team projects:', teamProjectsError);
      throw teamProjectsError;
    }

    // Get projects where user has accepted invitations
    const { data: invitedProjects, error: invitedProjectsError } = await supabase
      .from('member_invitations')
      .select(`
        projects:member_project_id (
          id, 
          project_number,
          protocol_title,
          protocol_number,
          Sponsor,
          status,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('invitation_recipient_id', userId)
      .eq('invitation_status', 'accepted');

    if (invitedProjectsError) {
      console.error('Error fetching invited projects:', invitedProjectsError);
      throw invitedProjectsError;
    }

    // Combine all projects and remove duplicates
    const allProjects = [
      ...ownedProjects,
      ...(teamProjects?.map(item => item.projects) || []),
      ...(invitedProjects?.map(item => item.projects) || [])
    ].filter(Boolean);

    // Remove duplicates by project ID
    const uniqueProjects = Array.from(
      new Map(allProjects.map(project => [project.id, project])).values()
    );

    console.log(`Found ${uniqueProjects?.length || 0} total accessible projects for user ${userId}`);

    if (!uniqueProjects || uniqueProjects.length === 0) {
      return [];
    }

    // Get all project IDs for attachment fetching
    const projectIds = uniqueProjects.map((project: any) => project.id);
    
    // Fetch attachments for all projects in a single query
    const projectAttachments = await getProjectAttachments(supabase, projectIds);
    
    // Group attachments by project ID for easier assignment
    const attachmentsByProject = projectAttachments.reduce((acc: {[key: string]: any[]}, attachment) => {
      const projectId = attachment.project_id;
      if (!acc[projectId]) {
        acc[projectId] = [];
      }
      acc[projectId].push(attachment);
      return acc;
    }, {});

    // For each project, get related data in parallel for better performance
    const projectsWithData = await Promise.all(
      uniqueProjects.map(async (project: any) => {
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
            .select('id, title, content, created_at, file_path, file_name, file_type, file_size')
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
        
        // Add attachments to the project
        const attachments = attachmentsByProject[project.id] || [];
        
        console.log(`Fetched data for project ${project.id}: ${tasks.length} tasks, ${notes.length} notes, ${teamMembers.length} team members, ${events.length} events, ${contacts.length} contacts, ${invitations.length} invitations, ${attachments.length} attachments`);

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
          subtasks,
          attachments
        };
      })
    );

    return projectsWithData;
  } catch (error) {
    console.error('Error extracting project info:', error);
    return [];
  }
};
