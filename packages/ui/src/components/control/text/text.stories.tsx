import type { Meta, StoryObj } from "@storybook/react";

import type { TextInputProps } from "./text.component";
import { TextInput } from "./text.component";

const meta: Meta<TextInputProps> = {
  title: "Control/Text",
  component: TextInput,
};

export default meta;

type Story = StoryObj<TextInputProps>;

export const Default: Story = {
  args: { className: "w-[200px]" },
};

export const Disabled: Story = {
  ...Default,
  args: { disabled: true },
};

export const Invalid: Story = {
  ...Default,
  args: { invalid: true },
};
