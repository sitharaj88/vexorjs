/**
 * Structured Logging System
 *
 * High-performance, Pino-inspired structured logging with
 * automatic request context, child loggers, and minimal overhead.
 */

/**
 * Log levels
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';

const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: Infinity,
};

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  levelValue: number;
  time: number;
  msg: string;
  [key: string]: unknown;
}

/**
 * Logger options
 */
export interface LoggerOptions {
  /** Minimum log level */
  level?: LogLevel;
  /** Logger name (added to all entries) */
  name?: string;
  /** Base context to include in all entries */
  base?: Record<string, unknown>;
  /** Output transport */
  transport?: LogTransport;
  /** Timestamp function */
  timestamp?: () => number;
  /** Pretty print (for development) */
  prettyPrint?: boolean;
  /** Redact sensitive fields */
  redact?: string[];
  /** Custom serializers */
  serializers?: Record<string, (value: unknown) => unknown>;
}

/**
 * Log transport interface
 */
export interface LogTransport {
  write(entry: LogEntry): void;
}

/**
 * Console transport (JSON output)
 */
export class ConsoleTransport implements LogTransport {
  private prettyPrint: boolean;

  constructor(options: { prettyPrint?: boolean } = {}) {
    this.prettyPrint = options.prettyPrint ?? false;
  }

  write(entry: LogEntry): void {
    const output = this.prettyPrint
      ? this.formatPretty(entry)
      : JSON.stringify(entry);

    if (entry.level === 'error' || entry.level === 'fatal') {
      console.error(output);
    } else if (entry.level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  private formatPretty(entry: LogEntry): string {
    const { level, time, msg, ...rest } = entry;
    const timestamp = new Date(time).toISOString();
    const levelColor = this.getLevelColor(level);
    const contextStr = Object.keys(rest).length > 0
      ? ` ${JSON.stringify(rest)}`
      : '';

    return `${timestamp} ${levelColor}[${level.toUpperCase()}]${RESET} ${msg}${contextStr}`;
  }

  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case 'trace': return GRAY;
      case 'debug': return BLUE;
      case 'info': return GREEN;
      case 'warn': return YELLOW;
      case 'error': return RED;
      case 'fatal': return MAGENTA;
      default: return '';
    }
  }
}

// ANSI color codes
const RESET = '\x1b[0m';
const GRAY = '\x1b[90m';
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';

/**
 * Stream transport (for file output)
 */
export class StreamTransport implements LogTransport {
  private stream: { write: (data: string) => void };

  constructor(stream: { write: (data: string) => void }) {
    this.stream = stream;
  }

  write(entry: LogEntry): void {
    this.stream.write(JSON.stringify(entry) + '\n');
  }
}

/**
 * Multi transport (send to multiple destinations)
 */
export class MultiTransport implements LogTransport {
  private transports: LogTransport[];

  constructor(transports: LogTransport[]) {
    this.transports = transports;
  }

  write(entry: LogEntry): void {
    for (const transport of this.transports) {
      transport.write(entry);
    }
  }
}

/**
 * Logger class
 */
