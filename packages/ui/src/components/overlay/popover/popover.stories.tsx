import type { Meta, StoryObj } from "@storybook/react";

import { faQuestionCircle } from "@repo/pro-solid-svg-icons";
import { Button } from "@repo/ui/components/element";

import type { PopoverProps } from "./popover.component";
import { Icon } from "../../element/icon";
import { Sheet } from "../sheet/sheet.component";
import { Trigger } from "../trigger";
import { Popover } from "./popover.component";

const meta: Meta<PopoverProps> = {
  title: "Overlay/Popover",
  component: Popover,
};

export default meta;

type Story = StoryObj<PopoverProps>;

export const Default: Story = {
  render: (args) => (
    <Popover placement="top" strategy="fixed">
      <Trigger>
        <Button variant="outline" aria-label="Help">
          <Icon icon={faQuestionCircle} />
        </Button>
      </Trigger>
      <Sheet {...args} className="min-w-[250px]">
        <p className="text-sm">
          For help accessing your account, please contact support.
        </p>
      </Sheet>
    </Popover>
  ),

  args: {},
};
