import { exit } from "process";

import { initSage } from "./lib/sage/sage";
import { syncComponents } from "./models/component";
import {
  syncSalesLedger,
  syncSalesOrderItems,
  syncSalesOrders,
} from "./models/despatching";
import { syncDepartments, syncStockCategories } from "./models/misc";
import {
  syncPurchaseLedger,
  syncPurchaseOrderItems,
  syncPurchaseOrders,
} from "./models/receiving";

export async function fullSync() {
  await initSage();

  await syncDepartments();
  await syncStockCategories();
  await syncComponents();
  await syncPurchaseLedger();
  console.log("Purchase ledger synced");
  await syncPurchaseOrders();
  console.log("Purchase orders synced");
  await syncPurchaseOrderItems();
  console.log("Purchase order items synced");
  await syncSalesLedger();
  console.log("Sales ledger synced");
  await syncSalesOrders();
  console.log("Sales orders synced");
  await syncSalesOrderItems();
  console.log("Sales order items synced");

  exit(0);
}

fullSync();
