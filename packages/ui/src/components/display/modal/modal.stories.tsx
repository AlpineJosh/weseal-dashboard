import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";
import React from "react";

import { Button } from "@repo/ui/components/element";
import { Dialog } from "@repo/ui/components/utility";

import type { ModalProps } from "./modal.component";
import { Modal } from "./modal.component";

const meta: Meta<ModalProps> = {
  title: "Overlay/Modal",
  component: Modal,
};

export default meta;

type Story = StoryObj<ModalProps>;

export const Default: Story = {
  render: () => (
    <Modal.Trigger>
      <Button>Open Modal</Button>
      <Modal>Modal Content</Modal>
    </Modal.Trigger>
  ),
};
