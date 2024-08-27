import { SyncParameters } from "~/models/types";

export function asyncBatch<T>(
  items: T[],
  fn: (batch: T[]) => Promise<void>,
  batchSize = 100,
) {
  return Promise.all(
    Array.from({ length: Math.ceil(items.length / batchSize) }).map((_, i) =>
      fn(items.slice(i * batchSize, (i + 1) * batchSize)),
    ),
  );
}

export const formatDate = (date: Date): string => {
  const isoString = date.toISOString();
  return isoString.replace("T", " ").replace("Z", "");
};

export function buildQuery(query: string, parameters?: SyncParameters) {
  if (parameters) {
    query += `
      WHERE RECORD_MODIFY_DATE BETWEEN '${formatDate(parameters.startDate)}' AND '${formatDate(parameters.endDate)}'
    `;
  }

  return query;
}
