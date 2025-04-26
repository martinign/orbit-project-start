import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Headers for CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle context extraction for projects
const extractProjectInfo = async (supabase: any, userId: string) => {
  try {
    // Get user's projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_number, protocol_title, Sponsor, status, description')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (projectsError) throw projectsError;

    // For each project, get the most recent tasks
    const projectsWithTasks = await Promise.all(
      projects.map(async (project: any) => {
        const { data: tasks, error: tasksError } = await supabase
          .from('project_tasks')
          .select('id, title, status, priority, due_date')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (tasksError) throw tasksError;

        // Get the most recent project notes
        const { data: notes, error: notesError } = await supabase
          .from('project_notes')
          .select('id, title, content')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (notesError) throw notesError;

        // Get team members
        const { data: teamMembers, error: teamError } = await supabase
          .from('project_team_members')
          .select('id, full_name, role')
          .eq('project_id', project.id)
          .limit(5);

        if (teamError) throw teamError;

        // Get events
        const { data: events, error: eventsError } = await supabase
          .from('project_events')
          .select('id, title, event_date, description')
          .eq('project_id', project.id)
          .order('event_date', { ascending: true })
          .limit(3);

        if (eventsError) throw eventsError;

        return {
          ...project,
          tasks: tasks || [],
          notes: notes || [],
          teamMembers: teamMembers || [],
          events: events || [],
        };
      })
    );

    return projectsWithTasks;
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
      .select('id, full_name, last_name, role, location')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Main serve function
serve(async (req) => {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

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
    const { message, history, userId } = await req.json();
    
    // Create Supabase client with admin privileges for data access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user context data
    const userProfile = await getUserProfile(supabaseAdmin, userId);
    const projectsContext = await extractProjectInfo(supabaseAdmin, userId);
    
    // Format context for OpenAI prompt
    let contextText = '';
    if (userProfile) {
      contextText += `User profile: ${JSON.stringify(userProfile)}\n\n`;
    }
    
    if (projectsContext?.length > 0) {
      contextText += `Projects information (limited to 5 recent projects with their tasks, notes, team members, and events):\n`;
      contextText += JSON.stringify(projectsContext);
    }
    
    // Prepare messages for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant for a project management tool. You have access to information about the user's projects, tasks, team members, notes, and events.
        
        Use this context information to provide helpful responses:
        
        ${contextText}
        
        When answering:
        - Be friendly and professional.
        - When the user asks about specific projects, tasks, or people, use the context to provide accurate information.
        - If information isn't in the context, acknowledge it's not available rather than making it up.
        - For project management advice, give practical, actionable recommendations.
        - If asked to create or modify data, explain that you can't directly change database records but can guide them on how to use the application to make those changes.`
      },
      ...history,
      { role: "user", content: message }
    ];

    // Call OpenAI API
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

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Error calling OpenAI API');
    }

    return new Response(
      JSON.stringify({ 
        message: data.choices[0]?.message?.content || 'No response from AI',
        usage: data.usage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
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
