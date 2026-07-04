/**
 * Server-Sent Events (SSE) Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SSEStream } from '../realtime/sse.js';

/**
 * Helper: collect all chunks written by an SSEStream by
 * consuming its underlying ReadableStream.
 */
async function _collectStream(stream: SSEStream): Promise<string> {
  const response = stream.getResponse();
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let result = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

// ---------------------------------------------------------------------------
// SSEStream
// ---------------------------------------------------------------------------
describe('SSEStream', () => {
  let sse: SSEStream;

  beforeEach(() => {
    vi.useFakeTimers();
    sse = new SSEStream({ keepAlive: 0 }); // disable keep-alive for deterministic tests
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('send', () => {
    it('should format a basic event correctly', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.send({ data: 'hello' });
      sse.close();

      let text = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('id: 1\n');
      expect(text).toContain('data: hello\n');
      // events are terminated by double newline
      expect(text).toContain('\n\n');
    });

    it('should include event type when specified', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.send({ event: 'update', data: 'x' });
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('event: update\n');
    });

    it('should use custom id when provided', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.send({ data: 'x', id: 'custom-42' });
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('id: custom-42\n');
    });

    it('should include retry field', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.send({ data: 'x', retry: 5000 });
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('retry: 5000\n');
    });

    it('should auto-increment IDs', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.send({ data: 'a' });
      sse.send({ data: 'b' });
      sse.send({ data: 'c' });
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('id: 1\n');
      expect(text).toContain('id: 2\n');
      expect(text).toContain('id: 3\n');
    });

    it('should split multiline data into separate data: lines', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.send({ data: 'line1\nline2\nline3' });
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('data: line1\n');
      expect(text).toContain('data: line2\n');
      expect(text).toContain('data: line3\n');
    });

    it('should JSON.stringify non-string data', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.send({ data: { key: 'value', num: 42 } });
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('data: {"key":"value","num":42}\n');
    });
  });

  describe('sendData', () => {
    it('should send data without event type', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.sendData('simple');
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('data: simple\n');
      expect(text).not.toContain('event:');
    });
  });

  describe('sendEvent', () => {
    it('should send a named event', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.sendEvent('ping', 'pong');
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('event: ping\n');
      expect(text).toContain('data: pong\n');
    });
  });

  describe('sendComment', () => {
    it('should write a comment line', async () => {
      const response = sse.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      sse.sendComment('keep-alive');
      sse.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain(': keep-alive\n\n');
    });
  });

  describe('close', () => {
    it('should mark stream as closed', () => {
      sse.getResponse(); // initialise the stream
      expect(sse.closed).toBe(false);
      sse.close();
      expect(sse.closed).toBe(true);
    });

    it('should be idempotent', () => {
      sse.getResponse();
      sse.close();
      expect(() => sse.close()).not.toThrow();
    });
  });

  describe('getResponse', () => {
    it('should return response with correct headers', () => {
      const response = sse.getResponse();
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
    });

    it('should merge custom headers', () => {
      const custom = new SSEStream({
        keepAlive: 0,
        headers: { 'X-Custom': 'yes' },
      });
      const response = custom.getResponse();
      expect(response.headers.get('X-Custom')).toBe('yes');
      custom.close();
    });
  });

  describe('retry option in constructor', () => {
    it('should send retry directive on stream start', async () => {
      const retrySSE = new SSEStream({ retry: 2000, keepAlive: 0 });
      const response = retrySSE.getResponse();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      // the retry is written immediately in start()
      retrySSE.close();

      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      expect(text).toContain('retry: 2000\n');
    });
  });
});
