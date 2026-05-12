// app/utils/logger.ts

type LogLevel = "INFO" | "ERROR" | "WARN" | "DEBUG" | "SUCCESS";

const colors = {
  INFO: "\x1b[36m",      // Cyan
  ERROR: "\x1b[31m",     // Red
  WARN: "\x1b[33m",      // Yellow
  DEBUG: "\x1b[35m",     // Magenta
  SUCCESS: "\x1b[32m",   // Green
  RESET: "\x1b[0m"       // Reset
};

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

export class Logger {
  private static log(level: LogLevel, message: string, data?: any) {
    const timestamp = getTimestamp();
    const color = colors[level];
    const reset = colors.RESET;
    
    const logMessage = `${color}[${timestamp}] [${level}]${reset} ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  static info(message: string, data?: any) {
    this.log("INFO", message, data);
  }

  static error(message: string, error?: any) {
    this.log("ERROR", message, error instanceof Error ? error.message : error);
  }

  static warn(message: string, data?: any) {
    this.log("WARN", message, data);
  }

  static debug(message: string, data?: any) {
    this.log("DEBUG", message, data);
  }

  static success(message: string, data?: any) {
    this.log("SUCCESS", message, data);
  }
}

export default Logger;