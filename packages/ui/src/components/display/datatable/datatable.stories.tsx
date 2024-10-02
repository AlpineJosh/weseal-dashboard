import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { DatatableProps } from "./datatable.component";
import { Datatable } from "./datatable.component";

const meta: Meta<DatatableProps<any, any>> = {
  title: "Display/Datatable",
  component: Datatable,
};

export default meta;

type Story = StoryObj<DatatableProps<any, any>>;

const data = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    age: 30,
  },
  {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    age: 25,
  },
  {
    name: "John Smith",
    email: "john.smith@example.com",
    age: 35,
  },
];

export const Default: Story = {
  render: (args) => (
    <Datatable {...args}>
      <Datatable.Header>
        <Datatable.Column allowsSorting isRowHeader>
          Name
        </Datatable.Column>
        <Datatable.Column>Email</Datatable.Column>
        <Datatable.Column>Age</Datatable.Column>
      </Datatable.Header>
      <Datatable.Body>
        {data.map((item) => (
          <Datatable.Row key={item.email}>
            <Datatable.Cell>{item.name}</Datatable.Cell>
            <Datatable.Cell>{item.email}</Datatable.Cell>
            <Datatable.Cell>{item.age}</Datatable.Cell>
          </Datatable.Row>
        ))}
      </Datatable.Body>
    </Datatable>
  ),
  args: {},
};
