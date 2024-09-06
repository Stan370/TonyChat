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
        GEMINI_API_KEY:string;
        AZURE_OPENAI_API_KEY: string;
        NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT: string;
        NEXT_PUBLIC_AZURE_GPT_35_TURBO_ID: string;
        NEXT_PUBLIC_AZURE_GPT_45_VISION_ID: string;
        NEXT_PUBLIC_AZURE_GPT_45_TURBO_ID: string;
        NEXT_PUBLIC_SUPABASE_URL: string;
        NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
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
      OPENAI_PROXY_URL,
      OPENAI_ORG_ID, 
      GEMINI_API_KEY,
      AZURE_OPENAI_API_KEY,
      NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
      NEXT_PUBLIC_AZURE_GPT_35_TURBO_ID,
      NEXT_PUBLIC_AZURE_GPT_45_VISION_ID,
      NEXT_PUBLIC_AZURE_GPT_45_TURBO_ID,
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
    } = process.env;
  
    return {
      nodeEnv: NODE_ENV,
      vercelEnv: NEXT_PUBLIC_VERCEL_ENV,
      backendUrl: NEXT_PUBLIC_BACKEND_URL,
      openaiApiKey: OPENAI_API_KEY,
      geminiKey:GEMINI_API_KEY,
      // ... other properties   
      openaiBaseUrl: OPENAI_BASE_URL,
      openaiProxyUrl: OPENAI_PROXY_URL,
      openaiOrgId: OPENAI_ORG_ID,
      azureOpenaiApiKey: AZURE_OPENAI_API_KEY,
      azureOpenaiEndpoint: NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
      azureGpt35TurboId: NEXT_PUBLIC_AZURE_GPT_35_TURBO_ID,
      azureGpt45VisionId: NEXT_PUBLIC_AZURE_GPT_45_VISION_ID,
      azureGpt45TurboId: NEXT_PUBLIC_AZURE_GPT_45_TURBO_ID,
      supabaseUrl: NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
  };
  // const express = require("express");
  // const bodyParser = require("body-parser");
  // const sqlite3 = require("sqlite3").verbose();
  
  // const app = express();
  // const port = 3000;
  
  // app.use(bodyParser.json());
  
  // // SQLite database setup
  // const db = new sqlite3.Database(":memory:"); // In-memory database for demonstration purposes
  
  // // Create conversations table
  // db.serialize(() => {
  //   db.run(
  //     "CREATE TABLE IF NOT EXISTS conversations (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT)"
  //   );
  // });
  
  // // Endpoint to save conversation
  // app.post("/conversation", (req, res) => {
  //   const { role, content } = req.body;
  //   db.run("INSERT INTO conversations (role, content) VALUES (?, ?)", [role, content], (err) => {
  //     if (err) {
  //       console.error(err.message);
  //       res.status(500).json({ error: "Failed to save conversation" });
  //     } else {
  //       res.status(201).json({ message: "Conversation saved successfully" });
  //     }
  //   });
  // });
  
  // // Endpoint to retrieve all conversations
  // app.get("/conversations", (req, res) => {
  //   db.all("SELECT * FROM conversations", (err, rows) => {
  //     if (err) {
  //       console.error(err.message);
  //       res.status(500).json({ error: "Failed to retrieve conversations" });
  //     } else {
  //       res.status(200).json(rows);
  //     }
  //   });
  // });
  
  // app.listen(port, () => {
  //   console.log(`Server is running on http://localhost:${port}`);
  // });
  
