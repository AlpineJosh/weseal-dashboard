import { cache } from "react";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

import type { AppRouter } from "@repo/api";
import { createCaller, createTRPCContext } from "@repo/api";

import { createSupabaseServerClient } from "../supabase/server";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
export const createContext = cache(async () => {
  // const heads = await headers();
  // heads.set("x-trpc-source", "rsc");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  return createTRPCContext({ id: user.id });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
