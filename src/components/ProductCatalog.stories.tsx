import type { Meta, StoryObj } from '@storybook/react';
import ProductCatalog from './ProductCatalog';

const meta: Meta<typeof ProductCatalog> = {
  title: 'Components/ProductCatalog',
  component: ProductCatalog,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductCatalog>;

const mockProducts = [
  {
    _id: '1',
    name: 'Wireless Earbuds',
    description: 'Compact and powerful.',
    price: 99.99,
    category: 'Electronics',
    stock: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6f1115ea905a?w=500' }],
    isFeatured: false,
  },
  {
    _id: '2',
    name: 'Mechanical Keyboard',
    description: 'Clicky keys.',
    price: 149.99,
    category: 'Electronics',
    stock: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500' }],
    isFeatured: true,
  },
  {
    _id: '3',
    name: 'Cotton T-Shirt',
    description: '100% Cotton.',
    price: 19.99,
    category: 'Clothing',
    stock: 100,
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' }],
    isFeatured: false,
  },
  {
    _id: '4',
    name: 'Running Shoes',
    description: 'Lightweight.',
    price: 89.99,
    category: 'Clothing',
    stock: 0,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' }],
    isFeatured: true,
  },
];

export const Default: Story = {
  args: {
    initialProducts: mockProducts as any,
  },
};

export const EmptyCatalog: Story = {
  args: {
    initialProducts: [],
  },
};
