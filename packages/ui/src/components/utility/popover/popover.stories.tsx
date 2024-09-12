import type { Meta, StoryObj } from "@storybook/react";

import { faQuestionCircle } from "@repo/pro-solid-svg-icons";
import { Button } from "@repo/ui/components/element";

import type { PopoverProps } from "./popover.component";
import { Icon } from "../../element/icon";
import { Dialog } from "../dialog";
import { Popover } from "./popover.component";

const meta: Meta<PopoverProps> = {
  title: "Utility/Popover",
  component: Popover,
};

export default meta;

type Story = StoryObj<PopoverProps>;

export const Default: Story = {
  render: (args) => (
    <Dialog.Trigger>
      <Button variant="outline" size="icon" aria-label="Help">
        <Icon icon={faQuestionCircle} />
      </Button>
      <Popover {...args} className="max-w-[250px]">
        <Dialog.Content>
          <p className="text-sm">
            For help accessing your account, please contact support.
          </p>
        </Dialog.Content>
      </Popover>
    </Dialog.Trigger>
  ),
  args: {},
};
