import type { Meta, StoryObj } from "@storybook/react";

import type { HeadingProps } from "./heading.component";
import { Heading, Subheading } from "./heading.component";

const meta: Meta<HeadingProps> = {
  title: "Typography/Heading",
  component: Heading,
};

export default meta;

type Story = StoryObj<HeadingProps>;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="flex flex-col gap-4">
        <Heading {...args}>Heading</Heading>
        <Subheading {...args}>Subheading</Subheading>
      </div>
    );
  },
};
