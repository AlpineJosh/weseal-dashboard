import type { Meta, StoryObj } from "@storybook/react";

import { faUser } from "@repo/pro-light-svg-icons";

import type { IconProps } from "./icon.component";
import { Icon } from "./icon.component";

const meta: Meta<IconProps> = {
  title: "Element/Icon",
  component: Icon,
};

export default meta;

type Story = StoryObj<IconProps>;

export const Default: Story = {
  render: () => <Icon icon={faUser} />,
};
