
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle context extraction for projects
const extractProjectInfo = async (supabase: any, userId: string) => {
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
            notes, is_gantt_task
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

        return {
          ...project,
          tasks: tasks || [],
          notes: notes || [],
          teamMembers: teamMembers || [],
          events: events || [],
          contacts: contacts || [],
          invitations: invitations || []
        };
      })
    );

    return projectsWithData;
  } catch (error) {
    console.error('Error extracting project info:', error);
    return [];
  }
};

// Get user profile info
const getUserProfile = async (supabase: any, userId: string) => {
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

// Main serve function
serve(async (req) => {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check for OpenAI API key
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          message: 'OpenAI API key not configured. Please add your API key to the Supabase secrets.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { message, history, userId } = await req.json();
    
    console.log('Request received with message:', message);
    console.log('History length:', history?.length || 0);
    console.log('Processing for userId:', userId);
    
    // Create Supabase client with admin privileges for data access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user context data
    console.log('Fetching user context for userId:', userId);
    const userProfile = await getUserProfile(supabaseAdmin, userId);
    const projectsContext = await extractProjectInfo(supabaseAdmin, userId);
    
    // Format context for OpenAI prompt
    let contextText = '';
    if (userProfile) {
      contextText += `User profile: ${JSON.stringify(userProfile)}\n\n`;
    }
    
    if (projectsContext?.length > 0) {
      contextText += `Projects information (${projectsContext.length} projects with their detailed information):\n`;
      contextText += JSON.stringify(projectsContext, null, 2);
    } else {
      contextText += 'No projects found for this user.';
    }
    
    console.log(`Context built with ${projectsContext?.length || 0} projects and user profile ${userProfile ? 'found' : 'not found'}`);
    
    // Prepare messages for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are an AI project management assistant that helps users manage their projects, tasks, and teams. You have access to detailed information about the user's projects, tasks, team members, notes, events, and contacts.
        
        Use this context information to provide helpful responses:
        
        ${contextText}
        
        When answering:
        - Be professional and friendly
        - When users ask about specific projects, tasks, or team members, use the context to provide accurate information
        - If information isn't in the context, acknowledge it's not available rather than making assumptions
        - For project management advice, give practical, actionable recommendations based on their actual project data
        - If asked about creating or modifying data, explain that while you can't directly change records, you can guide them on using the application
        - At the end of each response, ask if you can help with anything else.
        - When discussing tasks, notes, or events, reference specific items from their projects to make responses more relevant
        - Help identify patterns or potential issues in their project management based on the available data`
      },
      ...history,
      { role: "user", content: message }
    ];

    console.log('Calling OpenAI API with model: gpt-4o');
    try {
      // Call OpenAI API with proper error handling
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          temperature: 0.7,
          max_tokens: 800,
        })
      });

      const responseStatus = response.status;
      console.log('OpenAI API response status:', responseStatus);
      
      const data = await response.json();
      
      if (data.error) {
        console.error('OpenAI API error details:', data.error);
      }

      // Handle specific OpenAI API errors
      if (!response.ok) {
        console.error('OpenAI API error:', data);
        
        // Handle quota exceeded error specifically
        if (data.error?.type === 'insufficient_quota') {
          return new Response(
            JSON.stringify({ 
              message: "Your OpenAI API quota has been exceeded. Please check your billing details on the OpenAI dashboard."
            }),
            { 
              status: 429, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        // Handle other API errors
        return new Response(
          JSON.stringify({ 
            message: data.error?.message || 'Error calling OpenAI API',
            details: data.error
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('OpenAI API successful response received');
      console.log('Token usage:', data.usage);
      
      // Return successful response
      return new Response(
        JSON.stringify({ 
          message: data.choices[0]?.message?.content || 'No response from AI',
          usage: data.usage
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (openaiError) {
      console.error('Error calling OpenAI API:', openaiError);
      return new Response(
        JSON.stringify({ 
          message: 'Failed to get a response from OpenAI. Please try again later.',
          error: openaiError.message || 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('General error in Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        message: 'An unexpected error occurred',
        error: error.message || 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to create a Supabase client
const createClient = (supabaseUrl: string, serviceRoleKey: string) => {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          order: (column: string, { ascending }: { ascending: boolean }) => ({
            limit: (limit: number) => {
              return { data: [], error: null }; // Mock implementation for Deno
            },
            single: () => {
              return { data: {}, error: null }; // Mock implementation for Deno
            }
          }),
          limit: (limit: number) => {
            return { data: [], error: null }; // Mock implementation for Deno
          },
          single: () => {
            return { data: {}, error: null }; // Mock implementation for Deno
          }
        })
      })
    })
  };
};

