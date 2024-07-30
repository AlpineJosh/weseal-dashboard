import type { Meta, StoryObj } from "@storybook/react";

import type { IconProps } from "./icon.component";
import { Icon } from "./icon.component";

const meta: Meta<IconProps> = {
  title: "Primitives/Icon",
  component: Icon,
};

export default meta;

type Story = StoryObj<IconProps>;

export const Default: Story = {
  args: {},
};