import type { Meta, StoryObj } from '@storybook/react';
import AddToCartSection from './AddToCartSection';
import { SessionProvider } from 'next-auth/react';
import { AuthModalProvider } from '@/context/AuthModalContext';

const meta: Meta<typeof AddToCartSection> = {
  title: 'Components/AddToCartSection',
  component: AddToCartSection,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SessionProvider session={{ user: { name: "User", email: "user@gmail.com", id: "user-123" } as any, expires: "1" }}>
        <AuthModalProvider>
          <div className="w-[400px]">
            <Story />
          </div>
        </AuthModalProvider>
      </SessionProvider>
    )
  ],
};

export default meta;
type Story = StoryObj<typeof AddToCartSection>;

export const InStock: Story = {
  args: {
    productId: 'prod_123',
    stock: 15,
    price: 99.99,
  },
};

export const LowStock: Story = {
  args: {
    productId: 'prod_123',
    stock: 2,
    price: 99.99,
  },
};

export const OutOfStock: Story = {
  args: {
    productId: 'prod_123',
    stock: 0,
    price: 99.99,
  },
};
