import type { Meta, StoryObj } from "@storybook/react";

import type { InputProps } from "./input.component";
import { Input } from "./input.component";

const meta: Meta<InputProps> = {
  title: "Control/Input",
  component: Input,
};

export default meta;

type Story = StoryObj<InputProps>;

export const Default: Story = {
  args: { className: "w-[200px] bg-white" },
};
