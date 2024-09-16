import type { Meta, StoryObj } from "@storybook/react";

import type { DatatableProps } from "./datatable.component";
import { Datatable } from "./datatable.component";

const meta: Meta<DatatableProps> = {
  title: "Display/Datatable",
  component: Datatable,
};

export default meta;

type Story = StoryObj<DatatableProps>;

export const Default: Story = {
  args: {},
};