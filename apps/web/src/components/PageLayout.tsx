"use client";

import { NavigationMenu } from "@/components/NavigationMenu";
import { ModalOverlay } from "react-aria-components";
import { useImmer } from "use-immer";

import {
  faArrowRightArrowLeft,
  faBars,
  faFluxCapacitor,
  faPlus,
  faSlidersSimple,
  faTruckRampBox,
  faXmark,
} from "@repo/pro-light-svg-icons";
import { Modal, ToastProvider, useToast } from "@repo/ui/components/display";
import { Button, Icon, Menu } from "@repo/ui/components/element";
import { Sidebar } from "@repo/ui/components/navigation";
import { Dialog } from "@repo/ui/components/utility";

import { ProductionOutTaskForm } from "./flows/ProductionOutTask";
import { ProductionTaskForm } from "./flows/ProductionTaskFlow";
import { PurchaseReceiptTaskForm } from "./flows/PurchaseReceiptTask";
import { SalesDespatchTaskForm } from "./flows/SalesDespatchTask";
import { StockAdjustmentTaskForm } from "./flows/StockAdjustmentTask";
import { StockTransferTaskForm } from "./flows/StockTransferTask";

interface AppLayoutProps {
  children: React.ReactNode;
}

const Modals: Record<
  ModalType,
  React.ComponentType<{ onSave: () => void; onExit: () => void }>
> = {
  "production-in": ProductionTaskForm,
  "purchase-receipt": PurchaseReceiptTaskForm,
  "stock-transfer": StockTransferTaskForm,
  "stock-take": StockTransferTaskForm,
  "stock-adjust": StockAdjustmentTaskForm,
  "production-out": ProductionOutTaskForm,
  "sales-despatch": SalesDespatchTaskForm,
};

type ModalType =
  | "production-in"
  | "purchase-receipt"
  | "stock-transfer"
  | "stock-take"
  | "stock-adjust"
  | "production-out"
  | "sales-despatch";

const AddTaskMenuItems = () => {
  const [modal, setModal] = useImmer<ModalType | undefined>(undefined);

  return (
    <>
      <Modal.Trigger
        isOpen={!!modal}
        onOpenChange={(open) => {
          if (!open) {
            setModal(undefined);
          }
        }}
      >
        <Modal size="4xl" isDismissable>
          {({ close }) => {
            if (modal !== undefined) {
              const FormModal = Modals[modal];
              return <FormModal onSave={close} onExit={close} />;
            }
            return null;
          }}
        </Modal>
      </Modal.Trigger>

      <Menu.Items placement="end top" className="min-w-48">
        <Menu.Section>
          <Menu.SectionHeader>Create Task</Menu.SectionHeader>

          <Menu.Item
            onAction={() => {
              setModal("production-in");
            }}
          >
            <Icon icon={faFluxCapacitor} />
            Production Build
          </Menu.Item>

          <Menu.Item
            onAction={() => {
              setModal("sales-despatch");
            }}
          >
            <Icon icon={faTruckRampBox} />
            Prepare Despatch
          </Menu.Item>
          <Menu.Item
            onAction={() => {
              setModal("stock-transfer");
            }}
          >
            <Icon icon={faArrowRightArrowLeft} />
            Stock Move
          </Menu.Item>
        </Menu.Section>
        <Menu.Section>
          <Menu.SectionHeader>Stock Move</Menu.SectionHeader>
          <Menu.Item
            onAction={() => {
              setModal("purchase-receipt");
            }}
          >
            <Icon icon={faTruckRampBox} />
            Receive Goods
          </Menu.Item>
          <Menu.Item
            onAction={() => {
              setModal("production-out");
            }}
          >
            <Icon icon={faFluxCapacitor} />
            Production Out
          </Menu.Item>
          <Menu.Item
            onAction={() => {
              setModal("stock-adjust");
            }}
          >
            <Icon icon={faSlidersSimple} />
            Adjust Stock
          </Menu.Item>
          {/* <Menu.Item
            onAction={() => {
              setModal("stock-take");
            }}
          >
            <Icon icon={faShelves} />
            Stock Take
          </Menu.Item> */}
        </Menu.Section>
      </Menu.Items>
    </>
  );
};

export default function PageLayout({ children }: AppLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = useImmer(false);

  return (
    <ToastProvider>
      <div className="relative isolate z-0 flex h-full min-h-screen w-screen flex-row bg-background outline-none max-lg:flex-col lg:bg-background-muted">
        <div className="w-64 flex-none max-lg:hidden">
          <Sidebar>
            <Sidebar.Header>We Seal Dashboard</Sidebar.Header>
            <Sidebar.Body>
              <Sidebar.Section>
                <Menu>
                  <Button variant="solid" color="primary">
                    <Icon icon={faPlus} />
                    New Activity
                  </Button>
                  <AddTaskMenuItems />
                </Menu>
              </Sidebar.Section>
              <Sidebar.Section>
                <NavigationMenu />
              </Sidebar.Section>
            </Sidebar.Body>
          </Sidebar>
        </div>

        <header className="flex w-full items-center space-x-1 p-1 text-background lg:hidden">
          <Modal.Trigger
            isOpen={showMobileMenu}
            onOpenChange={(open) => {
              if (open !== showMobileMenu) {
                setShowMobileMenu(open);
              }
            }}
          >
            <Button
              variant="plain"
              color="default"
              onPress={() => {
                console.log("open");
                setShowMobileMenu(true);
              }}
            >
              <Icon icon={faBars} className="size-6" />
            </Button>
            <ModalOverlay className="absolute inset-0 bg-content/50">
              <Dialog.Content className="absolute bottom-2 left-2 top-2 flex w-64 flex-col justify-stretch rounded-lg bg-background">
                <div className="-mb-3 px-4 pb-6 pt-3">
                  <Button
                    variant="plain"
                    onPress={() => setShowMobileMenu(false)}
                  >
                    <Icon icon={faXmark} />
                  </Button>
                  <NavigationMenu />
                </div>
              </Dialog.Content>
            </ModalOverlay>
          </Modal.Trigger>
          <Button variant="input" className="grow">
            Search
          </Button>
          <Menu>
            <Button variant="plain">
              <Icon icon={faPlus} />
            </Button>
            <AddTaskMenuItems />
          </Menu>
          <div className="py-2.5">
            {/* <NavbarItem
            onClick={() => setShowSidebar(true)}
            aria-label="Open navigation"
          >
            <OpenMenuIcon />
          </NavbarItem> */}
          </div>
          {/* <div className="min-w-0 flex-1">{navbar}</div> */}
        </header>

        {/* Content */}
        <main className="m-2 grow p-6 lg:ml-0 lg:rounded-lg lg:bg-background lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-content/5">
          <div className="mx-auto flex min-h-0 max-w-screen-xl flex-1 flex-col items-stretch">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
