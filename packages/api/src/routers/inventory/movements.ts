import { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { and, count, eq, getTableColumns, or } from "@repo/db";
import { db } from "@repo/db/client";
import schema from "@repo/db/schema";

import {
  dateFilterSchema,
  handleDateFilter,
  handleMultiSelectFilter,
  handleNumberFilter,
  handleSearchFilter,
  handleSort,
  handleStringFilter,
  multiSelectFilterSchema,
  numberFilterSchema,
  paginationSchema,
  searchFilterSchema,
  sortSchema,
  stringFilterSchema,
} from "../../lib/schemas";
import { publicProcedure } from "../../trpc";

const listMovementsInput = z.object({
  pagination: paginationSchema(),
  search: searchFilterSchema(),
  sort: sortSchema([
    "id",
    "date",
    "batchReference",
    "batchEntryDate",
    "componentId",
    "componentDescription",
    "locationName",
    "locationGroupName",
    "salesOrderId",
    "supplierName",
    "purchaseOrderId",
    "customerName",
    "productionJobBatchReference",
    "type",
    "quantity",
  ]).optional(),
  filter: z
    .object({
      date: dateFilterSchema().optional(),
      batchId: stringFilterSchema().optional(),
      batchReference: stringFilterSchema().optional(),
      batchEntryDate: dateFilterSchema().optional(),
      componentId: stringFilterSchema().optional(),
      componentDescription: stringFilterSchema().optional(),
      locationId: stringFilterSchema().optional(),
      locationName: stringFilterSchema().optional(),
      locationGroupName: stringFilterSchema().optional(),
      salesOrderId: stringFilterSchema().optional(),
      supplierName: stringFilterSchema().optional(),
      purchaseOrderId: stringFilterSchema().optional(),
      customerName: stringFilterSchema().optional(),
      productionJobBatchReference: stringFilterSchema().optional(),
      type: multiSelectFilterSchema(
        z.string(z.enum(schema.batchMovementType.enumValues)),
      ).optional(),
      quantity: numberFilterSchema().optional(),
    })
    .optional(),
});

export const movementsRouter = {
  list: publicProcedure.input(listMovementsInput).query(async ({ input }) => {
    const { pagination, sort, filter, search } = input;

    let where = [];
    if (filter) {
      if (filter.date)
        where.push(
          handleDateFilter(schema.batchMovementOverview.date, filter.date),
        );
      if (filter.batchId)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.batchId,
            filter.batchId,
          ),
        );
      if (filter.batchReference)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.batchReference,
            filter.batchReference,
          ),
        );
      if (filter.batchEntryDate)
        where.push(
          handleDateFilter(
            schema.batchMovementOverview.batchEntryDate,
            filter.batchEntryDate,
          ),
        );
      if (filter.componentId)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.componentId,
            filter.componentId,
          ),
        );
      if (filter.componentDescription)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.componentDescription,
            filter.componentDescription,
          ),
        );
      if (filter.locationId)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.locationId,
            filter.locationId,
          ),
        );
      if (filter.locationName)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.locationName,
            filter.locationName,
          ),
        );
      if (filter.locationGroupName)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.locationGroupName,
            filter.locationGroupName,
          ),
        );
      if (filter.salesOrderId)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.salesOrderId,
            filter.salesOrderId,
          ),
        );
      if (filter.supplierName)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.supplierName,
            filter.supplierName,
          ),
        );
      if (filter.purchaseOrderId)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.purchaseOrderId,
            filter.purchaseOrderId,
          ),
        );
      if (filter.customerName)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.customerName,
            filter.customerName,
          ),
        );
      if (filter.productionJobBatchReference)
        where.push(
          handleStringFilter(
            schema.batchMovementOverview.productionJobBatchReference,
            filter.productionJobBatchReference,
          ),
        );
      if (filter.type)
        where.push(
          handleMultiSelectFilter(
            schema.batchMovementOverview.type,
            filter.type,
          ),
        );
      if (filter.quantity)
        where.push(
          handleNumberFilter(
            schema.batchMovementOverview.quantity,
            filter.quantity,
          ),
        );
    }

    if (search) {
      where.push(
        handleSearchFilter(
          [
            schema.batchMovementOverview.batchReference,
            schema.batchMovementOverview.batchEntryDate,
            schema.batchMovementOverview.componentDescription,
            schema.batchMovementOverview.locationName,
            schema.batchMovementOverview.locationGroupName,
            schema.batchMovementOverview.salesOrderId,
            schema.batchMovementOverview.supplierName,
            schema.batchMovementOverview.purchaseOrderId,
            schema.batchMovementOverview.customerName,
            schema.batchMovementOverview.productionJobBatchReference,
          ],
          search,
        ),
      );
    }

    const total = await db
      .select({ count: count() })
      .from(schema.batchMovementOverview)
      .where(and(...where));

    const results = await db
      .select()
      .from(schema.batchMovementOverview)
      .where(and(...where))
      .limit(pagination.size)
      .offset((pagination.page - 1) * pagination.size)
      .orderBy(...handleSort(schema.batchMovementOverview, sort ?? []));

    return {
      pagination: {
        ...pagination,
        total: total[0]?.count ?? 0,
      },
      rows: results,
      sort,
      filter,
    };
  }),
} satisfies TRPCRouterRecord;
