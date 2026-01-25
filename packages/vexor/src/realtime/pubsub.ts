/**
 * Pub/Sub Abstraction
 *
 * Unified pub/sub interface with support for in-memory,
 * Redis, and other backends for horizontal scaling.
 */

/**
 * Message handler type
 */
export type MessageHandler<T = unknown> = (message: T, channel: string) => void | Promise<void>;

/**
 * Subscription handle
 */
export interface Subscription {
  /** Unsubscribe from the channel */
  unsubscribe(): void | Promise<void>;
  /** Check if still subscribed */
  readonly active: boolean;
}

/**
 * Pub/Sub adapter interface
 */
export interface PubSubAdapter {
  /** Publish a message to a channel */
  publish<T = unknown>(channel: string, message: T): Promise<void>;
  /** Subscribe to a channel */
  subscribe<T = unknown>(channel: string, handler: MessageHandler<T>): Promise<Subscription>;
  /** Subscribe to a pattern (e.g., 'user:*') */
  psubscribe?<T = unknown>(pattern: string, handler: MessageHandler<T>): Promise<Subscription>;
  /** Get subscriber count for a channel */
  subscriberCount?(channel: string): Promise<number>;
  /** Close the adapter */
  close?(): Promise<void>;
}

/**
 * In-memory pub/sub adapter
 */
export class MemoryPubSubAdapter implements PubSubAdapter {
  private channels = new Map<string, Set<MessageHandler>>();
  private patterns = new Map<string, Set<{ pattern: RegExp; handler: MessageHandler }>>();

  async publish<T = unknown>(channel: string, message: T): Promise<void> {
    // Direct subscribers
    const handlers = this.channels.get(channel);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(message, channel);
        } catch (error) {
          console.error(`PubSub handler error for channel ${channel}:`, error);
        }
      }
    }

    // Pattern subscribers
    for (const [_patternStr, subscriptions] of this.patterns) {
      for (const { pattern, handler } of subscriptions) {
        if (pattern.test(channel)) {
          try {
            await handler(message, channel);
          } catch (error) {
            console.error(`PubSub pattern handler error for channel ${channel}:`, error);
          }
        }
      }
    }
  }

  async subscribe<T = unknown>(channel: string, handler: MessageHandler<T>): Promise<Subscription> {
    let handlers = this.channels.get(channel);
    if (!handlers) {
      handlers = new Set();
      this.channels.set(channel, handlers);
    }

    const typedHandler = handler as MessageHandler;
    handlers.add(typedHandler);

    let active = true;

    return {
      unsubscribe: () => {
        active = false;
        handlers?.delete(typedHandler);
        if (handlers?.size === 0) {
          this.channels.delete(channel);
        }
      },
      get active() {
        return active;
      },
    };
  }

  async psubscribe<T = unknown>(pattern: string, handler: MessageHandler<T>): Promise<Subscription> {
    let subscriptions = this.patterns.get(pattern);
    if (!subscriptions) {
      subscriptions = new Set();
      this.patterns.set(pattern, subscriptions);
    }

    // Convert glob pattern to regex
    const regex = this.patternToRegex(pattern);
    const subscription = { pattern: regex, handler: handler as MessageHandler };
    subscriptions.add(subscription);

    let active = true;

    return {
      unsubscribe: () => {
        active = false;
        subscriptions?.delete(subscription);
        if (subscriptions?.size === 0) {
          this.patterns.delete(pattern);
        }
      },
      get active() {
        return active;
      },
    };
  }

  async subscriberCount(channel: string): Promise<number> {
    const handlers = this.channels.get(channel);
    return handlers?.size ?? 0;
  }

  async close(): Promise<void> {
    this.channels.clear();
    this.patterns.clear();
  }

  /**
   * Convert glob pattern to regex
   */
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }
}

/**
 * Redis pub/sub adapter (requires redis client)
 */
