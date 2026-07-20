import type { Meta, StoryObj } from '@storybook/react';
import ProductCard from './ProductCard';

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[300px]">
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
  description: 'High-quality noise-canceling headphones with 30-hour battery life.',
  price: 299.99,
  category: 'Electronics',
  stock: 15,
  images: [
    { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop' }
  ],
  isFeatured: true,
};

export const Default: Story = {
  args: {
    product: mockProduct,
  },
};

export const OutOfStock: Story = {
  args: {
    product: {
      ...mockProduct,
      stock: 0,
    },
  },
};

export const NoImage: Story = {
  args: {
    product: {
      ...mockProduct,
      images: [],
    },
  },
};
