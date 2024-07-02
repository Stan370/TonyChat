interface Agent {
  id: string;
  name: string;
  content: string;
  config?: any; // 添加config字段来存储agentConfig
}

const agents: { [key: string]: Agent } = {};

export function createAgent(): Agent {
  const id = generateRandomId();
  const newAgent: Agent = {
    id,
    name: `Agent ${id}`,
    content: 'This is the default agent content.',
    config: agentConfig, // 将agentConfig添加到新创建的Agent中
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
