import type { Meta, StoryObj } from "@storybook/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faPlus } from "@repo/pro-light-svg-icons";

import type { ButtonProps } from "./button.component";
import { Button } from "./button.component";

const meta: Meta<ButtonProps> = {
  title: "Element/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

export const Primary: Story = {
  args: {
    ...Default.args,
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: "secondary",
  },
};

export const Accent: Story = {
  args: {
    ...Default.args,
    variant: "accent",
  },
};

export const Outline: Story = {
  args: {
    ...Default.args,
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    ...Default.args,
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    ...Default.args,
    variant: "link",
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: "lg",
  },
};

export const Icon: Story = {
  args: {
    ...Default.args,
    children: <FontAwesomeIcon size="lg" icon={faPlus} />,
    size: "icon",
  },
};
