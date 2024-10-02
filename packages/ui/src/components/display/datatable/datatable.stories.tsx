import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { DatatableProps } from "./datatable.component";
import { Datatable } from "./datatable.component";

const meta: Meta<DatatableProps<any>> = {
  title: "Display/Datatable",
  component: Datatable,
};

export default meta;

type Story = StoryObj<DatatableProps<any>>;

const data = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30,
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane.doe@example.com",
    age: 25,
  },
  {
    id: 3,
    name: "John Smith",
    email: "john.smith@example.com",
    age: 35,
  },
];

const columns = [
  {
    id: "name",
    key: "name",
    label: "Name",
    allowsSorting: true,
    isRowHeader: true,
    cell: (row) => <Datatable.Cell>{row.name}</Datatable.Cell>,
  },
  {
    id: "email",
    key: "email",
    label: "Email",
    cell: (row) => <Datatable.Cell>{row.email}</Datatable.Cell>,
  },
  {
    id: "age",
    key: "age",
    label: "Age",
    cell: (row) => <Datatable.Cell>{row.age}</Datatable.Cell>,
  },
];

export const Default: Story = {
  render: (args) => <Datatable className="w-full" {...args} />,
  args: {
    columns,
    data,
  },
};
