import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Button } from "@repo/ui/components/element";

import type { ModalProps } from "./modal.component";
import { Trigger } from "../trigger";
import { Modal, ModalPane } from "./modal.component";

const meta: Meta<ModalProps> = {
  title: "Overlay/Modals",
  component: Modal,
};

export default meta;

type Story = StoryObj<ModalProps>;

export const Default: Story = {
  render: () => (
    <Modal>
      <Trigger>
        <Button>Open Modal</Button>
      </Trigger>
      <ModalPane>Modal Content</ModalPane>
    </Modal>
  ),
};
