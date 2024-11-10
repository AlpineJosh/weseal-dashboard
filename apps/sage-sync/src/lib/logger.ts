import * as path from "path";
import * as winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxFiles: 30,
      maxsize: 10485760,
    }),
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      maxFiles: 30,
      maxsize: 10485760,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
