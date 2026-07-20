import type { Meta, StoryObj } from '@storybook/react';
import SelectFilter from './SelectFilter';

const meta: Meta<typeof SelectFilter> = {
  title: 'UI/SelectFilter',
  component: SelectFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectFilter>;

const sampleOptions = [
  { label: 'All Categories', value: 'All' },
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Books', value: 'Books' },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
  },
};

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    disabled: true,
  },
};
