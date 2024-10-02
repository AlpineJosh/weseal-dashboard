import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { SwitchProps } from "./switch.component";
import { Switch } from "./switch.component";

const meta: Meta<SwitchProps> = {
  title: "Control/Switch",
  component: Switch,
};

export default meta;

type Story = StoryObj<SwitchProps>;

export const Default: Story = {
  render: (args) => {
    return <Switch {...args} />;
  },
};
