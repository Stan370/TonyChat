"use client";

import { useState, useRef, useEffect } from "react";
import Siderbar from "../components/Siderbar";
import { OpenAIChatMessage, UserMessageContentPart } from "@/lib/ModelSetting";
import Image from 'next/image';
import { supabaseClient } from "@/lib/supabase";

const initialAgents: OpenAIChatMessage[] = [
  {
    role: "system",
    name: "GPT-4",
    content: "I am GPT-4, a large language model trained by OpenAI."
  },
  {
    role: "system",
    name: "GPT Prompt builder",
    content:
      'Read all of the instructions below and once you understand them say "Shall we begin:" I want you to become my Prompt Creator. Your goal is to help me craft the best possible prompt for my needs. The prompt will be used by you, ChatGPT. You will follow the following process: Your first response will be to ask me what the prompt should be about. I will provide my answer, but we will need to improve it through continual iterations by going through the next steps. Based on my input, you will generate 3 sections. Revised Prompt (provide your rewritten prompt. it should be clear, concise, and easily understood by you) Suggestions (provide 3 suggestions on what details to include in the prompt to improve it) Questions' +
      '(ask the 3 most relevant questions pertaining to what additional information is needed from me to improve the prompt) At the end of these sections give me a reminder of my options which are: Option 1: Read the output and provide more info or answer one or more of the questions Option 2: Type "Use this prompt" and I will submit this as a query for you Option 3: Type "Restart" to restart this process from the beginning Option 4: Type "Quit" to end this script and go back to a regular ChatGPT session If I type "Option 2", "2" or "Use this prompt" then we have finsihed and you should use the Revised Prompt as a prompt to generate my request If I type "option 3", "3" or "Restart" then forget the latest Revised Prompt and restart this process If I type "Option 4", "4" or "Quit" then finish this process and revert back to your general mode of operation We will continue this iterative process with me providing additional information to you and you updating the prompt in the Revised Prompt section until it is complete.',
  },
  {
    role: "system",
    name: "Software Expert",
    content:
      "You are an expert Software Development Engineer (SDE) with extensive experience in various programming languages, software architectures, and development methodologies. Your role is to assist with coding problems, system design, and best practices in software development. When asked a question, please follow this process:\n\n1. Understand the Problem: Clarify the requirements and constraints of the given task or problem.\n2. Provide a High-Level Solution: Outline a general approach to solving the problem.\n3. Detailed Implementation: If requested, provide code snippets or more detailed explanations of the solution.\n4. Best Practices: Highlight any relevant best practices, design patterns, or optimization techniques.\n5. Potential Issues: Discuss any potential challenges or edge cases that should be considered.\n6. Follow-up: Ask if there are any parts of the solution that need further clarification or expansion.\n\nPlease respond with 'Ready to assist with your software development needs. What problem can I help you with today?' to indicate you're prepared to begin.",
  },
];


