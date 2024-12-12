import Decimal from "decimal.js";

import { sql } from "@repo/db";
import { bitSystemsDb } from "@repo/db/bit-systems";
import { db } from "@repo/db/client";
import { sageDb } from "@repo/db/sage";
import schema from "@repo/db/schema";

import type { ResetData } from "./ResetComponent";
import { ResetComponent } from "./ResetComponent";

// const STOCK_CODES = [
// "BOPZ056WH0280SQM", // component, no batch number
// "WS051OR2800SQMEB090", // printed material, must have batch number, is BOMd into other products.
// "WS051OR012003000EB090", // finished product, must have batch number, is not BOMd again.
// "OL175GR006000050B", // Finished product, no batch number
// "CARRIAGECHARGE", // Non-physical item, no batch number
// "BOP020CL4950SQM", // Biggest discrepancy
// ];

export class ResetHandler implements ResetData {
  salesDespatchIds = new Map<number, Map<Date, Promise<number>>>();
  purchaseReceiptIds = new Map<number, Map<Date, Promise<number>>>();
  productionJobIds = new Map<string, Map<Date, Promise<number | undefined>>>();

  salesOrders = new Set<number>();
  purchaseOrders = new Set<number>();

  components = new Map<string, ResetComponent>();
  movements: (typeof schema.batchMovement.$inferInsert)[] = [];

  private resetComponents: ResetComponent[] = [];

  async process() {
    console.log("Deleting all records from relevant tables...");
    await this.deleteAll();
    console.log("Fetching data from databases...");
    await this.fetchData();
    console.log("Processing each component...");
    await this.processComponents();
    console.log("Inserting batch movements...");
    await this.insertMovements();
    console.log("Inventory reset process completed successfully.");
  }

  private async deleteAll() {
    await db.execute(sql`
      TRUNCATE TABLE 
        public.batch_movement_correction,
        public.production_batch_input,
        public.production_batch_output,
        public.batch_movement,
        public.production_job,
        public.sales_despatch_item,
        public.sales_despatch,
        public.purchase_receipt_item,
        public.purchase_receipt,
        public.task_item,
        public.task,
        public.batch 
      RESTART IDENTITY;
    `);
    console.log("All relevant tables have been truncated.");
  }

  private async fetchData() {
    this.salesOrders = await db.query.salesOrder
      .findMany({ columns: { id: true } })
      .then((orders) => new Set(orders.map((o) => o.id)));
    this.purchaseOrders = await db.query.purchaseOrder
      .findMany({ columns: { id: true } })
      .then((orders) => new Set(orders.map((o) => o.id)));

    await this.fetchStockTransactions();
    await this.fetchGrnItems();
    await this.fetchGdnItems();
    await this.fetchBitSystemsData();
    console.log("Data fetching completed.");
  }

  public async getPurchaseReceiptId(
    orderId: number,
    receiptDate: Date,
  ): Promise<number> {
    if (this.purchaseReceiptIds.has(orderId)) {
      const receipt = this.purchaseReceiptIds.get(orderId)?.get(receiptDate);
      if (receipt) {
        return receipt;
      }
    }

    const receipt = db
      .insert(schema.purchaseReceipt)
      .values({
        orderId,
        receiptDate,
      })
      .returning({ id: schema.purchaseReceipt.id })
      .then((ids) => ids[0]?.id)
      .then((id) => {
        if (!id) {
          throw new Error("Failed to get purchase receipt ID");
        }

        return id;
      });

    if (!this.purchaseReceiptIds.has(orderId)) {
      this.purchaseReceiptIds.set(orderId, new Map());
    }
    this.purchaseReceiptIds.get(orderId)?.set(receiptDate, receipt);

    return receipt;
  }

