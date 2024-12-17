import { BitHandler } from "./bit-systems/BitHandler.js";
import { logger } from "./lib/logger.js";
import { SageHandler } from "./sage/SageHandler.js";

export async function sync() {
  const sageSync = new SageHandler();
  const bitSync = new BitHandler();

  await Promise.all([sageSync.start(), bitSync.start()]);

  process.on("SIGTERM", () => {
    sageSync.stop();
    bitSync.stop();
    process.exit(0);
  });
}
