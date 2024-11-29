import type { Meta, StoryObj } from "@storybook/react";

import { faHome } from "@repo/pro-solid-svg-icons";
import { Icon } from "@repo/ui/components/element";

import type { SidebarMenuProps } from "./sidebar-menu.component";
import { SidebarMenu } from "./sidebar-menu.component";

const meta: Meta<SidebarMenuProps> = {
  title: "Navigation/Sidebar Menu",
  component: SidebarMenu,
};

export default meta;

type Story = StoryObj<SidebarMenuProps>;

export const Default: Story = {
  render: () => (
    <div className="p w-64 rounded-lg bg-background-muted">
      <SidebarMenu>
        <SidebarMenu.Item>
          <Icon icon={faHome} />
          <SidebarMenu.Label>Home</SidebarMenu.Label>
        </SidebarMenu.Item>
        <SidebarMenu.Item>Home</SidebarMenu.Item>
        <SidebarMenu.ItemGroup>
          <SidebarMenu.Item>Home</SidebarMenu.Item>
          <SidebarMenu.SubItems>
            <SidebarMenu.Item>Sub Item 1</SidebarMenu.Item>
          </SidebarMenu.SubItems>
        </SidebarMenu.ItemGroup>
        <SidebarMenu.Item>Home</SidebarMenu.Item>
        <SidebarMenu.ItemGroup>
          <SidebarMenu.Item>
            <Icon icon={faHome} />
            <SidebarMenu.Label>Home</SidebarMenu.Label>
          </SidebarMenu.Item>
          <SidebarMenu.SubItems>
            <SidebarMenu.Item>Sub Item 1</SidebarMenu.Item>
            <SidebarMenu.ItemGroup>
              <SidebarMenu.Item>Sub Item 2</SidebarMenu.Item>
              <SidebarMenu.SubItems>
                <SidebarMenu.Item>Sub Item 2-1</SidebarMenu.Item>
              </SidebarMenu.SubItems>
            </SidebarMenu.ItemGroup>
          </SidebarMenu.SubItems>
        </SidebarMenu.ItemGroup>
      </SidebarMenu>
    </div>
  ),
};
