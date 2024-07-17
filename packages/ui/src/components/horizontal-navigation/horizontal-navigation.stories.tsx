import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./horizontal-navigation";

const meta: Meta<typeof NavigationMenu> = {
  component: NavigationMenu as React.ComponentType,
  title: "Components/NavigationMenu",
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  render: (args: ComponentProps<typeof NavigationMenu>) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu 1</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">Link 1</NavigationMenuLink>
            <NavigationMenuLink href="#">Link 2</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu 2</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">Link 3</NavigationMenuLink>
            <NavigationMenuLink href="#">Link 4</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
      <NavigationMenuViewport />
    </NavigationMenu>
  ),
};

export const WithSubmenus: Story = {
  render: (args: ComponentProps<typeof NavigationMenu>) => (
    <NavigationMenu {...args}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu 1</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">Submenu 1-1</NavigationMenuLink>
            <NavigationMenuLink href="#">Submenu 1-2</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu 2</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">Submenu 2-1</NavigationMenuLink>
            <NavigationMenuLink href="#">Submenu 2-2</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu 3</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="#">Submenu 3-1</NavigationMenuLink>
            <NavigationMenuLink href="#">Submenu 3-2</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
      <NavigationMenuViewport />
    </NavigationMenu>
  ),
};

export const WithCustomStyles: Story = {
  render: (args: ComponentProps<typeof NavigationMenu>) => (
    <NavigationMenu {...args} className="rounded bg-gray-800 p-4 text-white">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="hover:bg-gray-700">
            Menu 1
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-gray-700">
            <NavigationMenuLink href="#" className="hover:bg-gray-600">
              Link 1
            </NavigationMenuLink>
            <NavigationMenuLink href="#" className="hover:bg-gray-600">
              Link 2
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="hover:bg-gray-700">
            Menu 2
          </NavigationMenuTrigger>
          <NavigationMenuContent className="bg-gray-700">
            <NavigationMenuLink href="#" className="hover:bg-gray-600">
              Link 3
            </NavigationMenuLink>
            <NavigationMenuLink href="#" className="hover:bg-gray-600">
              Link 4
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
      <NavigationMenuViewport />
    </NavigationMenu>
  ),
};