export class Logger {
  private options: Required<Omit<LoggerOptions, 'name' | 'redact' | 'serializers'>> & {
    name?: string;
    redact?: string[];
    serializers?: Record<string, (value: unknown) => unknown>;
  };
  private levelValue: number;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      level: options.level ?? 'info',
      name: options.name,
      base: options.base ?? {},
      transport: options.transport ?? new ConsoleTransport({ prettyPrint: options.prettyPrint }),
      timestamp: options.timestamp ?? (() => Date.now()),
      prettyPrint: options.prettyPrint ?? false,
      redact: options.redact,
      serializers: options.serializers,
    };
    this.levelValue = LOG_LEVEL_VALUES[this.options.level];
  }

  /**
   * Create a child logger with additional context
   */
  child(bindings: Record<string, unknown>): Logger {
    return new Logger({
      ...this.options,
      base: { ...this.options.base, ...bindings },
    });
  }

  /**
   * Log at trace level
   */
  trace(msg: string, context?: Record<string, unknown>): void;
  trace(context: Record<string, unknown>, msg: string): void;
  trace(msgOrContext: string | Record<string, unknown>, contextOrMsg?: string | Record<string, unknown>): void {
    this.log('trace', msgOrContext, contextOrMsg);
  }

  /**
   * Log at debug level
   */
  debug(msg: string, context?: Record<string, unknown>): void;
  debug(context: Record<string, unknown>, msg: string): void;
  debug(msgOrContext: string | Record<string, unknown>, contextOrMsg?: string | Record<string, unknown>): void {
    this.log('debug', msgOrContext, contextOrMsg);
  }

  /**
   * Log at info level
   */
  info(msg: string, context?: Record<string, unknown>): void;
  info(context: Record<string, unknown>, msg: string): void;
  info(msgOrContext: string | Record<string, unknown>, contextOrMsg?: string | Record<string, unknown>): void {
    this.log('info', msgOrContext, contextOrMsg);
  }

  /**
   * Log at warn level
   */
  warn(msg: string, context?: Record<string, unknown>): void;
  warn(context: Record<string, unknown>, msg: string): void;
  warn(msgOrContext: string | Record<string, unknown>, contextOrMsg?: string | Record<string, unknown>): void {
    this.log('warn', msgOrContext, contextOrMsg);
  }

  /**
   * Log at error level
   */
  error(msg: string, context?: Record<string, unknown>): void;
  error(context: Record<string, unknown>, msg: string): void;
  error(err: Error, msg?: string): void;
  error(
    msgOrContextOrErr: string | Record<string, unknown> | Error,
    contextOrMsg?: string | Record<string, unknown>
  ): void {
    if (msgOrContextOrErr instanceof Error) {
      this.log('error', contextOrMsg as string ?? msgOrContextOrErr.message, {
        err: this.serializeError(msgOrContextOrErr),
      });
    } else {
      this.log('error', msgOrContextOrErr, contextOrMsg);
    }
  }

  /**
   * Log at fatal level
   */
  fatal(msg: string, context?: Record<string, unknown>): void;
  fatal(context: Record<string, unknown>, msg: string): void;
  fatal(err: Error, msg?: string): void;
  fatal(
    msgOrContextOrErr: string | Record<string, unknown> | Error,
    contextOrMsg?: string | Record<string, unknown>
  ): void {
    if (msgOrContextOrErr instanceof Error) {
      this.log('fatal', contextOrMsg as string ?? msgOrContextOrErr.message, {
        err: this.serializeError(msgOrContextOrErr),
      });
    } else {
      this.log('fatal', msgOrContextOrErr, contextOrMsg);
    }
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.options.level = level;
    this.levelValue = LOG_LEVEL_VALUES[level];
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.options.level;
  }

  /**
   * Check if level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    return LOG_LEVEL_VALUES[level] >= this.levelValue;
  }

  /**
   * Flush any buffered logs
   */
  flush(): void {
    // For transports that support buffering
    const transport = this.options.transport as { flush?: () => void };
    if (transport.flush) {
      transport.flush();
    }
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    msgOrContext: string | Record<string, unknown>,
    contextOrMsg?: string | Record<string, unknown>
  ): void {
    // Check log level
    if (LOG_LEVEL_VALUES[level] < this.levelValue) {
      return;
    }

    // Parse arguments (support both Pino styles)
    let msg: string;
    let context: Record<string, unknown> = {};

    if (typeof msgOrContext === 'string') {
      msg = msgOrContext;
      if (typeof contextOrMsg === 'object' && contextOrMsg !== null) {
        context = contextOrMsg;
      }
    } else {
      context = msgOrContext;
      msg = typeof contextOrMsg === 'string' ? contextOrMsg : '';
    }

    // Build log entry
    const entry: LogEntry = {
      level,
      levelValue: LOG_LEVEL_VALUES[level],
      time: this.options.timestamp(),
      msg,
      ...this.options.base,
      ...this.applySerializers(context),
    };

    // Add logger name if set
    if (this.options.name) {
      entry.name = this.options.name;
    }

    // Redact sensitive fields
    if (this.options.redact) {
      this.redactFields(entry, this.options.redact);
    }

    // Write to transport
    this.options.transport.write(entry);
  }

  /**
   * Serialize error objects
   */
  private serializeError(err: Error): Record<string, unknown> {
    const { message, stack, ...rest } = err as Error & Record<string, unknown>;
    return {
      type: err.constructor.name,
      message,
      stack,
      ...rest,
    };
  }

  /**
   * Apply custom serializers
   */
  private applySerializers(context: Record<string, unknown>): Record<string, unknown> {
    if (!this.options.serializers) {
      return context;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context)) {
      const serializer = this.options.serializers[key];
      result[key] = serializer ? serializer(value) : value;
    }
    return result;
  }

  /**
   * Redact sensitive fields
   */
  private redactFields(entry: LogEntry, fields: string[]): void {
    for (const field of fields) {
      const parts = field.split('.');
      this.redactPath(entry, parts);
    }
  }

  private redactPath(obj: Record<string, unknown>, path: string[]): void {
    if (path.length === 0) return;

    const [current, ...rest] = path;
    if (!(current in obj)) return;

    if (rest.length === 0) {
      obj[current] = '[REDACTED]';
    } else if (typeof obj[current] === 'object' && obj[current] !== null) {
      this.redactPath(obj[current] as Record<string, unknown>, rest);
    }
  }
}

/**
 * Request logger middleware context
 */
export interface RequestLogContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Create a request-scoped logger
 */
export function createRequestLogger(
  baseLogger: Logger,
  context: RequestLogContext
): Logger {
  return baseLogger.child({
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    userAgent: context.userAgent,
    ip: context.ip,
  });
}

/**
 * Generate request ID
 */
export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a logger instance
 */
export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Standard serializers
 */
export const serializers = {
  /**
   * Serialize HTTP request
   */
  req: (req: { method?: string; url?: string; headers?: Record<string, string> }) => ({
    method: req.method,
    url: req.url,
    headers: req.headers,
  }),

  /**
   * Serialize HTTP response
   */
  res: (res: { statusCode?: number; headers?: Record<string, string> }) => ({
    statusCode: res.statusCode,
    headers: res.headers,
  }),

  /**
   * Serialize error
   */
  err: (err: Error) => ({
    type: err.constructor.name,
    message: err.message,
    stack: err.stack,
  }),
};
