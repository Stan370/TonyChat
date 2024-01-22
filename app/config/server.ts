/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */

// Define the ProcessEnv interface
declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NEXT_PUBLIC_VERCEL_ENV: string;
        NEXT_PUBLIC_BACKEND_URL: string;
        OPENAI_API_KEY: string;
        // ... other environment variables
        OPENAI_BASE_URL: string;
        OPENAI_ORG_ID: string;
        AZURE_OPENAI_API_KEY: string;
        NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT: string;
        NEXT_PUBLIC_AZURE_GPT_35_TURBO_ID: string;
        NEXT_PUBLIC_AZURE_GPT_45_VISION_ID: string;
        NEXT_PUBLIC_AZURE_GPT_45_TURBO_ID: string;
      }
    }
  }
  
  export const getServerConfig = () => {
    if (typeof process === 'undefined') {
      throw new Error('[Server Config] you are importing a server-only module outside of server');
    }
  
    const {
      NODE_ENV,
      NEXT_PUBLIC_VERCEL_ENV,
      NEXT_PUBLIC_BACKEND_URL,
      OPENAI_API_KEY,
      // ... other environment variables
      OPENAI_BASE_URL,
      OPENAI_ORG_ID, 
      AZURE_OPENAI_API_KEY,
      NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
      NEXT_PUBLIC_AZURE_GPT_35_TURBO_ID,
      NEXT_PUBLIC_AZURE_GPT_45_VISION_ID,
      NEXT_PUBLIC_AZURE_GPT_45_TURBO_ID,
    } = process.env;
  
    return {
      nodeEnv: NODE_ENV,
      vercelEnv: NEXT_PUBLIC_VERCEL_ENV,
      backendUrl: NEXT_PUBLIC_BACKEND_URL,
      openaiApiKey: OPENAI_API_KEY,
      // ... other properties   
      openaiBaseUrl: OPENAI_BASE_URL,
      openaiOrgId: OPENAI_ORG_ID,
      azureOpenaiApiKey: AZURE_OPENAI_API_KEY,
      azureOpenaiEndpoint: NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
      azureGpt35TurboId: NEXT_PUBLIC_AZURE_GPT_35_TURBO_ID,
      azureGpt45VisionId: NEXT_PUBLIC_AZURE_GPT_45_VISION_ID,
      azureGpt45TurboId: NEXT_PUBLIC_AZURE_GPT_45_TURBO_ID,
    };
  };
  