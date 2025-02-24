import React from 'react';
import {
  Box,
  VStack,
  Text,
  IconButton,
  Flex,
  Button,
  Tooltip,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { FiTrash2, FiMessageSquare, FiPlus, FiX } from 'react-icons/fi';
import { ChatSession } from '../services/chatHistory';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionDelete,
  onNewChat,
  isOpen,
  onClose,
}) => {
  return (
    <Box
      w="260px"
      h="100vh"
      bg="gray.900"
      borderRight="1px"
      borderColor="gray.800"
      position="fixed"
      left={0}
      top={0}
      zIndex={20}
      transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
      transition="transform 0.3s ease-in-out"
    >
      <Flex direction="column" h="full">
        <Flex justify="space-between" align="center" p={2}>
          <Button
            w="full"
            size="sm"
            variant="ghost"
            leftIcon={<FiPlus />}
            onClick={onNewChat}
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            color="gray.300"
            fontWeight="medium"
            _hover={{
              bg: 'gray.800',
            }}
          >
            New Chat
          </Button>
          <IconButton
            aria-label="Close sidebar"
            icon={<FiX />}
            size="sm"
            variant="ghost"
            onClick={onClose}
          />
        </Flex>

        <Divider borderColor="gray.800" mb={2} />

        <VStack
          spacing={1}
          align="stretch"
          flex={1}
          overflowY="auto"
          px={2}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--chakra-colors-gray-700)',
              borderRadius: '4px',
            },
          }}
        >
          {sessions.map((session) => (
            <Flex
              key={session.id}
              p={2}
              cursor="pointer"
              borderRadius="md"
              bg={currentSessionId === session.id ? 'gray.800' : 'transparent'}
              _hover={{ bg: currentSessionId === session.id ? 'gray.800' : 'gray.800' }}
              onClick={() => {
                onSessionSelect(session.id);
                onClose();
              }}
              justify="space-between"
              align="center"
              role="group"
            >
              <Flex align="center" gap={2} flex={1} overflow="hidden">
                <Icon as={FiMessageSquare} color="gray.400" boxSize={4} />
                <Text
                  color="gray.100"
                  fontSize="sm"
                  fontWeight={currentSessionId === session.id ? 'medium' : 'normal'}
                  noOfLines={1}
                >
                  {session.title}
                </Text>
              </Flex>
              <IconButton
                aria-label="Delete chat"
                icon={<FiTrash2 size="14px" />}
                variant="ghost"
                size="xs"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionDelete(session.id);
                }}
                opacity={0}
                _groupHover={{ opacity: 1 }}
              />
            </Flex>
          ))}
        </VStack>
      </Flex>
    </Box>
  );
};

export default ChatSidebar;
