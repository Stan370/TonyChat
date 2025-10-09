import { getServerConfig } from "@/config/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getModelConfig } from "@/lib/modelConfig";

export const runtime = 'edge';

export async function POST(req: Request) {
	try {
		const config = await getServerConfig();
		const { message, conversationId, agentId, systemPrompt, model } = await req.json();
		
		const genAI = new GoogleGenerativeAI(config.geminiKey);
		const modelG = genAI.getGenerativeModel({ 
			model: model || "gemini-1.5-flash",
			systemInstruction: systemPrompt || undefined
		});

		// Get model configuration
		const modelConfig = getModelConfig(model || "gemini-1.5-flash");

		const result = await modelG.generateContent({
			contents: [{ role: "user", parts: [{ text: message }] }],
			generationConfig: {
				temperature: modelConfig?.temperature || 0.8,
				topK: 0.9,
				topP: modelConfig?.topP || 1,
				maxOutputTokens: modelConfig?.maxTokens || 2048,
			},
			safetySettings: [
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
				},
			],
		});

		const response = await result.response;
		const aiResponse = response.text() || "Sorry, I couldn't generate a response.";

		return new Response(JSON.stringify(aiResponse), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error: any) {
		console.error('Error in Google AI chat:', error);
		const errorMessage = error.message || "An unexpected error occurred";

		return new Response(JSON.stringify({ message: errorMessage }), {
			status: 500,
		});
	}
}
