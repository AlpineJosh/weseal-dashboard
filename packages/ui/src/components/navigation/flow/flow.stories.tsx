import type { Meta, StoryObj } from "@storybook/react";

import type { FlowProps } from "./flow.component";
import { Flow } from "./flow.component";

const meta: Meta<FlowProps> = {
  title: "Navigation/Flow",
  component: Flow,
};

export default meta;

type Story = StoryObj<FlowProps>;

export const Default: Story = {
  args: {},
};