"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Siderbar from "../components/Siderbar";
import { OpenAIChatMessage, UserMessageContentPart } from "@/lib/ModelSetting";
import Image from 'next/image';
import { supabaseClient } from "@/lib/supabase";
import { Bot, Agent, ModelProviderConfig } from "@/lib/types";
import { allModelConfigs, getModelsByProvider } from "@/lib/modelConfig";

// Default agents (fallback)
const defaultAgents: Agent[] = [
  {
    id: "default-gpt4",
    name: "GPT-4",
    description: "I am GPT-4, a large language model trained by OpenAI.",
    avatar: "/ai-avatar.png",
    category: "General",
    tags: ["general", "assistant"],
    author: "OpenAI",
    systemPrompt: "I am GPT-4, a large language model trained by OpenAI."
  },
  {
    id: "default-prompt-builder",
    name: "GPT Prompt builder",
    description: "Help you craft the best possible prompt for your needs.",
    avatar: "/ai-avatar.png",
    category: "Writing",
    tags: ["prompt", "writing", "optimization"],
    author: "Custom",
    systemPrompt: 'Read all of the instructions below and once you understand them say "Shall we begin:" I want you to become my Prompt Creator. Your goal is to help me craft the best possible prompt for my needs. The prompt will be used by you, ChatGPT. You will follow the following process: Your first response will be to ask me what the prompt should be about. I will provide my answer, but we will need to improve it through continual iterations by going through the next steps. Based on my input, you will generate 3 sections. Revised Prompt (provide your rewritten prompt. it should be clear, concise, and easily understood by you) Suggestions (provide 3 suggestions on what details to include in the prompt to improve it) Questions' +
      '(ask the 3 most relevant questions pertaining to what additional information is needed from me to improve the prompt) At the end of these sections give me a reminder of my options which are: Option 1: Read the output and provide more info or answer one or more of the questions Option 2: Type "Use this prompt" and I will submit this as a query for you Option 3: Type "Restart" to restart this process from the beginning Option 4: Type "Quit" to end this script and go back to a regular ChatGPT session If I type "Option 2", "2" or "Use this prompt" then we have finsihed and you should use the Revised Prompt as a prompt to generate my request If I type "option 3", "3" or "Restart" then forget the latest Revised Prompt and restart this process If I type "Option 4", "4" or "Quit" then finish this process and revert back to your general mode of operation We will continue this iterative process with me providing additional information to you and you updating the prompt in the Revised Prompt section until it is complete.'
  },
  {
    id: "default-software-expert",
    name: "Software Expert",
    description: "Expert Software Development Engineer with extensive experience.",
    avatar: "/ai-avatar.png",
    category: "Development",
    tags: ["coding", "development", "software"],
    author: "Custom",
    systemPrompt: "You are an expert Software Development Engineer (SDE) with extensive experience in various programming languages, software architectures, and development methodologies. Your role is to assist with coding problems, system design, and best practices in software development. When asked a question, please follow this process:\n\n1. Understand the Problem: Clarify the requirements and constraints of the given task or problem.\n2. Provide a High-Level Solution: Outline a general approach to solving the problem.\n3. Detailed Implementation: If requested, provide code snippets or more detailed explanations of the solution.\n4. Best Practices: Highlight any relevant best practices, design patterns, or optimization techniques.\n5. Potential Issues: Discuss any potential challenges or edge cases that should be considered.\n6. Follow-up: Ask if there are any parts of the solution that need further clarification or expansion.\n\nPlease respond with 'Ready to assist with your software development needs. What problem can I help you with today?' to indicate you're prepared to begin."
  }
];


