export const expectSingleRow = <T extends Record<string, unknown>>(
  results: T[],
  operation: string,
): T => {
  const result = results[0];
  if (!result || results.length > 1) {
    throw new Error(`${operation} failed - no rows affected`);
  }
  return result;
};
