import type { Meta, StoryObj } from '@storybook/react';
import AuthModal from './AuthModal';
import { AuthModalProvider, useAuthModal } from '@/context/AuthModalContext';
import { useEffect } from 'react';

// Wrapper component to automatically open the modal for Storybook
const AuthModalStoryWrapper = ({ type }: { type: 'login' | 'register' }) => {
  const { openModal } = useAuthModal();
  
  useEffect(() => {
    openModal(type);
  }, [type, openModal]);

  return <AuthModal />;
};

const meta: Meta<typeof AuthModal> = {
  title: 'Forms/AuthModal',
  component: AuthModal,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
        query: {},
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthModalProvider>
        <Story />
      </AuthModalProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AuthModal>;

export const LoginView: Story = {
  render: () => <AuthModalStoryWrapper type="login" />,
};

export const RegisterView: Story = {
  render: () => <AuthModalStoryWrapper type="register" />,
};
