import React, { useState, useRef, useEffect } from 'react';
import {
  Textarea,
  Box,
  IconButton,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  isDisabled = false,
  placeholder = 'Message Ollama...',
  inputRef,
}) => {
  const [message, setMessage] = useState('');
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef || localTextareaRef;

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <Box>
      <Flex gap={2}>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          minH="44px"
          maxH="200px"
          resize="none"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          _hover={{
            borderColor: isDisabled ? 'gray.700' : 'gray.600',
          }}
          _focus={{
            borderColor: 'green.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-green-400)',
          }}
          color="gray.100"
          _placeholder={{
            color: 'gray.500',
          }}
          pr="40px"
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
        />
        <Tooltip label="Send message" placement="top">
          <IconButton
            aria-label="Send message"
            icon={<FiSend />}
            onClick={handleSubmit}
            isDisabled={isDisabled || !message.trim()}
            colorScheme="green"
            variant="ghost"
            size="md"
            _hover={{
              bg: 'gray.700',
            }}
          />
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default ChatInput;
