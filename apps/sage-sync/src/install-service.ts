import path from "path";
import fs from 'fs';

import { Service, ServiceConfig } from "node-windows";

import { logger } from "./lib/logger";
import { sync } from "./sync";

const exeDir = path.dirname(process.execPath);

const svc = new Service({
  name: "Sage Sync Service",
  description: "Syncs data between Sage Line 50 and other systems",
  script: path.join(exeDir, 'sync.js'), 
  wait: 2,
  grow: 0.25,
  env: [
    {
      name: "NODE_ENV",
      value: "production"
    }
  ]
});

svc.workingdirectory = exeDir;

svc.on("start", () => {
  logger.info("Service start event received");
});

svc.on("stop", () => {
  logger.info("Service stop event received");
});

svc.on("exit", (code) => {
  logger.info(`Service process exited with code: ${code}`);
});

svc.on("error", (err) => {
  logger.error("Service error:", err);
});

const ensureDirectories = () => {
  const dirs = [
    path.join(exeDir, 'daemon'),
    path.join(exeDir, 'logs'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};


async function main() {
  logger.info("Service script starting...");
  logger.info(`Process executable path: ${process.execPath}`);
  logger.info(`Working directory: ${process.cwd()}`);

  ensureDirectories();
  logger.info("Directories ensured");

  if (process.argv.includes("--install")) {
    logger.info("Installing service...");
    svc.install();
  } else if (process.argv.includes("--uninstall")) {
    logger.info("Uninstalling service...");
    svc.uninstall();
  } else if (process.argv.includes("--run")) {
    logger.info("Running sync process...");
    await sync();
  } else {
    logger.info("No valid command line argument provided");
  }
}

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
