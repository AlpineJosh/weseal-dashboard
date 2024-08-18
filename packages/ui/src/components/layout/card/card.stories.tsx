import type { Meta, StoryObj } from "@storybook/react";

import type { CardProps } from "./card.component";
import { Card } from "./card.component";

const meta: Meta<CardProps> = {
  title: "Layout/Card",
  component: Card,
};

export default meta;

type Story = StoryObj<CardProps>;

export const Default: Story = {
  args: {},
};