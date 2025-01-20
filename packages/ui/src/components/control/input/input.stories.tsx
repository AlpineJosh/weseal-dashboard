import type { Meta, StoryObj } from "@storybook/react";

import type { TextInputProps } from "./input.component";
import { TextInput } from "./input.component";

const meta: Meta<TextInputProps> = {
  title: "Control/Input",
  component: TextInput,
};

export default meta;

type Story = StoryObj<TextInputProps>;

export const Default: Story = {
  args: { className: "w-[200px]" },
};
