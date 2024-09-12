import { getServerConfig } from "@/config/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const runtime = 'edge';

export async function POST(req: Request) {
	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	try {
		const config = await getServerConfig();
		const { message, model } = await req.json();
		
		const genAI = new GoogleGenerativeAI(config.geminiKey);
		const modelG = genAI.getGenerativeModel({ model: model || "gemini-1.5-flash" });

		const chat = modelG.startChat({
			generationConfig: {
				temperature: 0.8,
				topK: 0.9,
				topP: 1,
				maxOutputTokens: 2048,
			},
			safetySettings: [
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
				},
				// ... other safety settings ...
			],
		});

		const result = await chat.sendMessage(message);
		const response = await result.response;

		// Stream the response
		for (const chunk of response.text().split(' ')) {
			await writer.write(encoder.encode(`data: ${JSON.stringify({ text: chunk + ' ' })}\n\n`));
		}
	} catch (error: any) {
		console.error('Error in Google AI chat:', error);
		await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
	} finally {
		await writer.close();
	}

	return new Response(stream.readable, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive',
		},
	});
}
