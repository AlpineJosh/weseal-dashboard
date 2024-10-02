import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import type { StrongProps, TextLinkProps, TextProps } from "./text.component";
import { Strong, Text, TextLink } from "./text.component";

const meta: Meta<TextProps> = {
  title: "Typography/Text",
  component: Text,
};

export default meta;

type Story = StoryObj<TextProps>;

export const Default: Story = {
  render: (args) => {
    return (
      <Text {...args}>
        This is an example text. Lorem ipsum dolor sit amet. This is a{" "}
        <TextLink href="#">link</TextLink>. And <Strong>this</Strong> is a
        strong text.
      </Text>
    );
  },
};
