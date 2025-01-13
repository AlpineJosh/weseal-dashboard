"use client";

import {
  faBox,
  faBoxes,
  faBuilding,
  faClipboardList,
  faFileInvoice,
  faHome,
  faIndustry,
  faLayerGroup,
  faLocationDot,
  faTasks,
  faTools,
  faTruck,
  faTruckLoading,
  faUsers,
} from "@repo/pro-light-svg-icons";
import { Icon } from "@repo/ui/components/element";
import { SidebarMenu } from "@repo/ui/components/navigation";

export const NavigationMenu = () => {
  return (
    <SidebarMenu>
      <SidebarMenu.Item href="/">
        <Icon icon={faHome} />
        <SidebarMenu.Label>Dashboard</SidebarMenu.Label>
      </SidebarMenu.Item>

      <SidebarMenu.ItemGroup>
        <SidebarMenu.Item href="/inventory">
          <Icon icon={faBoxes} />
          <SidebarMenu.Label>Inventory</SidebarMenu.Label>
        </SidebarMenu.Item>
        <SidebarMenu.SubItems>
          <SidebarMenu.Item href="/inventory/tasks">
            <Icon icon={faTasks} />
            <SidebarMenu.Label>Tasks</SidebarMenu.Label>
          </SidebarMenu.Item>
          <SidebarMenu.Item href="/inventory/batches">
            <Icon icon={faLayerGroup} />
            <SidebarMenu.Label>Batches</SidebarMenu.Label>
          </SidebarMenu.Item>
          <SidebarMenu.Item href="/inventory/locations">
            <Icon icon={faLocationDot} />
            <SidebarMenu.Label>Locations</SidebarMenu.Label>
          </SidebarMenu.Item>
        </SidebarMenu.SubItems>
      </SidebarMenu.ItemGroup>

      <SidebarMenu.Item href="/components">
        <Icon icon={faTools} />
        <SidebarMenu.Label>Components</SidebarMenu.Label>
      </SidebarMenu.Item>

      <SidebarMenu.ItemGroup>
        <SidebarMenu.Item href="/receiving">
          <Icon icon={faTruck} />
          <SidebarMenu.Label>Receiving</SidebarMenu.Label>
        </SidebarMenu.Item>
        <SidebarMenu.SubItems>
          <SidebarMenu.Item href="/receiving/orders">
            <Icon icon={faFileInvoice} />
            <SidebarMenu.Label>Purchase Orders</SidebarMenu.Label>
          </SidebarMenu.Item>
          <SidebarMenu.Item href="/receiving/receipts">
            <Icon icon={faBox} />
            <SidebarMenu.Label>Receipts</SidebarMenu.Label>
          </SidebarMenu.Item>
          <SidebarMenu.Item href="/receiving/suppliers">
            <Icon icon={faBuilding} />
            <SidebarMenu.Label>Suppliers</SidebarMenu.Label>
          </SidebarMenu.Item>
        </SidebarMenu.SubItems>
      </SidebarMenu.ItemGroup>

      <SidebarMenu.ItemGroup>
        <SidebarMenu.Item href="/despatching">
          <Icon icon={faTruckLoading} />
          <SidebarMenu.Label>Despatching</SidebarMenu.Label>
        </SidebarMenu.Item>
        <SidebarMenu.SubItems>
          <SidebarMenu.Item href="/despatching/orders">
            <Icon icon={faFileInvoice} />
            <SidebarMenu.Label>Sales Orders</SidebarMenu.Label>
          </SidebarMenu.Item>
          <SidebarMenu.Item href="/despatching/despatches">
            <Icon icon={faBox} />
            <SidebarMenu.Label>Despatches</SidebarMenu.Label>
          </SidebarMenu.Item>
          <SidebarMenu.Item href="/despatching/customers">
            <Icon icon={faUsers} />
            <SidebarMenu.Label>Customers</SidebarMenu.Label>
          </SidebarMenu.Item>
        </SidebarMenu.SubItems>
      </SidebarMenu.ItemGroup>

      <SidebarMenu.ItemGroup>
        <SidebarMenu.Item href="/production">
          <Icon icon={faIndustry} />
          <SidebarMenu.Label>Production</SidebarMenu.Label>
        </SidebarMenu.Item>
        <SidebarMenu.SubItems>
          <SidebarMenu.Item href="/production/jobs">
            <Icon icon={faClipboardList} />
            <SidebarMenu.Label>Jobs</SidebarMenu.Label>
          </SidebarMenu.Item>
        </SidebarMenu.SubItems>
      </SidebarMenu.ItemGroup>
    </SidebarMenu>
  );
};
