import type { Meta, StoryObj } from "@storybook/react";
import React, { ComponentType } from "react";

import { Button } from "../button";
import { Menu, MenuProps } from "./menu.component";

const meta: Meta<MenuProps> = {
  title: "Element/Menu",
  component: Menu,
  subcomponents: {
    Item: Menu.Item as ComponentType<unknown>,
  },
};

export default meta;

type Story = StoryObj<MenuProps>;

export const Default: Story = {
  render: () => (
    <Menu>
      <Button>Menu</Button>
      <Menu.Items>
        <Menu.Item>Item 1</Menu.Item>
        <Menu.Item>Item 2</Menu.Item>
        <Menu.Item>Item 3</Menu.Item>
      </Menu.Items>
    </Menu>
  ),
  args: {},
};
