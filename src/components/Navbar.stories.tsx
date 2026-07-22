import type { Meta, StoryObj } from '@storybook/react';
import { SessionProvider } from 'next-auth/react';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { ThemeProvider } from 'next-themes';
import Navbar from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

const withProviders = (session: any) => (Story: any) => (
  <SessionProvider session={session}>
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthModalProvider>
        <Story />
      </AuthModalProvider>
    </ThemeProvider>
  </SessionProvider>
);

export const LoggedOut: Story = {
  decorators: [withProviders(null)],
};

export const LoggedInUser: Story = {
  decorators: [
    withProviders({
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        image: 'https://i.pravatar.cc/150?u=1'
      },
      expires: '9999-12-31T23:59:59.999Z',
    }),
  ],
};

export const LoggedInAdmin: Story = {
  decorators: [
    withProviders({
      user: {
        id: '2',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        image: 'https://i.pravatar.cc/150?u=2'
      },
      expires: '9999-12-31T23:59:59.999Z',
    }),
  ],
};
