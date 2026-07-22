import type { Meta, StoryObj } from "@storybook/react";
import ProfileForm from "./ProfileForm";
import { SessionProvider } from "next-auth/react";

const meta: Meta<typeof ProfileForm> = {
  title: "Components/ProfileForm",
  component: ProfileForm,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <SessionProvider session={{ user: { name: "Test User", email: "test@example.com", role: "user", image: "https://github.com/shadcn.png" }, expires: "1" } as any}>
        <div className="w-full max-w-2xl mx-auto py-8">
          <Story />
        </div>
      </SessionProvider>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LoadingState: Story = {
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <div className="w-full max-w-2xl mx-auto py-8">
          <Story />
        </div>
      </SessionProvider>
    )
  ]
};
