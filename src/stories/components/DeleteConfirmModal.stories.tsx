import type { Meta, StoryObj } from "@storybook/react";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const meta: Meta<typeof DeleteConfirmModal> = {
  title: "Components/DeleteConfirmModal",
  component: DeleteConfirmModal,
  parameters: {
    layout: "centered",
  },
  args: {
    onConfirm: () => console.log('confirm'),
    onCancel: () => console.log('cancel'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    itemName: "Smartphone",
    isDeleting: false,
  },
};

export const Deleting: Story = {
  args: {
    isOpen: true,
    itemName: "Smartphone",
    isDeleting: true,
  },
};

