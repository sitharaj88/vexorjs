/**
 * Dependency Injection Container
 *
 * Lightweight DI container without decorators or reflect-metadata.
 * Supports constructor injection, factory functions, and scopes.
 */

/**
 * Service identifier (class or string token)
 */
export type ServiceId<T = unknown> = (new (...args: unknown[]) => T) | string | symbol;

/**
 * Factory function type
 */
export type Factory<T> = (container: Container) => T | Promise<T>;

/**
 * Service scope
 */
export type ServiceScope = 'singleton' | 'transient' | 'scoped';

/**
 * Service registration options
 */
export interface ServiceOptions<T = unknown> {
  /** Service scope */
  scope?: ServiceScope;
  /** Factory function */
  factory?: Factory<T>;
  /** Instance (for pre-created singletons) */
  instance?: T;
  /** Dependencies (service IDs) */
  dependencies?: ServiceId[];
  /** Tags for grouping services */
  tags?: string[];
}

/**
 * Service registration
 */
interface ServiceRegistration<T = unknown> {
  id: ServiceId<T>;
  options: ServiceOptions<T>;
  singleton?: T;
}

/**
 * Container options
 */
export interface ContainerOptions {
  /** Parent container (for scoped containers) */
  parent?: Container;
  /** Auto-bind classes */
  autoBind?: boolean;
}

/**
 * Dependency injection container
 */
export class Container {
  private services = new Map<ServiceId, ServiceRegistration>();
  private scopedInstances = new Map<ServiceId, unknown>();
  private resolving = new Set<ServiceId>();
  private options: ContainerOptions;

  constructor(options: ContainerOptions = {}) {
    this.options = options;

    // Register container itself
    this.services.set(Container as unknown as ServiceId, {
      id: Container as unknown as ServiceId,
      options: { scope: 'singleton', instance: this },
      singleton: this,
    });
  }

  /**
   * Register a service
   */
  register<T>(id: ServiceId<T>, options: ServiceOptions<T> = {}): this {
    this.services.set(id, {
      id,
      options: {
        scope: 'singleton',
        ...options,
      },
    });
    return this;
  }

  /**
   * Register a singleton service
   */
  singleton<T>(id: ServiceId<T>, factoryOrInstance?: Factory<T> | T): this {
    if (typeof factoryOrInstance === 'function' && factoryOrInstance.length <= 1) {
      // It's a factory
      return this.register(id, {
        scope: 'singleton',
        factory: factoryOrInstance as Factory<T>,
      });
    } else if (factoryOrInstance !== undefined) {
      // It's an instance
      return this.register(id, {
        scope: 'singleton',
        instance: factoryOrInstance as T,
      });
    }
    return this.register(id, { scope: 'singleton' });
  }

  /**
   * Register a transient service (new instance each time)
   */
  transient<T>(id: ServiceId<T>, factory?: Factory<T>): this {
    return this.register(id, {
      scope: 'transient',
      factory,
    });
  }

  /**
   * Register a scoped service (same instance within a scope)
   */
  scoped<T>(id: ServiceId<T>, factory?: Factory<T>): this {
    return this.register(id, {
      scope: 'scoped',
      factory,
    });
  }

  /**
   * Register a factory function
   */
  factory<T>(id: ServiceId<T>, factory: Factory<T>, scope: ServiceScope = 'singleton'): this {
    return this.register(id, { scope, factory });
  }

  /**
   * Register an existing instance
   */
  instance<T>(id: ServiceId<T>, value: T): this {
    return this.register(id, {
      scope: 'singleton',
      instance: value,
    });
  }

  /**
   * Register a class with automatic constructor injection
   */
  bind<T>(
    Class: new (...args: unknown[]) => T,
    dependencies: ServiceId[] = [],
    scope: ServiceScope = 'singleton'
  ): this {
    return this.register(Class, {
      scope,
      dependencies,
      factory: async (container) => {
        const deps = await Promise.all(
          dependencies.map((dep) => container.resolve(dep))
        );
        return new Class(...deps);
      },
    });
  }

  /**
   * Check if service is registered
   */
  has(id: ServiceId): boolean {
    if (this.services.has(id)) return true;
    if (this.options.parent) return this.options.parent.has(id);
    return false;
  }

  /**
   * Resolve a service
   */
  async resolve<T>(id: ServiceId<T>): Promise<T> {
    // Check for circular dependency
    if (this.resolving.has(id)) {
      throw new Error(`Circular dependency detected: ${String(id)}`);
    }

    // Get registration
    let registration = this.services.get(id);

    // Check parent container
    if (!registration && this.options.parent) {
      return this.options.parent.resolve(id);
    }

    // Auto-bind if enabled and it's a class
    if (!registration && this.options.autoBind && typeof id === 'function') {
      this.bind(id as new (...args: unknown[]) => T);
      registration = this.services.get(id);
    }

    if (!registration) {
      throw new Error(`Service not registered: ${String(id)}`);
    }

    const { options, singleton } = registration;

    // Return existing singleton
    if (options.scope === 'singleton' && singleton !== undefined) {
      return singleton as T;
    }

    // Return existing instance
    if (options.instance !== undefined) {
      registration.singleton = options.instance;
      return options.instance as T;
    }

    // Return scoped instance
    if (options.scope === 'scoped') {
      const scoped = this.scopedInstances.get(id);
      if (scoped !== undefined) {
        return scoped as T;
      }
    }

    // Create instance
    this.resolving.add(id);

    try {
      let instance: T;

      if (options.factory) {
        instance = await options.factory(this) as T;
      } else if (typeof id === 'function') {
        // Auto-instantiate class
        const deps = options.dependencies ?? [];
        const resolvedDeps = await Promise.all(
          deps.map((dep) => this.resolve(dep))
        );
        instance = new (id as new (...args: unknown[]) => T)(...resolvedDeps);
      } else {
        throw new Error(`Cannot resolve service "${String(id)}": no factory or class provided`);
      }

      // Store based on scope
      if (options.scope === 'singleton') {
        registration.singleton = instance;
      } else if (options.scope === 'scoped') {
        this.scopedInstances.set(id, instance);
      }

      return instance;
    } finally {
      this.resolving.delete(id);
    }
  }

