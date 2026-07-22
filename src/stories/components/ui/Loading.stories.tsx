import type { Meta, StoryObj } from '@storybook/react';
import Loading from '@/components/ui/Loading';

const meta: Meta<typeof Loading> = {
  title: 'UI/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
    },
    fullScreen: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = {
  args: {
    message: 'Loading...',
    fullScreen: false,
  },
};

export const NoMessage: Story = {
  args: {
    message: '',
    fullScreen: false,
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'Fetching products...',
    fullScreen: false,
  },
};

