import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta: Meta<typeof Card> = {
  component: Card,
  subcomponents: {
    CardHeader: CardHeader as React.ComponentType<unknown>,
    CardFooter: CardFooter as React.ComponentType<unknown>,
    CardTitle: CardTitle as React.ComponentType<unknown>,
    CardDescription: CardDescription as React.ComponentType<unknown>,
    CardContent: CardContent as React.ComponentType<unknown>,
  },
  title: "Components/Card",
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          This is the main content of the card. It can include text, images, or
          any other elements.
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithCustomClass: Story = {
  render: (args) => (
    <Card {...args} className="w-64">
      <CardHeader>
        <CardTitle>Custom Card Title</CardTitle>
        <CardDescription>Custom Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">
          This card has a custom width and includes additional styling.
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button>Custom Action</Button>
      </CardFooter>
    </Card>
  ),
};
