import fs from "fs";

export const config = JSON.parse(fs.readFileSync("./config.json", "utf8")) as {
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
