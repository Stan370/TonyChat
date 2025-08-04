import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query, conversationId, settings } = await req.json();
    
    // Enhanced query with conversation settings
    const ragRes = await fetch('http://localhost:8001/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query, 
        conversationId, 
        settings 
      }),
    });
    
    if (!ragRes.ok) {
      throw new Error(`RAG service error: ${ragRes.status}`);
    }
    
    const data = await ragRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json(
      { error: 'Failed to process RAG query' },
      { status: 500 }
    );
  }
}