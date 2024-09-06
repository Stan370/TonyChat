import { createClient } from "@supabase/supabase-js";

// Custom logger
const logger = {
  error: (message: string, error?: any) => {
    console.error(`[Supabase Error] ${message}`, error);
    // You can add more sophisticated logging here, like sending to a logging service
  },
  warn: (message: string) => {
    console.warn(`[Supabase Warning] ${message}`);
  },
  info: (message: string) => {
    console.info(`[Supabase Info] ${message}`);
  }
};

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  logger.error("Missing Supabase environment variables");
  throw new Error("Missing Supabase environment variables");
}

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Function to test the Supabase connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseClient.from('your_table_name').select('count(*)', { count: 'exact' });
    
    if (error) {
      throw error;
    }
    
    logger.info("Successfully connected to Supabase");
    return true;
  } catch (error) {
    logger.error("Failed to connect to Supabase", error);
    return false;
  }
}

// You can call this function when your app initializes
testSupabaseConnection();
