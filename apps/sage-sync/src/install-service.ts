import * as path from "path";
import { Service } from "node-windows";

import { BitHandler } from "./bit-systems/BitHandler";
import { logger } from "./lib/logger";
import { SageHandler } from "./sage/SageHandler";

const svc = new Service({
  name: "Sage Sync Service",
  description: "Syncs data between Sage Line 50 and other systems",
  script: path.join(__dirname, "sync.js"),
  wait: 2,
  grow: 0.25,
});

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--install")) {
    svc.on("install", () => {
      svc.start();
      logger.info("Service installed successfully");
    });

    svc.on("error", (err) => {
      logger.error("Service installation failed:", err);
    });

    svc.install();
    return;
  }

  if (args.includes("--uninstall")) {
    svc.on("uninstall", () => {
      logger.info("Service uninstalled successfully");
    });

    svc.on("error", (err) => {
      logger.error("Service uninstallation failed:", err);
    });

    svc.uninstall();
    return;
  }
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
