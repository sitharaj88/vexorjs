/**
 * Logger Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Logger,
  ConsoleTransport,
  StreamTransport,
  MultiTransport,
  generateRequestId,
} from '../logging/logger.js';
import type { LogTransport, LogEntry } from '../logging/logger.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A transport that captures entries for assertions */
class TestTransport implements LogTransport {
  entries: LogEntry[] = [];
  write(entry: LogEntry): void {
    this.entries.push(entry);
  }
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------
describe('Logger', () => {
  let transport: TestTransport;
  let logger: Logger;

  beforeEach(() => {
    transport = new TestTransport();
    logger = new Logger({ level: 'trace', transport });
  });

  describe('level filtering', () => {
    it('should log messages at or above the configured level', () => {
      const warnLogger = new Logger({ level: 'warn', transport });
      warnLogger.trace('t');
      warnLogger.debug('d');
      warnLogger.info('i');
      warnLogger.warn('w');
      warnLogger.error('e');
      warnLogger.fatal('f');

      expect(transport.entries).toHaveLength(3);
      expect(transport.entries.map((e) => e.level)).toEqual(['warn', 'error', 'fatal']);
    });

    it('should not log anything when level is silent', () => {
      const silentLogger = new Logger({ level: 'silent', transport });
      silentLogger.trace('t');
      silentLogger.info('i');
      silentLogger.error('e');
      silentLogger.fatal('f');

      expect(transport.entries).toHaveLength(0);
    });
  });

  describe('setLevel', () => {
    it('should dynamically change the log level', () => {
      const lg = new Logger({ level: 'error', transport });
      lg.info('skipped');
      expect(transport.entries).toHaveLength(0);

      lg.setLevel('info');
      lg.info('included');
      expect(transport.entries).toHaveLength(1);
    });
  });

  describe('isLevelEnabled', () => {
    it('should return true for enabled levels', () => {
      const lg = new Logger({ level: 'warn', transport });
      expect(lg.isLevelEnabled('error')).toBe(true);
      expect(lg.isLevelEnabled('warn')).toBe(true);
      expect(lg.isLevelEnabled('info')).toBe(false);
      expect(lg.isLevelEnabled('debug')).toBe(false);
    });
  });

  describe('structured output', () => {
    it('should include level, msg, and time in entries', () => {
      logger.info('hello world');
      const entry = transport.entries[0];

      expect(entry.level).toBe('info');
      expect(entry.msg).toBe('hello world');
      expect(entry.time).toBeDefined();
      expect(typeof entry.time).toBe('number');
    });

    it('should include context when provided as second arg', () => {
      logger.info('msg', { requestId: '123' });
      const entry = transport.entries[0];
      expect(entry.requestId).toBe('123');
    });

    it('should support Pino-style context-first calling convention', () => {
      logger.info({ method: 'GET' }, 'request received');
      const entry = transport.entries[0];
      expect(entry.msg).toBe('request received');
      expect(entry.method).toBe('GET');
    });

    it('should include name when configured', () => {
      const named = new Logger({ level: 'info', transport, name: 'myapp' });
      named.info('test');
      expect(transport.entries[0].name).toBe('myapp');
    });
  });

  describe('error serialization', () => {
    it('should serialize Error objects passed to error()', () => {
      const err = new TypeError('bad input');
      logger.error(err);

      const entry = transport.entries[0];
      expect(entry.msg).toBe('bad input');
      expect(entry.err).toBeDefined();
      const serialized = entry.err as Record<string, unknown>;
      expect(serialized.type).toBe('TypeError');
      expect(serialized.message).toBe('bad input');
      expect(serialized.stack).toBeDefined();
    });

    it('should serialize Error with custom message', () => {
      const err = new Error('original');
      logger.error(err, 'custom message');

      const entry = transport.entries[0];
      expect(entry.msg).toBe('custom message');
    });
  });

  describe('child logger', () => {
    it('should merge bindings into all entries', () => {
      const child = logger.child({ service: 'api', version: '1.0' });
      child.info('request');

      const entry = transport.entries[0];
      expect(entry.service).toBe('api');
      expect(entry.version).toBe('1.0');
      expect(entry.msg).toBe('request');
    });

    it('should inherit parent level and transport', () => {
      const parentLogger = new Logger({ level: 'warn', transport });
      const child = parentLogger.child({ module: 'db' });
      child.info('skip me');
      child.warn('show me');

      expect(transport.entries).toHaveLength(1);
      expect(transport.entries[0].module).toBe('db');
    });
  });

  describe('redact', () => {
    it('should replace sensitive fields with [REDACTED]', () => {
      const lg = new Logger({
        level: 'info',
        transport,
        redact: ['password', 'secret'],
      });

      lg.info('login', { password: '12345', secret: 'abc', user: 'bob' });

      const entry = transport.entries[0];
      expect(entry.password).toBe('[REDACTED]');
      expect(entry.secret).toBe('[REDACTED]');
      expect(entry.user).toBe('bob');
    });

    it('should redact nested paths', () => {
      const lg = new Logger({
        level: 'info',
        transport,
        redact: ['auth.token'],
      });

      lg.info('request', { auth: { token: 'secret', type: 'bearer' } });

      const entry = transport.entries[0];
      const auth = entry.auth as Record<string, unknown>;
      expect(auth.token).toBe('[REDACTED]');
      expect(auth.type).toBe('bearer');
    });
  });
});

// ---------------------------------------------------------------------------
// ConsoleTransport
// ---------------------------------------------------------------------------
describe('ConsoleTransport', () => {
  it('should write JSON to console.log for info level', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const ct = new ConsoleTransport();
    const entry: LogEntry = {
      level: 'info',
      levelValue: 30,
      time: Date.now(),
      msg: 'hello',
    };
    ct.write(entry);

    expect(spy).toHaveBeenCalledWith(JSON.stringify(entry));
    spy.mockRestore();
  });

  it('should write to console.error for error level', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ct = new ConsoleTransport();
    const entry: LogEntry = {
      level: 'error',
      levelValue: 50,
      time: Date.now(),
      msg: 'bad',
    };
    ct.write(entry);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should write to console.warn for warn level', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ct = new ConsoleTransport();
    const entry: LogEntry = {
      level: 'warn',
      levelValue: 40,
      time: Date.now(),
      msg: 'careful',
    };
    ct.write(entry);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// StreamTransport
// ---------------------------------------------------------------------------
describe('StreamTransport', () => {
  it('should write JSON + newline to stream', () => {
    const mockStream = { write: vi.fn() };
    const st = new StreamTransport(mockStream);
    const entry: LogEntry = {
      level: 'info',
      levelValue: 30,
      time: 1000,
      msg: 'test',
    };
    st.write(entry);

    expect(mockStream.write).toHaveBeenCalledWith(JSON.stringify(entry) + '\n');
  });
});

// ---------------------------------------------------------------------------
// MultiTransport
// ---------------------------------------------------------------------------
describe('MultiTransport', () => {
  it('should write to all transports', () => {
    const t1 = new TestTransport();
    const t2 = new TestTransport();
    const mt = new MultiTransport([t1, t2]);

    const entry: LogEntry = {
      level: 'info',
      levelValue: 30,
      time: Date.now(),
      msg: 'multi',
    };
    mt.write(entry);

    expect(t1.entries).toHaveLength(1);
    expect(t2.entries).toHaveLength(1);
    expect(t1.entries[0].msg).toBe('multi');
  });
});

// ---------------------------------------------------------------------------
// generateRequestId
// ---------------------------------------------------------------------------
describe('generateRequestId', () => {
  it('should return a non-empty string', () => {
    const id = generateRequestId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()));
    expect(ids.size).toBe(100);
  });

  it('should contain a hyphen separator', () => {
    const id = generateRequestId();
    expect(id).toContain('-');
  });
});
