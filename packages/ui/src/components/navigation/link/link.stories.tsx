import type { Meta, StoryObj } from "@storybook/react";

import type { LinkProps } from "./link.component";
import { Link } from "./link.component";

const meta: Meta<LinkProps> = {
  title: "Primitives/Link",
  component: Link,
};

export default meta;

type Story = StoryObj<LinkProps>;

export const Default: Story = {
  args: {
    href: "https://www.imdb.com/title/tt6348138/",
    target: "_blank",
    children: "The Missing Link",
  },
};
