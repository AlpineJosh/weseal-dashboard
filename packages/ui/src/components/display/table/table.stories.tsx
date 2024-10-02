import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { TableProps } from "./table.component";
import { Table } from "./table.component";

const meta: Meta<TableProps> = {
  title: "Display/Table",
  component: Table,
};

export default meta;

type Story = StoryObj<TableProps>;

export const Default: Story = {
  render: () => (
    <Table>
      <Table.Header>
        <Table.Column>ID</Table.Column>
        <Table.Column isRowHeader>Name</Table.Column>
        <Table.Column>Email</Table.Column>
        <Table.Column>Role</Table.Column>
        <Table.Column>Status</Table.Column>
      </Table.Header>
      <Table.Body>
        {[
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
        ].map((user) => (
          <Table.Row key={user.id}>
            <Table.Cell>{user.id}</Table.Cell>
            <Table.Cell>{user.name}</Table.Cell>
            <Table.Cell>{user.email}</Table.Cell>
            <Table.Cell>{user.role}</Table.Cell>
            <Table.Cell>{user.status}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      {/* <Table.Footer>
        <Table.Row>
          <Table.Cell colSpan={5}>Total Users: 5</Table.Cell>
        </Table.Row>
      </Table.Footer> */}
    </Table>
  ),
};
