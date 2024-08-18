import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@repo/ui/components/element";

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
      <Button>Trigger</Button>
      <Tooltip.Tip>Tip</Tooltip.Tip>
    </Tooltip>
  ),
  args: {},
};
