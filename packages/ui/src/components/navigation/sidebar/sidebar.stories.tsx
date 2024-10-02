import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import React from "react";

import { faHome } from "@repo/pro-solid-svg-icons";
import { Button, Icon } from "@repo/ui/components/element";
import { Dialog } from "@repo/ui/components/utility";

import type { SidebarProps } from "./sidebar.component";
import { Sidebar } from "./sidebar.component";

const meta: Meta<SidebarProps> = {
  title: "Navigation/Sidebar",
  component: Sidebar,
};

export default meta;

type Story = StoryObj<SidebarProps>;

export const Default: Story = {
  render: () => (
    <div className="p w-64 rounded-lg bg-background-muted">
      <Sidebar>
        <Sidebar.Header>Title</Sidebar.Header>
        <Sidebar.Body>
          <Sidebar.Section>
            <Sidebar.Item href="/">
              <Icon icon={faHome} />
              <Sidebar.Label>Home</Sidebar.Label>
            </Sidebar.Item>
            <Sidebar.Item href="/">Home</Sidebar.Item>
            <Sidebar.Item href="/">Home</Sidebar.Item>
            <Sidebar.Item href="/">Home</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Body>
      </Sidebar>
    </div>
  ),
};
