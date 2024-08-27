import { initSage } from "./lib/sage/sage";
import { syncComponents } from "./models/component";

async function main() {
  await initSage();

  await syncComponents();
}

main();
