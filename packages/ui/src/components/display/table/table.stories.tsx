import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { TableProps } from "./table.component";
import { Badge } from "../../element";
import { Table } from "./table.component";

const meta: Meta<TableProps> = {
  title: "Display/Table",
  component: Table,
};

const data = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 5,
    name: "Charlie Davis",
    email: "charlie@example.com",
    role: "Moderator",
    status: "Active",
  },
];

export default meta;

type Story = StoryObj<TableProps>;

export const Default: Story = {
  render: () => (
    <Table>
      <Table.Head>
        <Table.Column isSortable id="id">
          ID
        </Table.Column>
        <Table.Column id="name">Name</Table.Column>
        <Table.Column id="email">Email</Table.Column>
        <Table.Column id="role">Role</Table.Column>
        <Table.Column id="status">Status</Table.Column>
      </Table.Head>
      <Table.Body data={data}>
        {({ data }) => (
          <Table.Row>
            <Table.Cell id="id">{data.id}</Table.Cell>
            <Table.Cell id="name">{data.name}</Table.Cell>
            <Table.Cell id="email">{data.email}</Table.Cell>
            <Table.Cell id="role">{data.role}</Table.Cell>
            <Table.Cell id="status">
              <Badge>{data.status}</Badge>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>

    // <Table
    //   selectionMode="multiple"
    //   columns={[
    //     {
    //       id: "id",
    //       label: "ID",
    //       cell: ({ value }) => <Table.Cell>{value.id}</Table.Cell>,
    //     },
    //     {
    //       id: "name",
    //       label: "Name",
    //       cell: ({ value }) => <Table.Cell>{value.name}</Table.Cell>,
    //       sort: {
    //         direction: "asc",
    //         onSort: () => void 0,
    //       },
    //     },
    //     {
    //       id: "email",
    //       label: "Email",
    //       cell: ({ value }) => <Table.Cell>{value.email}</Table.Cell>,
    //       sort: {
    //         direction: "desc",
    //         onSort: () => void 0,
    //       },
    //     },
    //     {
    //       id: "role",
    //       label: "Role",
    //       cell: ({ value }) => <Table.Cell>{value.role}</Table.Cell>,
    //       sort: {
    //         direction: undefined,
    //         onSort: () => void 0,
    //       },
    //     },
    //     {
    //       id: "status",
    //       label: "Status",
    //       cell: ({ value }) => (
    //         <Table.Cell>
    //           <Badge>{value.status}</Badge>
    //         </Table.Cell>
    //       ),
    //     },
    //   ]}
    //
    //   ]}
    // />
  ),
};
