import { createServerClient } from "@repo/db";
import { config } from "./config";

export const target = createServerClient(config.target.url)