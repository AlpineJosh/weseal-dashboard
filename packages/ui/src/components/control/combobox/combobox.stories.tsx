import type { Meta, StoryObj } from "@storybook/react";

import type { ComboboxProps } from "./combobox.component";
import { Combobox, ComboboxItem } from "./combobox.component";

const meta: Meta<ComboboxProps<{ id: string; name: string }>> = {
  title: "Control/Combobox",
  component: Combobox,
};

export default meta;

type Story = StoryObj<ComboboxProps<{ id: string; name: string }>>;

export const Default: Story = {
  render: (args) => {
    return (
      <Combobox {...args}>
        {(item) => <ComboboxItem id={item.id}>{item.name}</ComboboxItem>}
      </Combobox>
    );
  },
  args: {
    items: [
      { id: "chocolate", name: "Chocolate" },
      { id: "mint", name: "Mint" },
    ],
  },
};
