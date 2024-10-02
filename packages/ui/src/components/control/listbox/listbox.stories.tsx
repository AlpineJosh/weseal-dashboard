import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { ListboxProps } from "./listbox.component";
import { Listbox } from "./listbox.component";

const meta: Meta<ListboxProps<object>> = {
  title: "Control/Listbox",
  component: Listbox,
};

export default meta;

type Story = StoryObj<ListboxProps<{ id: string; name: string }>>;

export const Default: Story = {
  render: (args) => (
    <Listbox aria-label="Ice cream flavor" {...args}>
      <Listbox.Option id="chocolate">Chocolate</Listbox.Option>
      <Listbox.Option id="mint">Mint</Listbox.Option>
      <Listbox.Option id="strawberry">Strawberry</Listbox.Option>
      <Listbox.Option id="vanilla">Vanilla</Listbox.Option>
    </Listbox>
  ),
  args: {
    className: "bg-white shadow-md",
    selectionMode: "single",
  },
};
