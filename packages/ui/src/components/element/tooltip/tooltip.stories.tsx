import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { TextLink } from "@repo/ui/components/typography";

import { Tooltip, TooltipProps } from "./tooltip.component";

const meta: Meta<TooltipProps> = {
  title: "Overlay/Tooltip",
  component: Tooltip,
};

export default meta;

type Story = StoryObj<TooltipProps>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TextLink>Trigger</TextLink>
      <Tooltip.Tip>Tip</Tooltip.Tip>
    </Tooltip>
  ),
  args: {},
};
