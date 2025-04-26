
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createAdminClient } from './supabaseClient.ts';
import { extractProjectInfo, getUserProfile, getUserTemplates } from './contextExtractor.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabaseAdmin = createAdminClient();

    // Get user context data
    console.log('Fetching user context for userId:', userId);
    const userProfile = await getUserProfile(supabaseAdmin, userId);
    const projectsContext = await extractProjectInfo(supabaseAdmin, userId);
    const userTemplates = await getUserTemplates(supabaseAdmin, userId);
    
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

    if (userTemplates?.length > 0) {
      contextText += `\n\nTask Templates: ${JSON.stringify(userTemplates, null, 2)}`;
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
        
        // Handle rate limit error specifically
        if (data.error?.type === 'tokens' || data.error?.code === 'rate_limit_exceeded') {
          const retryAfter = data.error.message.match(/try again in (\d+\.\d+)s/);
          const waitTime = retryAfter ? parseFloat(retryAfter[1]) : 60;

          return new Response(
            JSON.stringify({
              message: `OpenAI API rate limit exceeded. Please try again in ${Math.ceil(waitTime)} seconds.`,
              retryAfter: waitTime
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
