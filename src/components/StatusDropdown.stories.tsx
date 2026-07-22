import type { Meta, StoryObj } from "@storybook/react";
import StatusDropdown from "./StatusDropdown";

const meta: Meta<typeof StatusDropdown> = {
  title: "Components/StatusDropdown",
  component: StatusDropdown,
  parameters: {
    layout: "centered",
  },
  args: {
    onStatusChange: (v) => console.log('status change', v),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    currentStatus: "Pending",
  },
};

export const Processing: Story = {
  args: {
    currentStatus: "Processing",
  },
};

export const Shipped: Story = {
  args: {
    currentStatus: "Shipped",
  },
};

export const Delivered: Story = {
  args: {
    currentStatus: "Delivered",
  },
};

export const Cancelled: Story = {
  args: {
    currentStatus: "Cancelled",
  },
};
