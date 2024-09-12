// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AIServiceFactory } from '@/lib/ai/AIServiceFactory';
import { ModelProviderConfig } from '@/lib/ModelSetting';
import { verifyJWT } from '@/lib/auth'; // Assuming you have a JWT verification function

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, model, token } = await req.json();
    const payload = await verifyJWT(token); // Verify and decode JWT

    const config: ModelProviderConfig = {
      modelProvider: model.split('-')[0] as 'openai' | 'gemini' | 'claude' | /* other providers */,
      model: model,
      // ... other config options
    };

    const service = await AIServiceFactory.createService(config, payload);
    const stream = await service.generateResponse(message);

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}