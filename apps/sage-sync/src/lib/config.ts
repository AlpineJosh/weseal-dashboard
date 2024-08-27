import fs from "fs";

export const config = JSON.parse(fs.readFileSync("./config.json", "utf8")) as {
  connectors: {
    sage: {
      file: string;
      user: string;
      password: string;
    };
    bitSystems: {
      file: string;
    };
  };
  database: {
    url: string;
  };
  syncSchedules: {
    components: string;
    despatching: string;
    receiving: string;
    production: string;
    inventory: string;
    misc: string;
  };
};
