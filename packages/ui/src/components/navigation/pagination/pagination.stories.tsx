import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Pagination } from "./pagination.component";

const meta: Meta<typeof Pagination> = {
  title: "Navigation/Pagination",
  component: Pagination,
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  render: (args) => <Pagination {...args} />,
  args: {
    currentPage: 6,
    totalPages: 10,
    onPageChange: (page) => console.log(page),
  },
};
