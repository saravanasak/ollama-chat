import React from 'react';
import { Box, Container, Flex, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import { IoTerminal } from 'react-icons/io5';
import ModelSelector from './ModelSelector';
import ServerStatus from './ServerStatus';

interface HeaderProps {
  onStatusChange: (status: boolean) => void;
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  isModelLoading: boolean;
  onToggleHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onStatusChange,
  models,
  selectedModel,
  onModelChange,
  isModelLoading,
  onToggleHistory,
}) => {
  return (
    <Box 
      py={3} 
      px={4} 
      bg="gray.900"
      position="relative"
      zIndex={10}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <Flex gap={3} align="center">
            <IconButton
              aria-label="Toggle chat history"
              icon={<FiMenu />}
              variant="ghost"
              onClick={onToggleHistory}
              color="gray.400"
              _hover={{
                bg: 'gray.800',
                color: 'gray.200'
              }}
            />
            <Box color="green.400">
              <IoTerminal size={24} />
            </Box>
          </Flex>

          <Flex gap={4} align="center">
            <ServerStatus onChange={onStatusChange} />
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              isLoading={isModelLoading}
            />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;
