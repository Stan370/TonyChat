import { getServerConfig } from "@/config/server";
import { Octokit } from "@octokit/rest";
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'edge';

async function getRepoContents(owner: string, repo: string, path: string = '') {
  const config = await getServerConfig();
  const octokit = new Octokit({ auth: config.githubToken });
  
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path,
  });

  return response.data;
}

async function buildRepoContext(owner: string, repo: string) {
  const files = await getRepoContents(owner, repo);
  let context = `Repository: ${owner}/${repo}\n\n`;
  
  // Build file structure context
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

    const anthropic = new Anthropic({
      apiKey: config.anthropicApiKey,
    });

    // Get repository context
    const repoContext = await buildRepoContext(owner, repo);

    const systemPrompt = `You are a helpful AI assistant specialized in analyzing GitHub repositories.
Current repository: ${owner}/${repo}
Your task is to help understand the codebase, explain game mechanics, and suggest code modifications.
When referencing files, always include the full path.
${repoContext}`;

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      stream: true
    });

    for await (const chunk of response) {
      if (chunk.type === 'content_block_delta') {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
        );
      }
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
