import type { Meta, StoryObj } from "@storybook/react";

import type { BadgeProps } from "./badge.component";
import { Badge } from "./badge.component";

const meta: Meta<BadgeProps> = {
  title: "Element/Badge",
  component: Badge,
};

export default meta;

type Story = StoryObj<BadgeProps>;

export const Default: Story = {
  render: (args) => <Badge {...args}>Default</Badge>,
};

export const Primary: Story = {
  ...Default,
  args: {
    variant: "primary",
  },
};

export const Secondary: Story = {
  ...Default,
  args: {
    variant: "secondary",
  },
};

export const Accent: Story = {
  ...Default,
  args: {
    variant: "accent",
  },
};

export const Outline: Story = {
  ...Default,
  args: {
    variant: "outline",
  },
};
