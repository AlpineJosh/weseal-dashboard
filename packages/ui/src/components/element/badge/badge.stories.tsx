import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { BadgeProps } from "./badge.component";
import { ColorVariants, colorVariants } from "../../../lib/colors";
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

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-2">
      {Object.keys(colorVariants).map((color) => (
        <span>
          <Badge key={color} color={color as ColorVariants}>
            {color}
          </Badge>
        </span>
      ))}
    </div>
  ),
};