  public async getSalesDespatchId(
    orderId: number,
    despatchDate: Date,
  ): Promise<number> {
    if (this.salesDespatchIds.has(orderId)) {
      const despatch = this.salesDespatchIds.get(orderId)?.get(despatchDate);
      if (despatch) {
        return despatch;
      }
    }

    const despatch = db
      .insert(schema.salesDespatch)
      .values({
        orderId,
        despatchDate,
      })
      .returning({ id: schema.salesDespatch.id })
      .then((ids) => ids[0]?.id)
      .then((id) => {
        if (!id) {
          throw new Error("Failed to get sales despatch ID");
        }

        return id;
      });

    if (!this.salesDespatchIds.has(orderId)) {
      this.salesDespatchIds.set(orderId, new Map());
    }
    this.salesDespatchIds.get(orderId)?.set(despatchDate, despatch);

    return despatch;
  }

  public async getProductionJobId(
    componentId: string,
    date: Date,
    reference?: string,
  ): Promise<number | undefined> {
    if (!this.components.has(componentId)) {
      // console.error(`Component ${componentId} not found for Production Job`);
      return Promise.resolve(undefined);
    }

    if (this.productionJobIds.has(componentId)) {
      if (this.productionJobIds.get(componentId)?.has(date)) {
        return this.productionJobIds.get(componentId)?.get(date);
      }
    }

    const job = db
      .insert(schema.productionJob)
      .values({
        outputComponentId: componentId,
        outputLocationId: 1,
        batchNumber: reference,
        isActive: false,
      })
      .returning({ id: schema.productionJob.id })
      .then((ids) => ids[0]?.id)
      .then((id) => {
        if (!id) {
          throw new Error("Failed to get production job ID");
        }

        return id;
      });

    if (!this.productionJobIds.has(componentId)) {
      this.productionJobIds.set(componentId, new Map());
    }
    this.productionJobIds.get(componentId)?.set(date, job);

    return job;
  }

  private getComponent(stockCode: string): ResetComponent {
    let component;

    if (this.components.has(stockCode)) {
      component = this.components.get(stockCode);
    }

    if (!component) {
      component = new ResetComponent(stockCode, this);
      this.components.set(stockCode, component);
    }

    return component;
  }

  private async fetchStockTransactions() {
    const transactions = await sageDb.query.STOCK_TRAN.findMany();
    transactions.forEach((t) => {
      if (
        !t.STOCK_CODE ||
        !t.TYPE ||
        !t.DATE ||
        !t.QUANTITY ||
        t.TYPE === "DI"
      ) {
        return;
      }

      const component = this.getComponent(t.STOCK_CODE);

      let type: "correction" | "production" | "receipt" | "despatch" =
        "correction";
      if (t.TYPE.startsWith("M") || t.REFERENCE?.startsWith("BOM")) {
        type = "production";
      } else if (t.TYPE === "GI") {
        type = "receipt";
      } else if (t.TYPE === "GO") {
        type = "despatch";
      }

      component.addTransaction({
        id: t.TRAN_NUMBER,
        component_id: t.STOCK_CODE,
        quantity: new Decimal(t.QUANTITY).toDP(6),
        date: t.DATE,
        reference: t.REFERENCE,
        reference_numeric: t.REFERENCE_NUMERIC,
        details: t.DETAILS,
        type,
        created_at: t.RECORD_CREATE_DATE ?? t.DATE,
        last_modified: t.RECORD_MODIFY_DATE ?? t.RECORD_CREATE_DATE ?? t.DATE,
      });
    });
    console.log("Stock transactions fetched and components populated.");
  }

  private async fetchGrnItems() {
    const grnItems = await sageDb.query.GRN_ITEM.findMany();
    grnItems.forEach((item) => {
      if (
        !item.STOCK_CODE ||
        !item.ORDER_NUMBER ||
        !item.DATE ||
        !item.QTY_RECEIVED ||
        !this.purchaseOrders.has(item.ORDER_NUMBER)
      )
        return;

      const component = this.getComponent(item.STOCK_CODE);

      component.addGrn({
        orderId: item.ORDER_NUMBER,
        quantity: new Decimal(item.QTY_RECEIVED).toDP(6),
        date: item.DATE,
      });
    });
    console.log("GRN items fetched and associated.");
  }

