import type { Meta, StoryObj } from '@storybook/react';
import ProductCard from '@/components/ProductCard';

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[300px] h-[400px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ProductCard>;

const mockProduct = {
  _id: '123',
  name: 'Premium Wireless Headphones',
  price: 299.99,
  category: 'Electronics',
  stock: 15,
  imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
};

export const Default: Story = {
  args: {
    product: mockProduct as any,
  },
};

export const OutOfStock: Story = {
  args: {
    product: {
      ...mockProduct,
      stock: 0,
    } as any,
  },
};

export const NoImage: Story = {
  args: {
    product: {
      ...mockProduct,
      imageUrl: '',
    } as any,
  },
};

