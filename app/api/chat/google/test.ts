/**
 * @license
 * This file is licensed under the Apache License 2.0.
 * See the LICENSE file for more details.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mediaPath = __dirname + "/media";

async function chat() {
  // [START chat]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });
  let result = await chat.sendMessage("I have 2 dogs in my house.");
  console.log(result.response.text());
  result = await chat.sendMessage("How many paws are in my house?");
  console.log(result.response.text());
  // [END chat]
}

async function chatStreaming() {
  // [START chat_streaming]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });
  let result = await chat.sendMessageStream("I have 2 dogs in my house.");
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  result = await chat.sendMessageStream("How many paws are in my house?");
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  // [END chat_streaming]
}

async function chatStreamingWithImages() {
  // [START chat_streaming_with_images]
  // Make sure to include these imports:
  // import { GoogleGenerativeAI } from "@google/generative-ai";
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat();

  let result = await chat.sendMessageStream("Hello, I'm designing inventions. Can I show you one?");
  process.stdout.write('\n\nmodel:\n');
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  result = await chat.sendMessageStream(["What do you think about this design?", {
    inlineData: {
      data: Buffer.from(fs.readFileSync(`${mediaPath}/jetpack.jpg`)).toString("base64"),
      mimeType: "image/jpeg",
    },
  }]);
  process.stdout.write('\n\nmodel:\n');
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    process.stdout.write(chunkText);
  }
  // [END chat_streaming_with_images]
}

// async function runAll() {
//   await chat();
//   await chatStreaming();
//   await chatStreamingWithImages();
// }

// runAll();