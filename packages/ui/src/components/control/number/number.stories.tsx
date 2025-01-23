import type { Meta, StoryObj } from "@storybook/react";

import type { NumberInputProps } from "./number.component";
import { NumberInput } from "./number.component";

const meta: Meta<NumberInputProps> = {
  title: "Control/Number",
  component: NumberInput,
};

export default meta;

type Story = StoryObj<NumberInputProps>;

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
