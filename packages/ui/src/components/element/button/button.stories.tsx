import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { faPlus } from "@fortawesome/pro-light-svg-icons";

import type { ButtonProps } from "./button.component";
import { Icon } from "..";
import { Button } from "./button.component";

const meta: Meta<ButtonProps> = {
  title: "Element/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  render: (args) => <Button {...args}>Button</Button>,
  args: {
    children: "Button",
  },
};

export const Solid: Story = {
  render: (args) => (
    <Button {...args}>Test</Button>
    // <div className="grid grid-cols-5 gap-2">
    //   {Object.keys(colorVariants).map((color) => (
    //     <Button key={color} {...args} color={color as any}>
    //       {color}
    //     </Button>
    //   ))}
    // </div>
  ),
  args: {
    children: "Button",
    variant: "solid",
  },
};

export const Outline: Story = {
  ...Solid,
  args: {
    variant: "outline",
  },
};

export const Plain: Story = {
  ...Solid,
  args: {
    variant: "plain",
  },
};

export const Input: Story = {
  ...Default,
  args: {
    variant: "input",
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Icon icon={faPlus} />
      Button
    </Button>
  ),
};
