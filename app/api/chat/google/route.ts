import { getServerConfig } from "@/config/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";


export async function POST(req: Request) {
  try {
    // Fetch server configuration
    const config = await getServerConfig();
    
    // Initialize Google Generative AI with the provided credentials
    const genAI = new GoogleGenerativeAI(config.geminiKey);
    const modelG = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Define the generation configuration
    const generationConfig = {
      temperature: 0.8,
      topK: 0.9,
      topP: 1,
      maxOutputTokens: 2048,
    };

    // Define the safety settings for content filtering
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Start a chat session with the generative AI model
    const chat = modelG.startChat({
      generationConfig,
      safetySettings,  // Pass safety settings if needed
    });

    // Extract messages from the request
    const { messages } = await req.json();

    // Send the message to the model and await the response
    const result = await chat.sendMessage(messages);
    const response = await result.response;

    return new Response(JSON.stringify(response), {
      status: 200,
    });
  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred";
    const errorCode = error.status || 500;
    console.error(error);

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
    });
  }
}
