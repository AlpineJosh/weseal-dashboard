import * as fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

// URL of the Zynk documentation page
const url =
  "https://docs.zynk.com/workflow/developers/sage-50-uk-schema/index.html";

// Fetch the page content
async function fetchPageContent(url: string) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching the page:", error);
    throw error;
  }
}

// Parse the HTML content and extract the table data
function extractTables(htmlContent: string) {
  const $ = cheerio.load(htmlContent);
  const data: { table: string; url: string }[] = [];

  // Assuming tables are structured as HTML table elements
  $("article table").each((i, table) => {
    $(table)
      .find("tbody tr")
      .each((j, row) => {
        const link = $(row).find("a").first();
        data.push({
          table: link.text().trim(),
          url: `https://docs.zynk.com/workflow/developers/sage-50-uk-schema/${link.attr("href")}`,
        });
      });
  });

  return data;
}

const columnTypes = new Map([
  ["VARCHAR", "varchar"],
  ["INTEGER", "integer"],
  ["TINYINT", "smallint"],
  ["SMALLINT", "smallint"],
  ["BOOLEAN", "boolean"],
  ["REAL", "real"],
  ["SERIAL", "serial"],
  ["TIMESTAMP", "timestamp"],
  ["LONG VARCHAR", "text"],
  ["DOUBLE", "doublePrecision"],
  ["DATE", "timestamp"],
]);

function extractTableDefs(htmlContent: string) {
  const $ = cheerio.load(htmlContent);
  const data: { name: string; type: string }[] = [];

  // Assuming tables are structured as HTML table elements
  const table = $("article table").first();
  $(table)
    .find("tbody tr")
    .each((j, row) => {
      const columns = $(row).find("td").toArray();
      const columnName = $(columns[0]).text().trim();
      let columnType = $(columns[1]).text().trim();

      if (["RECORD_CREATE_DATE", "RECORD_MODIFY_DATE"].includes(columnName)) {
        columnType = "TIMESTAMP";
      } else if (columnName.endsWith("DATE")) {
        columnType = "DATE";
      } else if (columnName.endsWith("TIME")) {
        columnType = "TIMESTAMP";
      }

      if (!columnTypes.has(columnType)) {
        columnType = "TEXT";
      }

      data.push({
        name: columnName,
        type: columnTypes.get(columnType)!,
      });
    });
  return data;
}

// Save extracted data to a CSV file
function writeSchema(name: string, columns: { name: string; type: string }[]) {
  return `
    
    export const ${name} = pgTable("${name}", {
      ${columns
        .map((column) => `${column.name}: ${column.type}("${column.name}"),`)
        .join("\n      ")}
    });

     export const INSERT_${name}_SCHEMA = createInsertSchema(${name});
  `;
}

// Main function to fetch, extract, and save data
async function scrapeAndSaveData() {
  try {
    const htmlContent = await fetchPageContent(url);
    const tableData = extractTables(htmlContent);
    let schema = `
    import { relations } from "drizzle-orm";
    import {
      boolean,
      integer,
      pgTable,
      real,
      serial,
      smallint,
      timestamp,
      varchar,
      doublePrecision,
      date
    } from "drizzle-orm/pg-core";
    import { createInsertSchema } from 'drizzle-zod';`;
    for (const table of tableData) {
      const tableContent = await fetchPageContent(table.url);
      const tableDefs = extractTableDefs(tableContent);
      const content = writeSchema(table.table, tableDefs);
      schema += content;
    }

    fs.writeFileSync("schema/sage.ts", schema);
  } catch (error) {
    console.error("Error in scraping process:", error);
  }
}

// Execute the scraping
scrapeAndSaveData();
