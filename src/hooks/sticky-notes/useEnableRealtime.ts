
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * This hook ensures that the Supabase table is correctly configured for realtime
 * Only run this in development environment, as it tests the connection
 */
export const useEnableRealtime = () => {
  useEffect(() => {
    // Check if we're in development
    if (process.env.NODE_ENV === 'development') {
      // Test the realtime connection with a simple ping
      const testChannel = supabase.channel('test-realtime');
      
      testChannel.subscribe((status) => {
        console.log(`Testing Supabase Realtime connection: ${status}`);
        
        // Remove test channel after checking
        setTimeout(() => {
          supabase.removeChannel(testChannel);
        }, 2000);
      });
      
      console.log(`
=== Supabase Realtime Info ===
If you're not seeing realtime updates, make sure:
1. The sticky_notes table has REPLICA IDENTITY set to FULL
2. The table is added to the supabase_realtime publication
3. Your Supabase project has realtime enabled
`);
    }
  }, []);
};
