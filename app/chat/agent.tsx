import { OpenAIChatMessage } from "@/lib/ModelSetting";

const agents: { [key: string]: Agent } = {};

export function createAgent(): Agent {
  const id = generateRandomId();
  const newAgent: Agent = {
    id,
    name: `Agent ${id}`,
    content: 'This is the default agent content.',
  };
  agents[id] = newAgent;
  return newAgent;
}

export function getAgent(id: string): Agent | undefined {
  return agents[id];
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 10);
}