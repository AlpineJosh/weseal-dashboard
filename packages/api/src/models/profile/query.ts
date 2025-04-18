import { db } from "#db";
import { datatable } from "#lib/datatables";

import { publicSchema } from "@repo/db";

const { profile } = publicSchema;

const overview = db
  .select({
    id: profile.id,
    name: profile.name,
    email: profile.email,
  })
  .from(profile)
  .as("overview");

export const profileQuery = datatable(
  {
    id: "uuid",
    name: "string",
    email: "string",
  },
  overview,
);
