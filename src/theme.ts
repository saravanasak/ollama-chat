import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'gray.100',
      },
    },
  },
  colors: {
    gray: {
      900: '#111827',
      800: '#1F2937',
      700: '#374151',
      600: '#4B5563',
      500: '#6B7280',
      400: '#9CA3AF',
      300: '#D1D5DB',
      200: '#E5E7EB',
      100: '#F3F4F6',
      50: '#F9FAFB',
    },
    green: {
      500: '#10B981',
      400: '#34D399',
      300: '#6EE7B7',
      200: '#A7F3D0',
      100: '#D1FAE5',
      50: '#ECFDF5',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'green',
      },
      variants: {
        outline: {
          borderColor: 'gray.700',
          _hover: {
            bg: 'gray.800',
          },
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'gray.900',
          borderColor: 'gray.700',
        },
        item: {
          bg: 'gray.900',
          _hover: {
            bg: 'gray.800',
          },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'green.500',
      },
      variants: {
        outline: {
          field: {
            bg: 'gray.800',
            borderColor: 'gray.700',
            _hover: {
              borderColor: 'gray.600',
            },
          },
        },
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'green.500',
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'green.500',
      },
      variants: {
        outline: {
          bg: 'gray.800',
          borderColor: 'gray.700',
          _hover: {
            borderColor: 'gray.600',
          },
        },
      },
    },
  },
});

export default theme;