const Chat = () => {
  const [message, setMessage] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent>(defaultAgents[0]);
  const [selectedModel, setSelectedModel] = useState<ModelProviderConfig>(allModelConfigs[0]);
  const [conversations, setConversations] = useState<OpenAIChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load agent from localStorage on component mount
  useEffect(() => {
    const loadAgentFromStorage = () => {
      try {
        const storedAgent = localStorage.getItem('selectedAgent');
        if (storedAgent) {
          const agentData: Agent = JSON.parse(storedAgent);
          setSelectedAgent(agentData);
          console.log('Loaded agent from storage:', agentData);
        }
      } catch (error) {
        console.error('Error loading agent from storage:', error);
      }
    };

    loadAgentFromStorage();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversations]);

  const loadOrCreateConversation = useCallback(async () => {
    try {
      // TODO: Replace with actual user ID once authentication is implemented
      const userId = "example-user-id";

      // Check if there's an ongoing conversation for this specific agent
      const { data: existingConversation, error: existingConversationError } = await supabaseClient
        .from('conversations')
        .select('id')
        .eq('agent_id', selectedAgent.id) // Use agent.id instead of hardcoded value
        .order('create_time', { ascending: false })
        .limit(1)
        .single();

      if (existingConversationError && existingConversationError.code !== 'PGRST116') {
        throw existingConversationError;
      }

      if (existingConversation) {
        setCurrentConversationId(existingConversation.id);
        await loadConversationHistory(existingConversation.id);
      } else {
        // Create new conversation with agent information
        const { data: newConversation, error: newConversationError } = await supabaseClient
          .from('conversations')
          .insert({ 
            agent_id: selectedAgent.id,
            agent_name: selectedAgent.name,
            agent_description: selectedAgent.description,
            agent_category: selectedAgent.category
          })
          .select()
          .single();

        if (newConversationError) throw newConversationError;

        if (newConversation) {
          setCurrentConversationId(newConversation.id);
          console.log('Created new conversation:', newConversation);
        } else {
          throw new Error("Failed to create new conversation");
        }
      }
    } catch (error) {
      console.error("Error in loadOrCreateConversation:", error);
      // You might want to set an error state here to display to the user
    }
  }, [selectedAgent]);

  useEffect(() => {
    // Load or create a new conversation when the component mounts or agent changes
    loadOrCreateConversation();
  }, [loadOrCreateConversation]);

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

    // Persist user message
    if (currentConversationId) {
      try {
        await supabaseClient.from('Messages').insert({
          conversation_id: currentConversationId,
          role: "user",
          content: message,
          content_type: "text"
        });
      } catch (error) {
        console.error("Error persisting user message:", error);
      }
    }

    // Immediately update UI with user message
    setConversations(prev => [...prev, userMessage]);
    setMessage(""); // Clear input field
    setIsWaitingForResponse(true);

    if (currentConversationId) {
      try {
        // Call API route and add AI message to conversations
        const response = await fetch(`/api/chat/${selectedModel.modelProvider}`, {
          method: "POST",
          body: JSON.stringify({
            message,
            conversationId: currentConversationId,
            agentId: selectedAgent.id, // Use agent.id instead of name
            systemPrompt: selectedAgent.systemPrompt, // Include system prompt
            model: selectedModel.model // Include selected model
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
        await supabaseClient.from('Messages').insert({
          conversation_id: currentConversationId,
          role: "assistant",
          content: data,
          content_type: "text"
        });
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
        {/* Agent Info Header */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Image
              src={selectedAgent.avatar}
              alt={`${selectedAgent.name} Avatar`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedAgent.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedAgent.description}
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              {/* Model Selector */}
              <select
                value={selectedModel.model}
                onChange={(e) => {
                  const model = allModelConfigs.find(m => m.model === e.target.value);
                  if (model) setSelectedModel(model);
                }}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {allModelConfigs.map((model) => (
                  <option key={model.model} value={model.model}>
                    {model.modelProvider.toUpperCase()}: {model.model}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => window.location.href = '/store'}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Change Agent
              </button>
            </div>
          </div>
        </div>

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
                      src={message.role === 'user' ? '/user.jpg' : selectedAgent.avatar}
                      alt={message.role === 'user' ? 'User Avatar' : `${selectedAgent.name} Avatar`}
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
                            <Image
                              src={part.image_url.url}
                              alt="Content"
                              width={400}
                              height={300}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isWaitingForResponse) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
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
        {/* Dynamic Agent History */}
        <div className="max-h-96 overflow-y-auto">
          {defaultAgents.map((agent) => (
            <a 
              key={agent.id}
              href="/chat" 
              className="flex items-center gap-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.preventDefault();
                setSelectedAgent(agent);
                // Clear current conversation when switching agents
                setCurrentConversationId(null);
                setConversations([]);
              }}
            >
              <Image
                src={agent.avatar}
                alt={`${agent.name} Avatar`}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div className="relative min-w-48 h-20 p-2 hover:bg-gray-200 rounded grow overflow-hidden whitespace-nowrap">
                <span className="text-sm font-medium">{agent.name}</span>
                <p className="text-xs text-gray-500 truncate">{agent.description}</p>
              </div>
            </a>
          ))}
        </div>
        
        {/* Model Provider Quick Switch */}
        <div className="border-t p-2">
          <div className="text-xs text-gray-500 mb-2">Quick Model Switch:</div>
          <div className="flex gap-1">
            {['openai', 'gemini', 'claude'].map((provider) => (
              <button
                key={provider}
                onClick={() => {
                  const models = getModelsByProvider(provider as "openai" | "gemini" | "claude");
                  if (models.length > 0) {
                    setSelectedModel(models[0]);
                  }
                }}
                className={`px-2 py-1 text-xs rounded ${
                  selectedModel.modelProvider === provider
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {provider.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
