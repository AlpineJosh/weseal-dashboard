import * as path from "path";
import * as winston from "winston";
import * as fs from "fs";

// Determine log directory
const logDir = process.execPath ? path.join(path.dirname(process.execPath), "logs") : path.join(process.cwd(), "logs");

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create a custom format that's more readable
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    // Only include non-empty metadata that isn't timestamp/level/message
    const metaStr = Object.entries(meta)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    
    return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr ? ' | ' + metaStr : ''}`;
  })
);

export const logger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxFiles: 30,
      maxsize: 10485760,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxFiles: 30,
      maxsize: 10485760,
    }),
    // Always add console transport for debugging service issues
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  ],
  // Add exception handling
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, "exceptions.log"),
      maxFiles: 30,
      maxsize: 10485760,
    })
  ],
  // Add rejection handling
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, "rejections.log"),
      maxFiles: 30,
      maxsize: 10485760,
    })
  ],
  // Prevent process exit on handled exceptions
  exitOnError: false
});

// Add immediate test log
logger.info(`Logger initialized. Writing to directory: ${logDir}`);
