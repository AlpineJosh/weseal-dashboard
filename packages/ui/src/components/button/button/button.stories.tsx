import type { Meta, StoryObj } from "@storybook/react";
import { faPlus } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { ButtonProps } from "./button.component";
import { Button } from "./button.component";

const meta: Meta<ButtonProps> = {
  title: "Button/Button",
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

export const Destructive: Story = {
  args: {
    ...Default.args,
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    ...Default.args,
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: "secondary",
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
