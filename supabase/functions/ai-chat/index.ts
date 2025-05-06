
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createAdminClient } from './supabaseClient.ts';
import { extractProjectInfo, getUserProfile, getUserTemplates } from './contextExtractor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Global cache for context data with TTL
const contextCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get context data with caching
async function getContextWithCache(supabaseAdmin: any, userId: string, forceRefresh = false) {
  const cacheKey = `user_${userId}`;
  const now = Date.now();
  
  // Check if we have a valid cache entry and not forcing refresh
  if (!forceRefresh && contextCache.has(cacheKey)) {
    const cachedData = contextCache.get(cacheKey);
    if (now < cachedData.expiry) {
      console.log('Using cached context data for userId:', userId);
      return cachedData.data;
    }
  }
  
  // If no valid cache or forcing refresh, fetch fresh data
  console.log('Fetching fresh context data for userId:', userId);
  
  // Fetch all context data in parallel
  const [userProfile, projectsContext, userTemplates] = await Promise.all([
    getUserProfile(supabaseAdmin, userId),
    extractProjectInfo(supabaseAdmin, userId),
    getUserTemplates(supabaseAdmin, userId)
  ]);
  
  // Format context for OpenAI prompt
  let contextText = '';
  if (userProfile) {
    contextText += `User profile: ${JSON.stringify(userProfile)}\n\n`;
  }
  
  if (projectsContext?.length > 0) {
    // Only include essential project data to reduce token usage
    const essentialProjectData = projectsContext.map(project => {
      // Process notes with attachments to make information more accessible
      const notesWithFiles = (project.notes || [])
        .filter(note => note.file_path && note.file_name)
        .map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          file_name: note.file_name,
          file_type: note.file_type,
          file_size: note.file_size,
        }));
      
      // Extract a limited set of files for context
      const fileAttachments = (project.attachments || []).map(attachment => {
        const fileDetails = {
          id: attachment.id,
          file_name: attachment.file_name,
          file_type: attachment.file_type,
          file_size: attachment.file_size,
          related_type: attachment.related_type || 'repository',
          created_at: attachment.created_at,
          publicUrl: attachment.publicUrl
        };
        
        // Add associated note context if available
        if (attachment.associatedNote) {
          fileDetails.note_title = attachment.associatedNote.title;
          fileDetails.note_content = attachment.associatedNote.content;
        }
        
        return fileDetails;
      }).slice(0, 15); // Increased limit to 15 files per project
      
      return {
        id: project.id,
        project_number: project.project_number,
        protocol_title: project.protocol_title,
        protocol_number: project.protocol_number,
        Sponsor: project.Sponsor,
        status: project.status,
        description: project.description,
        // Include only active tasks and recent updates to reduce context size
        tasks: (project.tasks || []).filter(task => task.status !== 'completed').slice(0, 10),
        notes: (project.notes || []).slice(0, 5),
        notesWithFiles: notesWithFiles,
        teamMembers: project.teamMembers,
        // Only include recent or upcoming events
        events: (project.events || []).filter(event => {
          const eventDate = new Date(event.event_date);
          const now = new Date();
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          const oneMonthAhead = new Date();
          oneMonthAhead.setMonth(now.getMonth() + 1);
          return eventDate >= oneMonthAgo && eventDate <= oneMonthAhead;
        }),
        contacts: project.contacts,
        files: fileAttachments
      };
    });
    
    contextText += `Projects information (${essentialProjectData.length} projects with their detailed information):\n`;
    contextText += JSON.stringify(essentialProjectData, null, 2);
  } else {
    contextText += 'No projects found for this user.';
  }

  if (userTemplates?.length > 0) {
    contextText += `\n\nTask Templates: ${JSON.stringify(userTemplates, null, 2)}`;
  }
  
  const contextData = {
    userProfile,
    projectsContext,
    userTemplates,
    contextText
  };
  
  // Store in cache with expiry
  contextCache.set(cacheKey, {
    data: contextData,
    expiry: now + CACHE_TTL
  });
  
  return contextData;
}

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

    const { message, history, userId, forceRefreshContext } = await req.json();
    
    console.log('Request received with message length:', message.length);
    console.log('History length:', history?.length || 0);
    console.log('Processing for userId:', userId);
    console.log('Force refresh context:', forceRefreshContext || false);
    
    // Create Supabase client with admin privileges for data access
    const supabaseAdmin = createAdminClient();

    // Get user context data with caching
    console.log('Getting user context for userId:', userId);
    const contextData = await getContextWithCache(supabaseAdmin, userId, forceRefreshContext);
    const { contextText } = contextData;
    
    console.log('Context built successfully');
    
    // Limit history to reduce token usage - only keep last 10 messages or fewer
    const recentHistory = history.slice(-10);
    
    // Prepare messages for OpenAI
    const systemPrompt = `You are an AI project management assistant that helps users manage their projects, tasks, and teams. You have access to detailed information about the user's projects, tasks, team members, notes, events, contacts, and project files.
    
    Use this context information to provide helpful responses:
    
    ${contextText}
    
    When answering:
    - Be professional, friendly and concise
    - Respond quickly with short, helpful answers
    - When users ask about specific projects, tasks, team members, or files, use the context to provide accurate information
    - For questions about files, you can see metadata about them including file names, types, sizes, and URLs
    - If a user asks about a specific protocol, clinical study, document or file, carefully search through the notes and files in the context to find information about it
    - If information isn't in the context, acknowledge it's not available rather than making assumptions
    - For project management advice, give practical, actionable recommendations based on their actual project data
    - If asked about creating or modifying data, explain that while you can't directly change records, you can guide them on using the application
    - When a user asks about files, attachments, documents, protocols or similar items, carefully check the 'files' array in each project AND the 'notesWithFiles' array to provide relevant information including file names, sizes, types, and details
    - If a user asks for a specific file, check both file attachments and notes with files, and provide them the file name, type, size and public URL from your context`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...recentHistory,
      { role: "user", content: message }
    ];

    console.log('Calling OpenAI API with model: gpt-4o-mini');
    try {
      // Call OpenAI API with proper error handling and exponential backoff
      const MAX_RETRIES = 2;
      let retries = 0;
      let delay = 1000; // Start with a 1s delay
      let lastError = null;
      
      while (retries <= MAX_RETRIES) {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini', // Using faster model for quicker responses
              messages,
              temperature: 0.7,
              max_tokens: 800,
            })
          });

          const responseStatus = response.status;
          console.log('OpenAI API response status:', responseStatus);
          
          const data = await response.json();
          
          // Success case - break out of retry loop
          if (response.ok) {
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
          }
          
          // Error handling
          if (data.error) {
            console.error('OpenAI API error details:', data.error);
            lastError = data.error;
            
            // Break the loop if not a rate limit error (no point retrying)
            if (data.error?.type !== 'tokens' && data.error?.code !== 'rate_limit_exceeded') {
              break;
            }
            
            // For rate limits, extract wait time and retry after delay
            if (data.error?.type === 'tokens' || data.error?.code === 'rate_limit_exceeded') {
              const retryAfter = data.error.message.match(/try again in (\d+\.\d+)s/);
              const waitTime = retryAfter ? (parseFloat(retryAfter[1]) * 1000) : delay;
              
              console.log(`Rate limit hit. Retrying after ${waitTime}ms. Retry ${retries + 1}/${MAX_RETRIES}`);
              
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retries++;
              delay *= 2; // Exponential backoff
              continue;
            }
          }
          
          break; // Break if we reach here (non-rate-limit error)
          
        } catch (fetchError) {
          console.error('Fetch error on attempt', retries, fetchError);
          lastError = fetchError;
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
          delay *= 2; // Exponential backoff
        }
      }

      // If we get here, all retries failed or we had a non-rate-limit error
      
      // Handle quota exceeded error specifically
      if (lastError?.type === 'insufficient_quota') {
        return new Response(
          JSON.stringify({ 
            message: "Your OpenAI API quota has been exceeded. Please check your billing details on the OpenAI dashboard.",
            error: lastError
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Handle rate limit error specifically
      if (lastError?.type === 'tokens' || lastError?.code === 'rate_limit_exceeded') {
        const retryAfter = lastError.message.match(/try again in (\d+\.\d+)s/);
        const waitTime = retryAfter ? parseFloat(retryAfter[1]) : 60;

        return new Response(
          JSON.stringify({
            message: `OpenAI API rate limit exceeded. Please try again in ${Math.ceil(waitTime)} seconds.`,
            retryAfter: waitTime,
            error: lastError
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil(waitTime))
            }
          }
        );
      }
      
      // Handle other API errors
      return new Response(
        JSON.stringify({ 
          message: lastError?.message || 'Error calling OpenAI API',
          details: lastError
        }),
        { 
          status: 500, 
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
