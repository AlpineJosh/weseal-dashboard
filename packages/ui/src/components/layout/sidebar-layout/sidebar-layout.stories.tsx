import type { Meta, StoryObj } from "@storybook/react";

import { SidebarLayout } from "./sidebar-layout.component";

const meta: Meta<typeof SidebarLayout> = {
  title: "Layout/Sidebar Layout",
  component: SidebarLayout,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof SidebarLayout>;

export const Default: Story = {
  args: {},
};