export interface RedisClient {
  publish(channel: string, message: string): Promise<number>;
  subscribe(channel: string, callback: (message: string, channel: string) => void): Promise<void>;
  psubscribe(pattern: string, callback: (message: string, channel: string) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  punsubscribe(pattern: string): Promise<void>;
  quit(): Promise<void>;
}

/**
 * Redis pub/sub adapter options
 */
export interface RedisPubSubOptions {
  /** Publisher client */
  publisher: RedisClient;
  /** Subscriber client (must be separate from publisher) */
  subscriber: RedisClient;
  /** Key prefix for channels */
  prefix?: string;
  /** Message serializer (default: JSON) */
  serializer?: {
    serialize: (data: unknown) => string;
    deserialize: (data: string) => unknown;
  };
}

/**
 * Create a Redis pub/sub adapter
 */
export function createRedisPubSub(options: RedisPubSubOptions): PubSubAdapter {
  const {
    publisher,
    subscriber,
    prefix = '',
    serializer = {
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    },
  } = options;

  const subscriptions = new Map<string, Set<MessageHandler>>();

  const prefixChannel = (channel: string) => prefix ? `${prefix}:${channel}` : channel;

  return {
    async publish<T = unknown>(channel: string, message: T): Promise<void> {
      const fullChannel = prefixChannel(channel);
      const data = serializer.serialize(message);
      await publisher.publish(fullChannel, data);
    },

    async subscribe<T = unknown>(channel: string, handler: MessageHandler<T>): Promise<Subscription> {
      const fullChannel = prefixChannel(channel);

      let handlers = subscriptions.get(fullChannel);
      const isNewChannel = !handlers;

      if (!handlers) {
        handlers = new Set();
        subscriptions.set(fullChannel, handlers);
      }

      const typedHandler = handler as MessageHandler;
      handlers.add(typedHandler);

      if (isNewChannel) {
        await subscriber.subscribe(fullChannel, (message, ch) => {
          const channelHandlers = subscriptions.get(ch);
          if (!channelHandlers) return;

          const data = serializer.deserialize(message);
          for (const h of channelHandlers) {
            try {
              h(data, ch);
            } catch (error) {
              console.error(`Redis PubSub handler error for channel ${ch}:`, error);
            }
          }
        });
      }

      let active = true;

      return {
        unsubscribe: async () => {
          active = false;
          handlers?.delete(typedHandler);
          if (handlers?.size === 0) {
            subscriptions.delete(fullChannel);
            await subscriber.unsubscribe(fullChannel);
          }
        },
        get active() {
          return active;
        },
      };
    },

    async close(): Promise<void> {
      for (const channel of subscriptions.keys()) {
        await subscriber.unsubscribe(channel);
      }
      subscriptions.clear();
      await publisher.quit();
      await subscriber.quit();
    },
  };
}

/**
 * Event emitter style pub/sub wrapper
 */
export class EventBus<Events extends Record<string, unknown> = Record<string, unknown>> {
  private adapter: PubSubAdapter;
  private subscriptions: Subscription[] = [];

  constructor(adapter: PubSubAdapter = new MemoryPubSubAdapter()) {
    this.adapter = adapter;
  }

  /**
   * Emit an event
   */
  async emit<K extends keyof Events>(event: K, data: Events[K]): Promise<void> {
    await this.adapter.publish(event as string, data);
  }

  /**
   * Listen for an event
   */
  async on<K extends keyof Events>(
    event: K,
    handler: (data: Events[K], event: string) => void | Promise<void>
  ): Promise<Subscription> {
    const subscription = await this.adapter.subscribe(
      event as string,
      handler as MessageHandler
    );
    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Listen for an event once
   */
  async once<K extends keyof Events>(
    event: K,
    handler: (data: Events[K], event: string) => void | Promise<void>
  ): Promise<Subscription> {
    let subscription: Subscription;

    const wrappedHandler = async (data: Events[K], ev: string) => {
      subscription.unsubscribe();
      await handler(data, ev);
    };

    subscription = await this.on(event, wrappedHandler);
    return subscription;
  }

  /**
   * Close the event bus
   */
  async close(): Promise<void> {
    for (const sub of this.subscriptions) {
      await sub.unsubscribe();
    }
    this.subscriptions = [];
    await this.adapter.close?.();
  }
}

/**
 * Create a typed event bus
 */
export function createEventBus<Events extends Record<string, unknown>>(
  adapter?: PubSubAdapter
): EventBus<Events> {
  return new EventBus<Events>(adapter);
}

/**
 * Channel group for organizing related channels
 */
export class ChannelGroup {
  private prefix: string;
  private adapter: PubSubAdapter;

  constructor(prefix: string, adapter: PubSubAdapter = new MemoryPubSubAdapter()) {
    this.prefix = prefix;
    this.adapter = adapter;
  }

  /**
   * Get full channel name
   */
  private channel(name: string): string {
    return `${this.prefix}:${name}`;
  }

  /**
   * Publish to a channel in this group
   */
  async publish<T = unknown>(channel: string, message: T): Promise<void> {
    await this.adapter.publish(this.channel(channel), message);
  }

  /**
   * Subscribe to a channel in this group
   */
  async subscribe<T = unknown>(channel: string, handler: MessageHandler<T>): Promise<Subscription> {
    return this.adapter.subscribe(this.channel(channel), handler);
  }

  /**
   * Subscribe to all channels in this group
   */
  async subscribeAll<T = unknown>(handler: MessageHandler<T>): Promise<Subscription> {
    if (!this.adapter.psubscribe) {
      throw new Error('Adapter does not support pattern subscriptions');
    }
    return this.adapter.psubscribe(`${this.prefix}:*`, handler);
  }
}

/**
 * Create a channel group
 */
export function createChannelGroup(prefix: string, adapter?: PubSubAdapter): ChannelGroup {
  return new ChannelGroup(prefix, adapter);
}

/**
 * Global memory pub/sub instance
 */
export const pubsub = new MemoryPubSubAdapter();
