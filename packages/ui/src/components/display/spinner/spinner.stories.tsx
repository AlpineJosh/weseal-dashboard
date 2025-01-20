import type { Meta, StoryObj } from "@storybook/react";

import type { SpinnerProps } from "./spinner.component";
import { Spinner } from "./spinner.component";

const meta: Meta<SpinnerProps> = {
  title: "Display/Spinner",
  component: Spinner,
};

export default meta;

type Story = StoryObj<SpinnerProps>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};
