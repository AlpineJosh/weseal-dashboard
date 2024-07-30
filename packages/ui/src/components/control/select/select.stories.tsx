import type { Meta, StoryObj } from "@storybook/react";

import type { SelectProps } from "./select.component";
import { Select, SelectItem } from "./select.component";

const meta: Meta<SelectProps<object>> = {
  title: "Control/Select",
  component: Select,
};

export default meta;

type Story = StoryObj<SelectProps<{ label: string; value: string }>>;

export const Default: Story = {
  render: (args) => {
    return (
      <Select {...args}>
        {(item) => <SelectItem id={item.value}>{item.label}</SelectItem>}
      </Select>
    );
  },
  args: {
    items: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
      { label: "Option 3", value: "option3" },
    ],
  },
};
