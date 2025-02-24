import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Text,
  VStack,
  Icon,
  Flex,
  useToast,
  HStack,
  Button,
  Textarea,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Message as MessageType, generateChatResponse, listModels } from '../services/ollama';
import { ChatSession, createNewSession, getChatHistory, saveChatSession, deleteChatSession } from '../services/chatHistory';
import Header from './Header';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import { IoTerminal } from 'react-icons/io5';
import { FiUser, FiEdit2 } from 'react-icons/fi';

const pulseAnimation = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
`;

const quickPrompts = [
  'Explain like I\'m 5',
  'Write code example',
  'Summarize this',
  'Analyze pros and cons'
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(getChatHistory());
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar, onClose: closeSidebar } = useDisclosure();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  useEffect(() => {
    fetchModels();
    if (sessions.length > 0 && !currentSession) {
      loadSession(sessions[0].id);
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (currentSession) {
      saveChatSession({
        ...currentSession,
        messages,
        updatedAt: new Date().toISOString()
      });
      setSessions(getChatHistory());
    }
  }, [messages]);

  const fetchModels = async () => {
    try {
      const availableModels = await listModels();
      setModels(availableModels);
      if (availableModels.length > 0) {
        setSelectedModel(availableModels[0]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: 'Error fetching models',
        description: error instanceof Error ? error.message : 'Please make sure Ollama is running locally',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleNewChat = () => {
    if (selectedModel) {
      const newSession = createNewSession(selectedModel);
      setCurrentSession(newSession);
      setMessages([]);
      setSessions([...sessions, newSession]);
      // Close sidebar and focus input
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 100);
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages);
      setSelectedModel(session.model);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteChatSession(sessionId);
    setSessions(getChatHistory());
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  };

  const handleSubmit = async (input: string) => {
    if (!input.trim() || !selectedModel) return;

    const userMessage: MessageType = {
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      let currentResponse = '';
      await generateChatResponse(
        selectedModel,
        [...messages, userMessage],
        (content) => {
          currentResponse += content;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...newMessages.slice(0, -1),
                { ...lastMessage, content: currentResponse }
              ];
            } else {
              return [...newMessages, { role: 'assistant', content: currentResponse }];
            }
          });
        }
      );

      if (!currentSession) {
        const newSession = createNewSession(selectedModel);
        newSession.title = userMessage.content.slice(0, 30); // Use first message as title
        newSession.messages = [...messages, userMessage, { role: 'assistant', content: currentResponse }];
        setCurrentSession(newSession);
        setSessions([...sessions, newSession]);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate response',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditMessage = async (index: number, newContent: string) => {
    if (index < 0 || !currentSession) return;

    // Update the edited message
    const updatedMessages = [...messages];
    updatedMessages[index] = {
      ...updatedMessages[index],
      content: newContent
    };

    // Remove all messages after the edited message
    const messagesUntilEdit = updatedMessages.slice(0, index + 1);
    setMessages(messagesUntilEdit);
    setEditingMessageIndex(null);

    // Update session
    const updatedSession = {
      ...currentSession,
      messages: messagesUntilEdit,
      updatedAt: new Date().toISOString()
    };
    setCurrentSession(updatedSession);
    saveChatSession(updatedSession);
    setSessions(getChatHistory());

    // Generate new response
    setIsGenerating(true);
    try {
      let currentResponse = '';
      await generateChatResponse(
        selectedModel,
        messagesUntilEdit,
        (content) => {
          currentResponse += content;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...newMessages.slice(0, -1),
                { ...lastMessage, content: currentResponse }
              ];
            } else {
              return [...newMessages, { role: 'assistant', content: currentResponse }];
            }
          });
        }
      );
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate response',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Flex h="100dvh" bg="gray.900" color="gray.100">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onSessionSelect={loadSession}
        onSessionDelete={handleDeleteSession}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <Flex
        direction="column"
        flex={1}
        ml={isSidebarOpen ? "260px" : "0"}
        transition="margin-left 0.3s ease-in-out"
      >
        <Box 
          position="sticky" 
          top={0} 
          zIndex={30}
          bg="gray.900"
          borderBottom="1px"
          borderColor="gray.800"
        >
          <Header
            onStatusChange={setIsServerOnline}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            isModelLoading={isLoadingModels}
            onToggleHistory={toggleSidebar}
          />
        </Box>

        <Flex direction="column" flex={1} position="relative">
          <Container 
            maxW="container.xl" 
            h="full" 
            display="flex" 
            flexDirection="column"
            position="relative"
            px={4}
          >
            <Flex
              direction="column"
              flex={1}
              overflowY="auto"
              py={6}
              gap={6}
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--chakra-colors-gray-700)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'var(--chakra-colors-gray-600)',
                },
              }}
            >
              {messages.length === 0 && (
                <VStack spacing={8} justify="center" flex={1} opacity={0.9}>
                  <Icon as={IoTerminal} boxSize={12} color="green.400" />
                  <VStack spacing={3}>
                    <Text fontSize="2xl" fontWeight="semibold" color="gray.100" textAlign="center">
                      Welcome to AI Chat
                    </Text>
                    <Text fontSize="md" color="gray.400" textAlign="center">
                      Start a conversation or try a quick prompt
                    </Text>
                  </VStack>
                  <HStack spacing={3} wrap="wrap" justify="center">
                    {quickPrompts.map((prompt) => (
                      <Button
                        key={prompt}
                        onClick={() => handleSubmit(prompt)}
                        size="sm"
                        variant="outline"
                        borderColor="gray.700"
                        color="gray.300"
                        _hover={{
                          bg: 'gray.800',
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </HStack>
                </VStack>
              )}

              {messages.length > 0 && (
                <Flex align="center" gap={3} mb={6}>
                  <Text fontSize="2xl" fontWeight="semibold" color="gray.100">
                    {currentSession?.title || 'New Chat'}
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      const newTitle = prompt('Enter new chat title', currentSession?.title || '');
                      if (newTitle && currentSession) {
                        const updatedSession = {...currentSession, title: newTitle};
                        setCurrentSession(updatedSession);
                        saveChatSession(updatedSession);
                        setSessions(getChatHistory());
                      }
                    }}
                  >
                    Edit Title
                  </Button>
                </Flex>
              )}

              {messages.map((message, index) => (
                <Flex
                  key={index}
                  gap={4}
                  alignItems="start"
                  bg={message.role === 'assistant' ? 'gray.800' : 'transparent'}
                  p={4}
                  borderRadius="lg"
                  borderWidth={message.role === 'user' ? 1 : 0}
                  borderColor="gray.700"
                  _hover={{
                    borderColor: message.role === 'user' ? 'gray.600' : 'transparent',
                    bg: message.role === 'assistant' ? 'gray.750' : 'gray.800',
                  }}
                  transition="all 0.2s"
                  position="relative"
                  role="group"
                >
                  <Icon
                    as={message.role === 'assistant' ? IoTerminal : FiUser}
                    boxSize={6}
                    color={message.role === 'assistant' ? 'green.400' : 'blue.400'}
                    mt={1}
                  />
                  <Box flex={1}>
                    {editingMessageIndex === index ? (
                      <Flex gap={2}>
                        <Textarea
                          defaultValue={message.content}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleEditMessage(index, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              setEditingMessageIndex(null);
                            }
                          }}
                          onBlur={(e) => handleEditMessage(index, e.target.value)}
                          bg="gray.800"
                          border="1px solid"
                          borderColor="gray.700"
                          _hover={{
                            borderColor: 'gray.600',
                          }}
                          _focus={{
                            borderColor: 'green.400',
                            boxShadow: '0 0 0 1px var(--chakra-colors-green-400)',
                          }}
                          color="gray.100"
                          resize="none"
                          rows={1}
                          py={2}
                        />
                      </Flex>
                    ) : (
                      <Box position="relative">
                        <Text whiteSpace="pre-wrap">{message.content}</Text>
                        {message.role === 'user' && (
                          <IconButton
                            aria-label="Edit message"
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="ghost"
                            position="absolute"
                            top={-2}
                            right={-2}
                            opacity={0.6}
                            _groupHover={{ opacity: 1 }}
                            onClick={() => setEditingMessageIndex(index)}
                            color="gray.400"
                            _hover={{
                              bg: 'gray.700',
                              color: 'gray.200'
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </Flex>
              ))}

              {isGenerating && (
                <Flex gap={4} alignItems="start" bg="gray.800" p={4} borderRadius="lg">
                  <Icon as={IoTerminal} boxSize={6} color="green.400" mt={1} />
                  <Box flex={1}>
                    <Flex gap={2}>
                      <Box
                        h={2}
                        w={2}
                        borderRadius="full"
                        bg="green.400"
                        animation={`${pulseAnimation} 1s infinite`}
                      />
                      <Box
                        h={2}
                        w={2}
                        borderRadius="full"
                        bg="green.400"
                        animation={`${pulseAnimation} 1s infinite`}
                        style={{ animationDelay: '0.2s' }}
                      />
                      <Box
                        h={2}
                        w={2}
                        borderRadius="full"
                        bg="green.400"
                        animation={`${pulseAnimation} 1s infinite`}
                        style={{ animationDelay: '0.4s' }}
                      />
                    </Flex>
                  </Box>
                </Flex>
              )}

              <div ref={messagesEndRef} />
            </Flex>

            <Box 
              py={4} 
              borderTop="1px" 
              borderColor="gray.800"
              bg="gray.900"
              position="sticky"
              bottom={0}
              left={0}
              right={0}
              mt="auto"
            >
              <ChatInput
                onSubmit={handleSubmit}
                isDisabled={!isServerOnline || !selectedModel || isGenerating}
                placeholder={
                  !isServerOnline
                    ? 'Ollama server is not running...'
                    : !selectedModel
                    ? 'Select a model to start chatting...'
                    : 'Message Ollama...'
                }
                inputRef={chatInputRef}
              />
            </Box>
          </Container>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Chat;