const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<OpenAIChatMessage>(initialAgents[0]);
  const [conversations, setConversations] = useState<OpenAIChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);//from db
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversations]);

  useEffect(() => {
    // Load or create a new conversation when the component mounts
    if (selectedAgent.name !== "GPT-4") {
      loadOrCreateConversation();
    }
  }, [selectedAgent.name]);
  const loadOrCreateConversation = async () => {
    try {
      // TODO: Replace with actual user ID once authentication is implemented
      const userId = "example-user-id";

      // Check if there's an ongoing conversation
      const { data: existingConversation, error: existingConversationError } = await supabaseClient
        .from('conversations')
        .select('id')
        .eq('agent_id', '6545b253-51d4-4453-a5b2-681a7c60051f')
        .order('create_time', { ascending: false })
        .limit(1)
        .single();

      if (existingConversationError) throw existingConversationError;

      if (existingConversation) {
        setCurrentConversationId(existingConversation.id);
        await loadConversationHistory(existingConversation.id);
      } else {
        const { data: newConversation, error: newConversationError } = await supabaseClient
          .from('conversations')
          .insert({ agent_id: selectedAgent.name })
          .select()
          .single();

        if (newConversationError) throw newConversationError;

        if (newConversation) {
          setCurrentConversationId(newConversation.id);
        } else {
          throw new Error("Failed to create new conversation");
        }
      }
    } catch (error) {
      console.error("Error in loadOrCreateConversation:", error);
      // You might want to set an error state here to display to the user
    }
  };

  const loadConversationHistory = async (conversationId: string) => {
    try {
      const { data: messages, error } = await supabaseClient
        .from('Messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('create_time', { ascending: true });

      if (error) throw error;

      if (messages) {
        setConversations(messages.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content
        })));
      } else {
        console.warn("No messages found for conversation:", conversationId);
      }
    } catch (error) {
      console.error("Error in loadConversationHistory:", error);
      // You might want to set an error state here to display to the user
    }
  };

  // Function to handle sending a message
  const sendMessage = async () => {
    if (!message.trim() || isWaitingForResponse) return;

    const userMessage: OpenAIChatMessage = { role: "user", content: message };

    // Immediately update UI with user message
    setConversations(prev => [...prev, userMessage]);
    setMessage(""); // Clear input field
    setIsWaitingForResponse(true);

    if (currentConversationId) {
      try {
        // Call API route and add AI message to conversations
        const response = await fetch("/api/chat/openai", {
          method: "POST",
          body: JSON.stringify({
            message,
            conversationId: currentConversationId,
            agentId: selectedAgent.name
          }),
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        // Add the assistant's response to the conversation
        const assistantMessage: OpenAIChatMessage = { role: "assistant", content: data };
        setConversations(prev => [...prev, assistantMessage]);

        // Persist assistant message
        if (selectedAgent.name !== "GPT-4") {
          await supabaseClient.from('Messages').insert({
            conversation_id: currentConversationId,
            role: "assistant",
            content: data,
            content_type: "text"
          });
        }
      } catch (error) {
        console.error("Error during fetch:", error);
        if (error instanceof TypeError && (error.cause as { name?: string })?.name === 'ConnectTimeoutError') {
          console.error("Connection timeout error. Please check your network connection.");
          setConversations(prevConversations => [
            ...prevConversations,
            { role: "assistant", content: "Connection timeout error. Please check your network connection." },
          ]);
        } else {
          setConversations(prevConversations => [
            ...prevConversations,
            { role: "assistant", content: "An error occurred while sending the message. Please check your OPENAI API KEY in the setting page." },
          ]);
        }
      } finally {
        setIsWaitingForResponse(false);
        setMessage("");
      }
    }
  };

  // Message input handler
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  return (
    <div className="relative min-h-screen flex flex-row bg-gray-50 dark:bg-[#17171a] dark:text-red-50">
      <Siderbar></Siderbar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div id="chat-log" className="max-w-3xl mx-auto space-y-4">
            {conversations.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex ${message.role === 'user' ? 'flex-row' : 'flex-row-reverse'} items-start max-w-[80%]`}>
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-300 mr-3">
                    <Image
                      src={message.role === 'user' ? '/user.jpg' : '/ai-avatar.png'}
                      alt={message.role === 'user' ? 'User Avatar' : 'AI Avatar'}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div
                    className={`p-3 rounded-lg ${message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      }`}
                  >
                    {Array.isArray(message.content)
                      ? message.content.map((part: UserMessageContentPart, partIndex) => (
                        <span key={partIndex}>
                          {part.type === "text" && <span>{part.text}</span>}
                          {part.type === "image_url" && (
                            <img
                              src={part.image_url.url}
                              alt="Content"
                              className="my-2 max-w-full rounded"
                            />
                          )}
                        </span>
                      ))
                      : message.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                className="flex-1 p-2 border-2 border-gray-200 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                placeholder="Type your message..."
                disabled={isWaitingForResponse}
              />
              <button
                onClick={sendMessage}
                className={`ml-2 px-4 py-2 bg-blue-500 text-white rounded-md transition duration-150 ease-in-out  ${isWaitingForResponse ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                  }`}
                disabled={isWaitingForResponse}
              >
                {isWaitingForResponse ? (
                  <svg className="animate-spin h-6 w-9" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span>Send</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="group border relative active:opacity-90">
        <a href="/chat" className="flex items-center gap-2 p-2">
          <div className="relative min-w-48 h-10 p-2 hover:bg-gray-200 rounded grow overflow-hidden whitespace-nowrap">
            Agent 1
          </div>
        </a>
        <a href="/chat" className="flex items-center gap-2 p-2">
          <div className="relative min-w-48 h-10 p-2 hover:bg-gray-200 rounded grow overflow-hidden whitespace-nowrap">
            Agent 2
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
    </div>
  );
};

export default Chat;
