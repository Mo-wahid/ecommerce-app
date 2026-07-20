import type { Meta, StoryObj } from '@storybook/react';
import { SessionProvider } from 'next-auth/react';
import Navbar from './Navbar';

const meta: Meta<typeof Navbar> = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

// Mock session provider decorator
const withSession = (session: any) => (Story: any) => (
  <SessionProvider session={session}>
    <Story />
  </SessionProvider>
);

export const LoggedOut: Story = {
  decorators: [withSession(null)],
};

export const LoggedInUser: Story = {
  decorators: [
    withSession({
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      },
      expires: '9999-12-31T23:59:59.999Z',
    }),
  ],
};

export const LoggedInAdmin: Story = {
  decorators: [
    withSession({
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
      expires: '9999-12-31T23:59:59.999Z',
    }),
  ],
};
