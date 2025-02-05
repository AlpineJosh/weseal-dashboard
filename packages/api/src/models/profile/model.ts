import { publicSchema } from "@repo/db";

import { db } from "../../db";
import { datatable } from "../../lib/datatables";

const { profile } = publicSchema;

const overview = db
  .select({
    id: profile.id,
    name: profile.name,
    email: profile.email,
  })
  .from(profile)
  .as("overview");

export default datatable(overview);
