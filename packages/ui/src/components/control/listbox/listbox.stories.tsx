import type { Meta, StoryObj } from "@storybook/react";

import type { ListboxProps } from "./listbox.component";
import { Listbox, ListboxItem } from "./listbox.component";

const meta: Meta<ListboxProps<object>> = {
  title: "Control/Listbox",
  component: Listbox,
};

export default meta;

type Story = StoryObj<ListboxProps<{ id: string; name: string }>>;

export const Default: Story = {
  render: (args) => (
    <Listbox aria-label="Ice cream flavor" {...args}>
      <ListboxItem variant="dropdown" id="chocolate">
        Chocolate
      </ListboxItem>
      <ListboxItem variant="dropdown" id="mint">
        Mint
      </ListboxItem>
      <ListboxItem variant="dropdown" id="strawberry">
        Strawberry
      </ListboxItem>
      <ListboxItem variant="dropdown" id="vanilla">
        Vanilla
      </ListboxItem>
    </Listbox>
  ),
  args: {
    className: "bg-white shadow-md",
    selectionMode: "single",
  },
};
