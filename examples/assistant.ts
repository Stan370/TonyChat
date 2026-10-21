#!/usr/bin/env -S npm run tsn -T

import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const instructions =
    'You are a personal math tutor. Write and run code to answer math questions.\n\nPlease address the user as Jane Doe. The user has a premium account.';
  const run = await openai.responses.create({
    model: 'gpt-4-1106-preview',
    instructions,
    input: '"I need to solve the equation `3x + 11 = 14`. Can you help me?"',
  });

  console.log('Run finished with status: ' + run.status);

  if (run.status == 'completed') {
    console.log({
      role: 'assistant',
      content: run.output_text,
    });
  }
}

main();