  private async fetchGdnItems() {
    const gdnItems = await sageDb.query.GDN_ITEM.findMany();
    gdnItems.forEach((item) => {
      if (
        !item.STOCK_CODE ||
        !item.ORDER_NUMBER ||
        !item.DATE ||
        !item.QTY_DESPATCHED ||
        !this.salesOrders.has(item.ORDER_NUMBER)
      )
        return;

      const component = this.getComponent(item.STOCK_CODE);

      component.addGdn({
        orderId: item.ORDER_NUMBER,
        quantity: new Decimal(item.QTY_DESPATCHED).toDP(6),
        date: item.DATE,
      });
    });
    console.log("GDN items fetched and associated.");
  }

  private async fetchBitSystemsData() {
    const componentMap = new Map<number, string>();
    const batchMap = new Map<number, string>();

    const stockItems = await bitSystemsDb.query.stockItem.findMany();
    stockItems.forEach((item) => {
      if (!item.Code) return;

      componentMap.set(item.pk_StockItem_ID, item.Code);
    });

    const binIds = await bitSystemsDb.query.bin
      .findMany()
      .then((locations) =>
        locations
          .filter((l) => l.fk_Warehouse_ID !== 1)
          .map((l) => l.pk_Bin_ID),
      );

    const batches = await bitSystemsDb.query.traceableItem.findMany();
    batches.forEach((batch) => {
      if (
        !batch.fk_StockItem_ID ||
        !batch.IdentificationNo ||
        !batch.DateTimeCreated
      )
        return;

      const componentId = componentMap.get(batch.fk_StockItem_ID);
      if (!componentId) return;

      const component = this.getComponent(componentId);
      component.addBitSystemsBatch({
        id: batch.pk_TraceableItem_ID,
        reference: batch.IdentificationNo,
        date: batch.DateTimeCreated,
      });

      batchMap.set(batch.pk_TraceableItem_ID, componentId);
    });

    const locations = await bitSystemsDb.query.binItem.findMany();
    locations.forEach((location) => {
      if (
        !location.fk_StockItem_ID ||
        !location.fk_Bin_ID ||
        !location.QuantityInStock ||
        !binIds.includes(location.fk_Bin_ID)
      )
        return;

      const componentId = componentMap.get(location.fk_StockItem_ID);
      if (!componentId) return;

      const component = this.getComponent(componentId);
      component.addBitSystemsItem({
        id: location.pk_BinItem_ID,
        locationId: location.fk_Bin_ID,
        quantity: new Decimal(location.QuantityInStock).toDP(6),
      });
    });

    const traceableLocations =
      await bitSystemsDb.query.traceableBinItem.findMany();
    traceableLocations.forEach((location) => {
      if (
        !location.fk_BinItem_ID ||
        !location.QuantityInStock ||
        !location.fk_TraceableItem_ID
      )
        return;

      const componentId = batchMap.get(location.fk_TraceableItem_ID);
      if (!componentId) return;

      const component = this.getComponent(componentId);
      component.addBitSystemsTraceableItem({
        id: location.pk_TraceableBinItem_ID,
        itemId: location.fk_BinItem_ID,
        batchId: location.fk_TraceableItem_ID,
        quantity: new Decimal(location.QuantityInStock).toDP(6),
      });
    });
  }

  private async processComponents() {
    const promises = [];

    for (const component of this.components.values()) {
      // if (!STOCK_CODES.includes(component.id)) {
      //   continue;
      // }

      promises.push(component.process());
    }

    await Promise.all(promises).catch((e) => {
      console.error(e);
    });

    console.log(`Completed Processing ${this.components.size} components.`);
  }

  private async insertMovements() {
    const movements = Array.from(this.components.values())
      .flatMap((c) => c.movements)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log(`${movements.length} movements to insert.`);

    // Batch insert movements in chunks to handle large data
    const chunkSize = 5000;
    for (let i = 0; i < movements.length; i += chunkSize) {
      console.log(`Inserted ${i} movements.`);
      const chunk = movements.slice(i, i + chunkSize);
      await db
        .insert(schema.batchMovement)
        .values(chunk)
        .catch((e) => {
          console.error(e);
        });
    }
    console.log(`${movements.length} batch movements inserted.`);
  }
}

export const resetInventory = async () => {
  console.log("Initiating inventory reset...");
  const handler = new ResetHandler();
  await handler.process();
};
