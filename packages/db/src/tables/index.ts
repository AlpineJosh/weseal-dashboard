import * as component from "./component.schema";
import * as despatching from "./despatching.schema";
import * as inventory from "./inventory.schema";
import * as production from "./production.schema";
import * as profile from "./profile.schema";
import * as receiving from "./receiving.schema";

export default {
  ...component,
  ...despatching,
  ...inventory,
  ...production,
  ...receiving,
  ...profile,
};
