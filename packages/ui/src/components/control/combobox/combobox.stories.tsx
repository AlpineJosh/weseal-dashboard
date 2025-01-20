import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { ComboboxProps } from "./combobox.component";
import { Option } from "../option/option.component";
import { Combobox } from "./combobox.component";

const meta: Meta<ComboboxProps<string, { id: string; name: string }>> = {
  title: "Control/Combobox",
  component: Combobox,
};

export default meta;

const options = [
  { id: "chocolate", name: "Chocolate" },
  { id: "mint", name: "Mint" },
  { id: "strawberry", name: "Strawberry" },
  { id: "vanilla", name: "Vanilla" },
];

type Story = StoryObj<ComboboxProps<string, { id: string; name: string }>>;

export const Default: Story = {
  render: (args) => {
    return (
      <Combobox options={options} {...args}>
        {(item) => (
          <Option key={item.id} value={item.id}>
            {item.name}
          </Option>
        )}
      </Combobox>
    );
  },
  args: {
    options,
  },
};

// export const Loading: Story = {
//   ...Default,
//   args: {
//     ...Default.args,
//     options: () => {
//       return {
//         isLoading: true,
//         data: undefined,
//         error: undefined,
//       };
//     },
//   },
// };
