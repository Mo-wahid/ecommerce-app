import type { Meta, StoryObj } from '@storybook/react';
import ProductFormModal from './ProductFormModal';

const meta: Meta<typeof ProductFormModal> = {
  title: 'Forms/ProductFormModal',
  component: ProductFormModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductFormModal>;

export const AddNewProduct: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('close'),
    onSuccess: () => console.log('success'),
    product: null,
  },
};

export const EditProduct: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('close'),
    onSuccess: () => console.log('success'),
    product: {
      _id: "123",
      name: "Premium Headphones",
      description: "Noise-cancelling wireless headphones with 30-hour battery life.",
      price: 299.99,
      stock: 50,
      category: "Electronics",
      isFeatured: true,
      imageUrl: "https://via.placeholder.com/400",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any,
  },
};
