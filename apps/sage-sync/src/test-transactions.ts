import fs from "fs";
import Fuse from "fuse.js";
import { parse } from "json2csv";
import { chain } from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/StreamArray";
import { compareTwoStrings } from "string-similarity";

import { GDN_ITEM, GRN_ITEM, STOCK, STOCK_TRAN } from "./lib/sage/types";

const processFile = async <T extends object>(
  filePath: string,
  processItem: (item: T) => void,
) => {
  return new Promise<void>((resolve, reject) => {
    const pipeline = chain([
      fs.createReadStream(filePath),
      parser(),
      streamArray(),
    ]);

    pipeline.on("data", ({ value }) => {
      processItem(value);
    });

    pipeline.on("end", resolve);
    pipeline.on("error", reject);
  });
};

const extractAndRemove = <T>(
  array: T[],
  criteria: (item: T) => boolean,
): T[] => {
  const extracted = array.filter(criteria);
  array = array.filter((item) => !criteria(item));
  return extracted;
};

const ignoredStockCodes = new Set<string>(["S1", "S2", "S3", "M"]);

const main = async () => {
  const components = new Map<
    string,
    {
      jobs: {
        quantity: number;
        inputs: {
          stockCode: string;
          quantity: number;
        }[];
      }[];
      stockCode: string;
      grns: GRN_ITEM[];
      gdns: GDN_ITEM[];
      corrections: STOCK_TRAN[];
    }
  >();

  const getComponent = (stockCode: string) => {
    if (!components.has(stockCode)) {
      console.log(stockCode);
      const keys = Array.from(components.keys()).filter(
        (k) => compareTwoStrings(k, stockCode) > 0.8,
      );
      console.log(keys);
      process.exit(1);
    }

    return components.get(stockCode)!;
  };

  const cleanStockCode = (initial: string) => {
    let stockCode = initial.replace(/WIP$/, "");
    if (!components.has(stockCode)) {
      console.log(stockCode);
      stockCode = stockCode.slice(0, -1);
      if (stockCode.length < 5) {
        if (initial.startsWith("ML")) {
          stockCode = cleanStockCode(initial.replace(/^ML/, "SA"));
        } else {
          console.log(stockCode);
          const keys = Array.from(components.keys()).filter(
            (k) => compareTwoStrings(k, stockCode) > 0.8,
          );
          console.log(keys);
          process.exit(1);
        }
      }
      stockCode = cleanStockCode(stockCode);
    }

    return stockCode;
  };

  const transactions: STOCK_TRAN[] = [];

  await processFile<STOCK>("data/StockComponent.json", (stock) => {
    if (stock.RECORD_DELETED === 0) {
      components.set(stock.STOCK_CODE, {
        stockCode: stock.STOCK_CODE,
        jobs: [],
        grns: [],
        gdns: [],
        corrections: [],
      });
    }
  });

  await processFile<STOCK_TRAN>("data/StockTransaction.json", (transaction) => {
    if (ignoredStockCodes.has(transaction.STOCK_CODE)) {
      return;
    }

    if (transaction.RECORD_DELETED === 0) {
      transactions.push(transaction);
    }
  });

  await processFile<GRN_ITEM>("data/GRNItem.json", (grn) => {
    if (ignoredStockCodes.has(grn.STOCK_CODE)) {
      return;
    }

    const component = getComponent(grn.STOCK_CODE);
    if (grn.RECORD_DELETED === 0) {
      component.grns.push(grn);
    }
  });

  await processFile<GDN_ITEM>("data/GDNItem.json", (gdn) => {
    if (ignoredStockCodes.has(gdn.STOCK_CODE)) {
      return;
    }

    const component = getComponent(gdn.STOCK_CODE);
    if (gdn.RECORD_DELETED === 0) {
      component.gdns.push(gdn);
    }
  });

  const totalTransactions = transactions.length;
  console.log(`Total Transactions: ${totalTransactions}`);

  let manufacturingInputs: STOCK_TRAN[] = [];
  let manufacturingOutputs: STOCK_TRAN[] = [];
  const remainingTransactions: STOCK_TRAN[] = [];

  for (const transaction of transactions) {
    const component = getComponent(transaction.STOCK_CODE);
    if (
      transaction.TYPE === "MO" ||
      transaction.REFERENCE === "BOM OUT (PSS)"
    ) {
      manufacturingInputs.push(transaction);
      continue;
    } else if (
      transaction.TYPE === "MI" ||
      transaction.REFERENCE === "BOM IN (PSS)"
    ) {
      manufacturingOutputs.push(transaction);
      continue;
    } else if (transaction.TYPE === "GI") {
      const grnIndex = component.grns.findIndex(
        (grn) =>
          grn.STOCK_CODE === transaction.STOCK_CODE &&
          grn.DATE === transaction.DATE &&
          grn.QTY_RECEIVED === transaction.QUANTITY,
      );
      if (grnIndex !== -1) {
        component.grns.splice(grnIndex, 1);
        // TODO track matched grn
        continue;
      }
    } else if (transaction.TYPE === "GO") {
      const gdnIndex = component.gdns.findIndex(
        (gdn) =>
          gdn.STOCK_CODE === transaction.STOCK_CODE &&
          gdn.DATE === transaction.DATE &&
          gdn.QTY_DESPATCHED === -transaction.QUANTITY,
      );
      if (gdnIndex !== -1) {
        component.gdns.splice(gdnIndex, 1);
        // TODO track matched gdn
        continue;
      }
    }

    component.corrections.push(transaction);
  }

  // const fuse = new Fuse(Array.from(components.keys()), {
  //   includeScore: true,
  //   threshold: 0.6,
  // });

  const remainingManufacturingInputs: STOCK_TRAN[] = [];
  console.log(`Manufacturing Inputs: ${manufacturingInputs.length}`);

  for (const manufacturingInput of manufacturingInputs) {
    // const details = manufacturingInput.DETAILS;
    // if (!components.has(details)) {
    //   console.log(details);
    //   const results = fuse.search(details);
    //   console.log(results);
    //   process.exit(1);
    // }

    const outputs = manufacturingOutputs.filter(
      (output) => output.DATE === manufacturingInput.DATE,
    );

    let manufacturingOutput = outputs.find(
      (output) => output.STOCK_CODE === manufacturingInput.DETAILS,
    );

    if (manufacturingOutput) {
      continue;
    }

    const fuse = new Fuse(outputs, {
      includeScore: true,
      threshold: 0.6,
      keys: ["STOCK_CODE"],
    });

    const potentials = fuse.search(manufacturingInput.DETAILS);

    if (potentials[0] && potentials[0].score && potentials[0].score < 0.3) {
      continue;
    }

    components
      .get(manufacturingInput.STOCK_CODE)!
      .corrections.push(manufacturingInput);
  }

  console.log(
    Array.from(components.values()).flatMap(
      (component) => component.corrections,
    ).length,
  );

  components.forEach((component) => {
    const remaining: STOCK_TRAN[] = [];
    let currentDay = "";
    let runningTotal = 0;
    for (let ii = 0; ii < component.corrections.length; ii++) {
      const transaction = component.corrections[ii]!;
      if (currentDay !== transaction.DATE) {
        remaining.push({
          TRAN_NUMBER: transaction.TRAN_NUMBER,
          TYPE: runningTotal > 0 ? "AI" : "AO",
          DATE: currentDay,
          QUANTITY: runningTotal,
          STOCK_CODE: component.stockCode,
          DETAILS: "",
          REFERENCE: "",
          REFERENCE_NUMERIC: 0,
          COST_PRICE: 0,
          SALES_PRICE: 0,
          QTY_USED: 0,
          GRN_NUMBER: 0,
          ISP_REFERENCE: 0,
          ARTEFACT_TYPE: 0,
          GDN_NUMBER: 0,
          RECORD_DELETED: 0,
          RECORD_MODIFY_DATE: "",
          RECORD_CREATE_DATE: "",
        });
        currentDay = transaction.DATE;
        runningTotal = 0;
      }
      runningTotal += transaction.QUANTITY;
    }

    component.corrections = remaining;
  });
  console.log(
    Array.from(components.values()).flatMap(
      (component) => component.corrections,
    ).length,
  );
};

main();
