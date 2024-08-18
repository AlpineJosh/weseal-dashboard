import type { Meta, StoryObj } from "@storybook/react";
import { ComponentType } from "react";

import type { ResizablePanelProps } from "./resizable-panel.component";
import { ResizablePanels } from "./resizable-panel.component";

const meta: Meta<ResizablePanelProps> = {
  title: "Layout/Resizeable Panel",
  component: ResizablePanels,
  subcomponents: {
    Panel: ResizablePanels.Panel as ComponentType<unknown>,
    Handle: ResizablePanels.Handle as ComponentType<unknown>,
  },
};

export default meta;

type Story = StoryObj<ResizablePanelProps>;

export const Default: Story = {
  render: (args) => (
    <ResizablePanels {...args}>
      <ResizablePanels.Panel>
        <div>Panel 1</div>
      </ResizablePanels.Panel>
      <ResizablePanels.Panel>
        <div>Panel 2</div>
      </ResizablePanels.Panel>
    </ResizablePanels>
  ),
  args: {},
};
