"use client";

import { useState } from "react";
import Siderbar from "../components/Siderbar";
import { OpenAIChatMessage, UserMessageContentPart } from "@/lib/ModelSetting";
import OpenAI from "openai";

const initialAgents:OpenAIChatMessage[] = [
  {
    role: "system",
    name: "GPT Prompt builder",
    content:
      'Read all of the instructions below and once you understand them say "Shall we begin:" I want you to become my Prompt Creator. Your goal is to help me craft the best possible prompt for my needs. The prompt will be used by you, ChatGPT. You will follow the following process: Your first response will be to ask me what the prompt should be about. I will provide my answer, but we will need to improve it through continual iterations by going through the next steps. Based on my input, you will generate 3 sections. Revised Prompt (provide your rewritten prompt. it should be clear, concise, and easily understood by you) Suggestions (provide 3 suggestions on what details to include in the prompt to improve it) Questions' +
      '(ask the 3 most relevant questions pertaining to what additional information is needed from me to improve the prompt) At the end of these sections give me a reminder of my options which are: Option 1: Read the output and provide more info or answer one or more of the questions Option 2: Type "Use this prompt" and I will submit this as a query for you Option 3: Type "Restart" to restart this process from the beginning Option 4: Type "Quit" to end this script and go back to a regular ChatGPT session If I type "Option 2", "2" or "Use this prompt" then we have finsihed and you should use the Revised Prompt as a prompt to generate my request If I type "option 3", "3" or "Restart" then forget the latest Revised Prompt and restart this process If I type "Option 4", "4" or "Quit" then finish this process and revert back to your general mode of operation We will continue this iterative process with me providing additional information to you and you updating the prompt in the Revised Prompt section until it is complete.',
  },
  {
    role: "system",
    name:"books",
    content:
      "I really enjoyed reading To Kill a Mockingbird, could you recommend me a book that is similar and tell me why?",
  },
];

  
const Chat = () => {
  const [message, setMessage] = useState<string>("Hi");
  const [selectedAgent, setSelectedAgent] = useState<OpenAIChatMessage>(initialAgents[0]);
  const [conversations, setConversations] = useState<OpenAIChatMessage[]>(initialAgents);
  let messageId = 0;           //Tod

  // Function to handle sending a message
  const sendMessage = async () => {
    const log = document.getElementById('chat-log');

    if (message.trim()) {
      setConversations([...conversations, 
        { role: "user", content: message }]);

      // Call API route and add AI message to conversations
      const response = await fetch("/api/chat/openai", {
        method: "POST",
        body: message,
      });
      const data = await response.json();
      if (data) {
        setConversations([
          ...conversations,
          { role: "assistant", content: data},
        ]);
      }
      // Reset the message input
      setMessage("");
    };
  }
  // Message input handler
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };
  return (
    
    <div className="relative min-h-screen flex flex-row  bg-gray-50 dark:bg-[#17171a] dark:text-red-50  ">
      <Siderbar></Siderbar>
      
      <div className="flex flex-col overflow-y-auto">
        <div className="flex h-16 w-full flex-shrink-0"> </div>
      </div>

      <div className="group border relative  active:opacity-90 ">
        <a
          href="/chat/caa27062-b517-41c7-a858-245031795e3f"
          className="flex items-center gap-2 p-2"
        >
          <div className="relative min-w-48 h-10 p-2 hover:bg-gray-200 rounded grow overflow-hidden whitespace-nowrap">
            Agent 1
          </div>
        </a>
        <div className="absolute bottom-0 right-0 top-0 items-center gap-1.5 pr-2 flex">
          <button
            className="flex items-center justify-center text-token-text-primary transition hover:text-token-text-secondary radix-state-open:text-token-text-secondary"
            type="button"
            id="radix-:rn3:"
            aria-haspopup="menu"
            aria-expanded="false"
            data-state="closed"
          >
          </button>
          
        </div>
      </div>
      <div className="p-4 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
        <div className="mb-4 overflow-y-auto">
          <div id="chat-log" className="flex-1">
          {conversations.map((text, index) => (
            <div id={`log-${index}`} key={index} className="my-4 leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                {Array.isArray(text.content)
                  ? text.content.map((part: UserMessageContentPart, partIndex) => (
                      <span key={partIndex}>{part.type === "text" && <span>{part.text}</span>}
                      {part.type === "image_url" && (
                        <img
                          src={part.image_url.url}
                          alt="Content"
                          className="my-2 max-w-full rounded"
                        />
                      )}</span>
                    ))
                  : text.content}
            </div>
          ))}
          </div>
        </div>
        <div className="input-box flex items-center">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            className="flex-1 p-2 border-2 border-gray-200 rounded-md"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
export default Chat;
