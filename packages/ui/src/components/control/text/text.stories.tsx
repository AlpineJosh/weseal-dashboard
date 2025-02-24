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
  args: { className: "w-[200px]", placeholder: "Enter text" },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const Invalid: Story = {
  args: { ...Default.args, "data-invalid": true },
};
