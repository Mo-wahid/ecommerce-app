import type { Meta, StoryObj } from '@storybook/react';
import AdminSidebar from '@/components/AdminSidebar';
import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/components/ui/sidebar';

const meta: Meta<typeof AdminSidebar> = {
  title: 'Admin/AdminSidebar',
  component: AdminSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SessionProvider session={{ user: { name: "Admin", email: "admin@gmail.com" }, expires: "1" } as any}>
        <SidebarProvider>
          <div className="flex h-screen w-[250px] bg-background border-r">
            <Story />
          </div>
        </SidebarProvider>
      </SessionProvider>
    )
  ],
};

export default meta;
type Story = StoryObj<typeof AdminSidebar>;

export const Default: Story = {};

