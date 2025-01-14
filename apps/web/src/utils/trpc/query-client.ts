import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import Decimal from "decimal.js";
import SuperJSON from "superjson";

SuperJSON.registerCustom<Decimal, string>(
  {
    isApplicable: (v): v is Decimal => v instanceof Decimal,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Decimal(v),
  },
  "decimal",
);

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
