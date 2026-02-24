/**
 * Pub/Sub Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MemoryPubSubAdapter,
  EventBus,
  ChannelGroup,
} from '../realtime/pubsub.js';

// ---------------------------------------------------------------------------
// MemoryPubSubAdapter
// ---------------------------------------------------------------------------
describe('MemoryPubSubAdapter', () => {
  let adapter: MemoryPubSubAdapter;

  beforeEach(() => {
    adapter = new MemoryPubSubAdapter();
  });

  it('should deliver message to subscriber', async () => {
    const handler = vi.fn();
    await adapter.subscribe('ch1', handler);
    await adapter.publish('ch1', { text: 'hi' });

    expect(handler).toHaveBeenCalledWith({ text: 'hi' }, 'ch1');
  });

  it('should deliver to multiple subscribers', async () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    await adapter.subscribe('ch1', h1);
    await adapter.subscribe('ch1', h2);
    await adapter.publish('ch1', 'msg');

    expect(h1).toHaveBeenCalledWith('msg', 'ch1');
    expect(h2).toHaveBeenCalledWith('msg', 'ch1');
  });

  it('should not deliver to unsubscribed handler', async () => {
    const handler = vi.fn();
    const sub = await adapter.subscribe('ch1', handler);
    sub.unsubscribe();
    await adapter.publish('ch1', 'after');

    expect(handler).not.toHaveBeenCalled();
  });

  it('subscription should report active status', async () => {
    const sub = await adapter.subscribe('ch1', vi.fn());
    expect(sub.active).toBe(true);
    sub.unsubscribe();
    expect(sub.active).toBe(false);
  });

  it('should not deliver to wrong channel', async () => {
    const handler = vi.fn();
    await adapter.subscribe('ch1', handler);
    await adapter.publish('ch2', 'wrong');

    expect(handler).not.toHaveBeenCalled();
  });

  describe('psubscribe', () => {
    it('should match glob patterns', async () => {
      const handler = vi.fn();
      await adapter.psubscribe!('user:*', handler);

      await adapter.publish('user:login', { id: 1 });
      await adapter.publish('user:logout', { id: 1 });
      await adapter.publish('order:created', { id: 2 });

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith({ id: 1 }, 'user:login');
      expect(handler).toHaveBeenCalledWith({ id: 1 }, 'user:logout');
    });

    it('should unsubscribe pattern', async () => {
      const handler = vi.fn();
      const sub = await adapter.psubscribe!('user:*', handler);
      sub.unsubscribe();

      await adapter.publish('user:login', {});
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('subscriberCount', () => {
    it('should return correct count', async () => {
      await adapter.subscribe('ch', vi.fn());
      await adapter.subscribe('ch', vi.fn());
      await adapter.subscribe('other', vi.fn());

      expect(await adapter.subscriberCount!('ch')).toBe(2);
      expect(await adapter.subscriberCount!('other')).toBe(1);
      expect(await adapter.subscriberCount!('empty')).toBe(0);
    });
  });

  describe('close', () => {
    it('should clear all subscriptions', async () => {
      const handler = vi.fn();
      await adapter.subscribe('ch', handler);
      await adapter.close!();
      await adapter.publish('ch', 'after close');

      expect(handler).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// EventBus
// ---------------------------------------------------------------------------
describe('EventBus', () => {
  type Events = {
    greet: { name: string };
    count: number;
  };

  let bus: EventBus<Events>;

  beforeEach(() => {
    bus = new EventBus<Events>();
  });

  it('should emit and receive events', async () => {
    const handler = vi.fn();
    await bus.on('greet', handler);
    await bus.emit('greet', { name: 'Alice' });

    expect(handler).toHaveBeenCalledWith({ name: 'Alice' }, 'greet');
  });

  it('should support once which triggers only once', async () => {
    const handler = vi.fn();
    await bus.once('count', handler);

    await bus.emit('count', 1);
    await bus.emit('count', 2);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(1, 'count');
  });

  it('should clean up on close', async () => {
    const handler = vi.fn();
    await bus.on('greet', handler);
    await bus.close();

    await bus.emit('greet', { name: 'Bob' });
    expect(handler).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ChannelGroup
// ---------------------------------------------------------------------------
describe('ChannelGroup', () => {
  let adapter: MemoryPubSubAdapter;
  let group: ChannelGroup;

  beforeEach(() => {
    adapter = new MemoryPubSubAdapter();
    group = new ChannelGroup('app', adapter);
  });

  it('should prefix channel names', async () => {
    const handler = vi.fn();
    await group.subscribe('events', handler);
    await group.publish('events', { type: 'click' });

    expect(handler).toHaveBeenCalledWith({ type: 'click' }, 'app:events');
  });

  it('should subscribeAll using pattern', async () => {
    const handler = vi.fn();
    await group.subscribeAll(handler);

    await adapter.publish('app:foo', 'a');
    await adapter.publish('app:bar', 'b');
    await adapter.publish('other:baz', 'c');

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
