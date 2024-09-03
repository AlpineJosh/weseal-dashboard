import fs from "fs";
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

let currentId = 0;

const ignoredStockCodes = new Set<string>(["S1", "S2", "S3", "M"]);

const main = async () => {
  const components = new Map<
    string,
    {
      transactions: STOCK_TRAN[];
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

  await processFile<STOCK>("data/StockComponent.json", (stock) => {
    if (stock.RECORD_DELETED === 0) {
      components.set(stock.STOCK_CODE, {
        stockCode: stock.STOCK_CODE,
        transactions: [],
        jobs: [],
        grns: [],
        gdns: [],
      });
    }
  });

  await processFile<STOCK_TRAN>("data/StockTransaction.json", (transaction) => {
    if (ignoredStockCodes.has(transaction.STOCK_CODE)) {
      return;
    }

    const component = getComponent(transaction.STOCK_CODE);
    if (transaction.RECORD_DELETED === 0) {
      component.transactions.push(transaction);
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

  // const largeComponent = components.get("CAP02930293251T")!;

  // let cumulativeQuantity = 0;
  // const trans = largeComponent.transactions.map((t) => {
  //   cumulativeQuantity += t.QUANTITY;
  //   if (t.REFERENCE === "BOM OUT (PSS)") {
  //     t.TYPE = "MO";
  //   }
  //   return {
  //     ...t,
  //     CUMULATIVE_QUANTITY: cumulativeQuantity,
  //   };
  // });

  // fs.writeFileSync("transactions.csv", parse(trans));
  // fs.writeFileSync("grns.json", parse(largeComponent.grns));
  // fs.writeFileSync("gdns.json", parse(largeComponent.gdns));
  // return;
  let shouldBreak = false;
  console.log(components.size);
  let componentsProcessed = 0;

  const productionsJobs: {
    stockCode: string;
    date: string;
    in: {
      stockCode: string;
      quantity: number;
      raw: STOCK_TRAN;
    }[];

    out: {
      stockCode: string;
      quantity: number;
      raw: STOCK_TRAN;
    }[];
  }[] = [];

  const remainingGrns: GRN_ITEM[] = [];

  for (const component of components.values()) {
    let runningTotal = 0;

    const transactions = component.transactions;
    for (const transaction of transactions) {
      if (
        transaction.TYPE === "MO" ||
        transaction.REFERENCE === "BOM OUT (PSS)"
      ) {
        if (transaction.STOCK_CODE === transaction.DETAILS) {
          continue;
        }

        const cleanedDetails = cleanStockCode(transaction.DETAILS);

        if (!components.has(cleanedDetails)) {
          console.log(cleanedDetails);
        }

        const job = productionsJobs.find(
          (j) => j.stockCode === cleanedDetails && j.date === transaction.DATE,
        );

        if (job === undefined) {
          productionsJobs.push({
            stockCode: cleanedDetails,
            date: transaction.DATE,
            in: [
              {
                stockCode: transaction.STOCK_CODE,
                quantity: transaction.QUANTITY,
                raw: transaction,
              },
            ],
            out: [],
          });
        } else {
          job.in.push({
            stockCode: transaction.STOCK_CODE,
            quantity: transaction.QUANTITY,
            raw: transaction,
          });
        }
      }
    }
    for (const transaction of transactions) {
      if (
        transaction.TYPE === "MI" ||
        transaction.REFERENCE === "BOM IN (PSS)"
      ) {
        const cleanedStockCode = cleanStockCode(transaction.STOCK_CODE);

        const job = productionsJobs.find(
          (j) =>
            (j.stockCode === cleanedStockCode ||
              j.stockCode ===
                cleanedStockCode.slice(0, cleanedStockCode.length - 2)) &&
            j.date === transaction.DATE,
        );

        if (job === undefined) {
          productionsJobs.push({
            stockCode: cleanedStockCode,
            date: transaction.DATE,
            in: [],
            out: [
              {
                stockCode: transaction.STOCK_CODE,
                quantity: transaction.QUANTITY,
                raw: transaction,
              },
            ],
          });
        } else {
          job.out.push({
            stockCode: transaction.STOCK_CODE,
            quantity: transaction.QUANTITY,
            raw: transaction,
          });
        }
      }
    }

    // while (component.grns.length > 0) {
    //   const grn = component.grns.shift()!;

    // if (grn.ACCOUNT_REF === "PROSPOOL" || grn.STOCK_CODE === "NSTOCK") {
    //   return;
    // }

    // if (
    //   [14929, 3475, 2027, 14932, 2893, 2299, 14925, 10353, 14931].includes(
    //     grn.GRN_NUMBER,
    //   )
    // ) {
    //   // Skip for now
    //   return;
    // }

    // if (
    //   [
    //     "00307676",
    //     "00352003",
    //     "SBS763",
    //     "00311378",
    //     "SBS775",
    //     "MISC",
    //     "CAP02930293251T",
    //     "CPZ09380584B",
    //   ].includes(grn.STOCK_CODE)
    // ) {
    //   // Skip for now
    //   return;
    // }

    // if (grn.STOCK_CODE.startsWith("SBS")) {
    //   // Skip for now
    //   return;
    // }

    // const transactionIndex = transactions.findIndex(
    //   (t) =>
    //     t.DATE === grn.DATE &&
    //     t.TYPE === "GI" &&
    //     t.QUANTITY === grn.QTY_RECEIVED,
    // );

    // if (transactionIndex === -1) {
    // console.log("No GI found for GRN");
    // console.log(grn);
    // shouldBreak = true;
    // const others = component.transactions.filter(
    //   (t) =>
    //     Math.abs(
    //       new Date(t.DATE).getTime() - new Date(grn.DATE).getTime(),
    //     ) <
    //     1000 * 60 * 60 * 24 * 7,
    // );
    // console.log(others);
    //     remainingGrns.push(grn);
    //   } else {
    //     transactions.splice(transactionIndex, 1);
    //   }
    // }

    // if (["01300237", "00100171", "16553"].includes(component.stockCode)) {
    //   continue;
    // }

    // for (const transaction of transactions) {
    //   if (transaction.TYPE === "GI") {
    //     console.log(transaction);
    //     console.log(remainingGrns);
    //     shouldBreak = true;
    //   }
    // }

    componentsProcessed++;
    // component.transactions.forEach((transaction, index) => {
    //   runningTotal += transaction.QUANTITY;
    //   if (transaction.TYPE === "GO") {
    //     const gdn = component.gdns.findIndex(
    //       (gd) =>
    //         gd.DATE === transaction.DATE &&
    //         gd.QTY_DESPATCHED === -transaction.QUANTITY,
    //     );

    //     if (gdn !== -1) {
    //       // Successfully found a GDN for this GO
    //       component.gdns.splice(gdn, 1);

    //       // Now create a delivery and attach this transaction
    //     } else if (index === 0) {
    //       // This is the initial transaction so we don't need to worry about GDNs
    //     } else {
    //       console.log("No GDN found for GO");
    //       console.log(transaction);
    //       shouldBreak = true;
    //     }
    //   } else if (transaction.TYPE === "GI") {
    //     const grn = component.grns.findIndex(
    //       (gd) =>
    //         gd.DATE === transaction.DATE &&
    //         gd.QTY_RECEIVED === transaction.QUANTITY,
    //     );

    //     if (grn !== -1) {
    //       // Successfully found a GDN for this GO
    //       component.grns.splice(grn, 1);

    //       // Now create a delivery and attach this transaction
    //       // } else if (index === 0) {
    //       //   // This is the initial transaction so we don't need to worry about GDNs
    //     } else {
    //       console.log("No GRN found for GI");
    //       console.log(transaction);
    //       shouldBreak = true;
    //     }
    //   } else if (transaction.TYPE === "AI" || transaction.TYPE === "AO") {
    //     corrections.push(transaction);
    //   } else {
    //     console.log(transaction);
    //     shouldBreak = true;
    //   }
    // });

    // const dailyCorrections: Map<Date, number> = new Map();

    // for (const correction of corrections) {
    //   const date = new Date(correction.DATE);
    //   if (!dailyCorrections.has(date)) {
    //     dailyCorrections.set(date, 0);
    //   }

    //   dailyCorrections.set(
    //     date,
    //     dailyCorrections.get(date)! + correction.QUANTITY,
    //   );
    // }

    if (shouldBreak || runningTotal < 0) {
      break;
    }
  }

  console.log(productionsJobs.length);

  const noInput = productionsJobs.filter((j) => j.in.length === 0);
  console.log(noInput.length);
  console.log(JSON.stringify(noInput.slice(0, 1), null, 2));
  // console.log(new Set(noInput.map((j) => j.stockCode)));

  const noOutput = productionsJobs.filter((j) => j.out.length === 0);
  console.log(noOutput.length);
  // console.log(JSON.stringify(noOutput.slice(0, 10), null, 2));
  // console.log(new Set(noOutput.map((j) => j.stockCode)));

  // console.log(
  //   JSON.stringify(
  //     productionsJobs.filter(
  //       (j) => j.date === "2016-07-01" && j.stockCode.startsWith("ML"),
  //     ),
  //     null,
  //     2,
  //   ),
  // );

  console.log(componentsProcessed);
};

main();
