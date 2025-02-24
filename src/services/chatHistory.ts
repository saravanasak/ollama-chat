import { Message } from './ollama';

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'ollama_chat_history';

export const saveChatSession = (session: ChatSession): void => {
  const history = getChatHistory();
  const existingIndex = history.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    history[existingIndex] = session;
  } else {
    history.push(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const getChatHistory = (): ChatSession[] => {
  const history = localStorage.getItem(STORAGE_KEY);
  return history ? JSON.parse(history) : [];
};

export const deleteChatSession = (sessionId: string): void => {
  const history = getChatHistory();
  const filtered = history.filter(session => session.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const createNewSession = (model: string): ChatSession => {
  return {
    id: Date.now().toString(),
    title: `Chat ${new Date().toLocaleString()}`,
    model,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const updateSessionTitle = (sessionId: string, title: string): void => {
  const history = getChatHistory();
  const session = history.find(s => s.id === sessionId);
  if (session) {
    session.title = title;
    session.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}; 