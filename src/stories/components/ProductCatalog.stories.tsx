import type { Meta, StoryObj } from '@storybook/react';
import ProductCatalog from '@/components/ProductCatalog';
import { Suspense } from 'react';

const meta: Meta<typeof ProductCatalog> = {
  title: 'Components/ProductCatalog',
  component: ProductCatalog,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: {
        query: {},
      }
    },
  },
  decorators: [
    (Story) => (
      <Suspense fallback={<div>Loading...</div>}>
        <Story />
      </Suspense>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductCatalog>;

const mockProducts = [
  {
    _id: '1',
    name: 'Wireless Earbuds',
    price: 99.99,
    category: 'Electronics',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6f1115ea905a?w=500',
  },
  {
    _id: '2',
    name: 'Mechanical Keyboard',
    price: 149.99,
    category: 'Electronics',
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500',
  },
  {
    _id: '3',
    name: 'Cotton T-Shirt',
    price: 19.99,
    category: 'Clothing',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
  },
  {
    _id: '4',
    name: 'Running Shoes',
    price: 89.99,
    category: 'Clothing',
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
  },
  {
    _id: '5',
    name: 'Leather Wallet',
    price: 49.99,
    category: 'Accessories',
    stock: 5,
    imageUrl: '',
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

