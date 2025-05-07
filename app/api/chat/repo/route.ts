import { getServerConfig } from "@/config/server";

export const runtime = 'edge';

async function getRepoContents(owner: string, repo: string, path: string = '') {
  const config = await getServerConfig();
  const response = await fetch(`${config.laravelApiUrl}/api/repo/contents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.laravelApiToken}`
    },
    body: JSON.stringify({ owner, repo, path })
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch repo contents');
  }
  
  return response.json();
}

async function buildRepoContext(owner: string, repo: string) {
  const files = await getRepoContents(owner, repo);
  let context = `Repository: ${owner}/${repo}\n\n`;
  
  if (Array.isArray(files)) {
    context += "File structure:\n";
    for (const file of files) {
      context += `- ${file.path}\n`;
    }
  }
  
  return context;
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    const config = await getServerConfig();
    const { message, owner, repo, path } = await request.json();

    // Get repository context
    const repoContext = await buildRepoContext(owner, repo);

    const response = await fetch(`${config.laravelApiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.laravelApiToken}`
      },
      body: JSON.stringify({
        message,
        owner,
        repo,
        path,
        context: repoContext
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get chat response');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ text: new TextDecoder().decode(value) })}\n\n`)
      );
    }
  } catch (error: any) {
    console.error('Error in Repo chat:', error);
    await writer.write(
      encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
    );
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