  /**
   * Resolve service synchronously (must already be instantiated)
   */
  get<T>(id: ServiceId<T>): T {
    const registration = this.services.get(id);

    if (!registration) {
      if (this.options.parent) {
        return this.options.parent.get(id);
      }
      throw new Error(`Service not registered: ${String(id)}`);
    }

    if (registration.singleton !== undefined) {
      return registration.singleton as T;
    }

    if (registration.options.instance !== undefined) {
      return registration.options.instance as T;
    }

    if (registration.options.scope === 'scoped') {
      const scoped = this.scopedInstances.get(id);
      if (scoped !== undefined) {
        return scoped as T;
      }
    }

    throw new Error(`Service "${String(id)}" not yet resolved. Use resolve() for async resolution.`);
  }

  /**
   * Try to get service (returns undefined if not found)
   */
  tryGet<T>(id: ServiceId<T>): T | undefined {
    try {
      return this.get(id);
    } catch {
      return undefined;
    }
  }

  /**
   * Resolve multiple services
   */
  async resolveAll<T extends ServiceId[]>(
    ...ids: T
  ): Promise<{ [K in keyof T]: T[K] extends ServiceId<infer U> ? U : never }> {
    return Promise.all(ids.map((id) => this.resolve(id))) as Promise<
      { [K in keyof T]: T[K] extends ServiceId<infer U> ? U : never }
    >;
  }

  /**
   * Get services by tag
   */
  async resolveByTag<T = unknown>(tag: string): Promise<T[]> {
    const results: T[] = [];

    for (const [id, registration] of this.services) {
      if (registration.options.tags?.includes(tag)) {
        results.push(await this.resolve(id as ServiceId<T>));
      }
    }

    return results;
  }

  /**
   * Create a scoped container (child container with isolated scope)
   */
  createScope(): Container {
    return new Container({
      parent: this,
    });
  }

  /**
   * Clear scoped instances
   */
  clearScope(): void {
    this.scopedInstances.clear();
  }

  /**
   * Dispose all services (call dispose methods if available)
   */
  async dispose(): Promise<void> {
    for (const registration of this.services.values()) {
      const instance = registration.singleton;
      if (instance && typeof (instance as { dispose?: () => void | Promise<void> }).dispose === 'function') {
        await (instance as { dispose: () => void | Promise<void> }).dispose();
      }
    }

    for (const instance of this.scopedInstances.values()) {
      if (instance && typeof (instance as { dispose?: () => void | Promise<void> }).dispose === 'function') {
        await (instance as { dispose: () => void | Promise<void> }).dispose();
      }
    }

    this.services.clear();
    this.scopedInstances.clear();
  }
}

/**
 * Create a new container
 */
export function createContainer(options?: ContainerOptions): Container {
  return new Container(options);
}

/**
 * Service token for non-class services
 */
export function token<T>(name: string): ServiceId<T> {
  return Symbol.for(`vexor:service:${name}`);
}

/**
 * Inject decorator alternative (for manual dependency specification)
 */
export function inject<T extends new (...args: unknown[]) => unknown>(
  Target: T,
  ...dependencies: ServiceId[]
): T {
  // Attach metadata to the class
  (Target as unknown as { __dependencies: ServiceId[] }).__dependencies = dependencies;
  return Target;
}

/**
 * Get dependencies from class metadata
 */
export function getDependencies(Target: new (...args: unknown[]) => unknown): ServiceId[] {
  return (Target as unknown as { __dependencies?: ServiceId[] }).__dependencies ?? [];
}

/**
 * Module definition for grouping registrations
 */
export interface Module {
  /** Module name */
  name: string;
  /** Imports (other modules) */
  imports?: Module[];
  /** Services to register */
  services?: Array<{
    id: ServiceId;
    options?: ServiceOptions;
  }>;
  /** Factories to register */
  factories?: Array<{
    id: ServiceId;
    factory: Factory<unknown>;
    scope?: ServiceScope;
  }>;
  /** Module initialization */
  onInit?: (container: Container) => void | Promise<void>;
}

/**
 * Register a module
 */
export async function registerModule(container: Container, module: Module): Promise<void> {
  // Import dependencies first
  if (module.imports) {
    for (const imported of module.imports) {
      await registerModule(container, imported);
    }
  }

  // Register services
  if (module.services) {
    for (const service of module.services) {
      container.register(service.id, service.options);
    }
  }

  // Register factories
  if (module.factories) {
    for (const factory of module.factories) {
      container.factory(factory.id, factory.factory, factory.scope);
    }
  }

  // Run initialization
  if (module.onInit) {
    await module.onInit(container);
  }
}

/**
 * Define a module
 */
export function defineModule(options: Module): Module {
  return options;
}
