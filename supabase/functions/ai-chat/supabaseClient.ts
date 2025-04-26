
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

export const createAdminClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase URL or service role key');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey);
};
