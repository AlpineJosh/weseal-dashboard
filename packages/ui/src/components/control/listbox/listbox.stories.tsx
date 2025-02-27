import type { Meta, StoryObj } from "@storybook/react";

import type { ListboxProps } from "./listbox.component";
import { Option } from "../option/option.component";
import { Listbox } from "./listbox.component";

const meta: Meta<ListboxProps<string, { id: string; name: string }>> = {
  title: "Control/Listbox",
  component: Listbox,
};

export default meta;

type Story = StoryObj<ListboxProps<string, { id: string; name: string }>>;

const options = [
  { id: "chocolate", name: "Chocolate" },
  { id: "mint", name: "Mint" },
  { id: "strawberry", name: "Strawberry" },
  { id: "vanilla", name: "Vanilla" },
];

export const Default: Story = {
  render: (args) => (
    <Listbox aria-label="Ice cream flavor" {...args}>
      {(option) => (
        <Option key={option.id} value={option.id}>
          {option.name}
        </Option>
      )}
    </Listbox>
  ),
  args: {
    className: "bg-white shadow-md",
    options,
  },
};
