import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { CheckboxProps } from "./checkbox.component";
import { Checkbox } from "./checkbox.component";

const meta: Meta<CheckboxProps> = {
  title: "Control/Checkbox",
  component: Checkbox,
};

export default meta;

type Story = StoryObj<CheckboxProps>;

export const Default: Story = {
  render: (args) => {
    return <Checkbox {...args} />;
  },
};

export const Selected: Story = {
  ...Default,
  args: {
    isSelected: true,
  },
};

export const Indeterminate: Story = {
  ...Default,
  args: {
    isSelected: true,
    isIndeterminate: true,
  },
};

export const Disabled: Story = {
  ...Default,
  args: {
    isDisabled: true,
    isSelected: true,
  },
};
