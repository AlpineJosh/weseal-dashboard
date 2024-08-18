import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import {
  faBox,
  faBoxes,
  faForklift,
  faHome,
  faTasks,
} from "@fortawesome/pro-light-svg-icons";

import type { VerticalNavigationProps } from "./vertical-navigation.component";
import { VerticalNavigation } from "./vertical-navigation.component";

const meta: Meta<VerticalNavigationProps> = {
  title: "Navigation/Vertical Navigation",
  component: VerticalNavigation.Nav,
  subcomponents: {
    ItemGroup: VerticalNavigation.ItemGroup as ComponentType<unknown>,
    Item: VerticalNavigation.Item as ComponentType<unknown>,
  },
};

export default meta;

type Story = StoryObj<VerticalNavigationProps>;

export const Default: Story = {
  render: (args) => (
    <VerticalNavigation.Nav {...args}>
      <VerticalNavigation.Item href="#" title="Home" icon={faHome} />
      <VerticalNavigation.ItemGroup title="Stock" icon={faBoxes}>
        <VerticalNavigation.Item
          href="#"
          title="Production"
          icon={faForklift}
        />
        <VerticalNavigation.Item href="#" title="Inventory" icon={faBox} />
        <VerticalNavigation.Item href="#" title="Transfers" icon={faTasks} />
      </VerticalNavigation.ItemGroup>
    </VerticalNavigation.Nav>
  ),
  args: {},
};
