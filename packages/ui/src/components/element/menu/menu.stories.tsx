import type { Meta, StoryObj } from "@storybook/react";
import { ComponentType } from "react";

import type { MenuItemProps, MenuProps } from "./menu.component";
import { Menu } from "./menu.component";

const meta: Meta<MenuProps<object>> = {
  title: "Element/Menu",
  component: Menu,
  subcomponents: {
    Item: Menu.Item as ComponentType<unknown>,
  },
};

export default meta;

type Story = StoryObj<MenuProps<object>>;

export const Default: Story = {
  render: () => (
    <Menu label="Menu">
      <Menu.Item>Item 1</Menu.Item>
      <Menu.Item>Item 2</Menu.Item>
      <Menu.Item>Item 3</Menu.Item>
    </Menu>
  ),
  args: {},
};
