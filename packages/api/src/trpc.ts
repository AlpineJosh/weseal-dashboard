import { initTRPC } from "@trpc/server";
import Decimal from "decimal.js";
import SuperJSON from "superjson";
import { ZodError } from "zod";

import { db } from "./db";

SuperJSON.registerCustom<Decimal, string>(
  {
    isApplicable: (v): v is Decimal => v instanceof Decimal,
    serialize: (v) => v.toString(),
    deserialize: (v) => new Decimal(v),
  },
  "decimal",
);

export interface TRPCContext {
  db: typeof db;
  user: { id: string };
}

export const createTRPCContext = (user: { id: string }): TRPCContext => {
  return {
    db,
    user,
  };
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: SuperJSON,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
