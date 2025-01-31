import * as batch from "./batch.schema";
import * as component from "./component.schema";
import * as despatching from "./despatching.schema";
import * as inventory from "./inventory.schema";
import * as location from "./location.schema";
import * as production from "./production.schema";
import * as profile from "./profile.schema";
import * as receiving from "./receiving.schema";
import * as task from "./task.schema";

export default {
  ...component,
  ...despatching,
  ...inventory,
  ...production,
  ...receiving,
  ...profile,
  ...task,
  ...batch,
  ...location,
};
