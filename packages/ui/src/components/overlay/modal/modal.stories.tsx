import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import { Button } from "@repo/ui/components/element";
import { Dialog } from "@repo/ui/components/utility";

import type { ModalProps } from "./modal.component";
import { Modal } from "./modal.component";

const meta: Meta<ModalProps> = {
  title: "Overlay/Modal",
  component: Modal.Content,
  subcomponents: {
    Trigger: Modal.Trigger as ComponentType<unknown>,
  },
};

export default meta;

type Story = StoryObj<ModalProps>;

export const Default: Story = {
  render: () => (
    <Modal.Trigger>
      <Button>Open Modal</Button>
      <Modal.Content>
        <Dialog.Content>
          <div>Modal Content</div>
        </Dialog.Content>
      </Modal.Content>
    </Modal.Trigger>
  ),
};
