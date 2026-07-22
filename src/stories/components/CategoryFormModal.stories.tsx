import type { Meta, StoryObj } from '@storybook/react';
import CategoryFormModal from '@/components/CategoryFormModal';

const meta: Meta<typeof CategoryFormModal> = {
  title: 'Forms/CategoryFormModal',
  component: CategoryFormModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CategoryFormModal>;

export const AddNewCategory: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('close'),
    onSuccess: () => console.log('success'),
    category: null,
  },
};

export const EditCategory: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('close'),
    onSuccess: () => console.log('success'),
    category: {
      _id: "cat_1",
      name: "Electronics",
      description: "Electronic devices and accessories",
      image: "https://via.placeholder.com/500",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

