import fs from "fs";
import path from "path";

const execDir = path.dirname(process.execPath);
const configPath = path.join(execDir, "config.json");
export const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as {
  connectors: {
    sage: {
      file: string;
      user: string;
      password: string;
    };
    bitSystems?: {
      file: string;
    };
  };
  target: {
    url: string;
  };
  syncSchedules: {
    components: string;
    despatching: string;
    receiving: string;
    misc: string;
  };
};
