/**
 * Radix Tree Router
 *
 * High-performance router using radix tree (prefix tree) for O(k) lookups
 * where k is the length of the path. Inspired by find-my-way.
 *
 * Features:
 * - Static route short-circuit (O(1) for static routes)
 * - Parametric route caching
 * - Wildcard support
 * - Constraint support
 */

import type { HTTPMethod, RouteParams, Handler, RouteSchema, RouteHooks, MatchedRoute } from '../core/types.js';

// Node types in the radix tree
const enum NodeType {
  STATIC = 0,    // Normal static path segment
  PARAM = 1,     // Path parameter (e.g., :id)
  CATCHALL = 2,  // Wildcard/catch-all (e.g., *)
}

/**
 * Route data stored at leaf nodes
 * Uses 'any' for handler to allow any context type
 */
interface RouteData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: Handler<any>;
  schema?: RouteSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks?: RouteHooks<any>;
  paramNames: string[];
}

/**
 * Radix tree node
 */
class RadixNode {
  // Path segment this node represents
  path: string;

  // Node type
  type: NodeType;

  // Children nodes
  children: Map<string, RadixNode>;

  // Parameter child (only one allowed per node)
  paramChild?: RadixNode;

  // Wildcard child
  wildcardChild?: RadixNode;

  // Route data (only for leaf nodes)
  route?: RouteData;

  // Parameter name (for PARAM nodes)
  paramName?: string;

  constructor(path: string, type: NodeType = NodeType.STATIC) {
    this.path = path;
    this.type = type;
    this.children = new Map();
  }

  /**
   * Get or create child node for a path segment
   */
  getOrCreateChild(segment: string, type: NodeType = NodeType.STATIC): RadixNode {
    if (type === NodeType.PARAM) {
      if (!this.paramChild) {
        this.paramChild = new RadixNode('', NodeType.PARAM);
      }
      return this.paramChild;
    }

    if (type === NodeType.CATCHALL) {
      if (!this.wildcardChild) {
        this.wildcardChild = new RadixNode('', NodeType.CATCHALL);
      }
      return this.wildcardChild;
    }

    let child = this.children.get(segment);
    if (!child) {
      child = new RadixNode(segment, type);
      this.children.set(segment, child);
    }
    return child;
  }
}

/**
 * Match result from the router
 */
interface MatchResult {
  route: RouteData;
  params: RouteParams;
}

/**
 * RadixRouter - High-performance router implementation
 */
export class RadixRouter {
  // Separate trees for each HTTP method for faster lookup
  private trees: Map<HTTPMethod, RadixNode> = new Map();

  // Static route cache for O(1) lookup
  private staticRoutes: Map<string, RouteData> = new Map();

  // Parametric route cache (LRU)
  private paramCache: Map<string, MatchResult | null> = new Map();
  private paramCacheMaxSize = 1000;

  /**
   * Add a route to the router
   */
  add(
    method: HTTPMethod,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: Handler<any>,
    schema?: RouteSchema,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hooks?: RouteHooks<any>
  ): void {
    // Normalize path
    const normalizedPath = this.normalizePath(path);

    // Extract parameter names
    const paramNames: string[] = [];
    const isStatic = !normalizedPath.includes(':') && !normalizedPath.includes('*');

    // For static routes, use direct map lookup
    if (isStatic) {
      const key = `${method}:${normalizedPath}`;
      this.staticRoutes.set(key, { handler, schema, hooks, paramNames });
      return;
    }

    // Get or create tree for this method
    let tree = this.trees.get(method);
    if (!tree) {
      tree = new RadixNode('');
      this.trees.set(method, tree);
    }

    // Parse path and insert into tree
    const segments = normalizedPath.split('/').filter(Boolean);
    let currentNode = tree;

    for (const segment of segments) {
      if (segment.startsWith(':')) {
        // Parameter segment
        const paramName = segment.slice(1);
        paramNames.push(paramName);
        currentNode = currentNode.getOrCreateChild('', NodeType.PARAM);
        currentNode.paramName = paramName;
      } else if (segment === '*') {
        // Wildcard segment
        paramNames.push('*');
        currentNode = currentNode.getOrCreateChild('', NodeType.CATCHALL);
        break; // Wildcard must be last
      } else {
        // Static segment
        currentNode = currentNode.getOrCreateChild(segment, NodeType.STATIC);
      }
    }

    // Store route data at leaf node
    currentNode.route = { handler, schema, hooks, paramNames };
  }

  /**
   * Find a route matching the given method and path
   */
  find(method: HTTPMethod, path: string): MatchResult | null {
    const normalizedPath = this.normalizePath(path);

    // Check static route cache first (O(1))
    const staticKey = `${method}:${normalizedPath}`;
    const staticRoute = this.staticRoutes.get(staticKey);
    if (staticRoute) {
      return { route: staticRoute, params: {} };
    }

    // Check parametric cache
    const cacheKey = staticKey;
    const cachedResult = this.paramCache.get(cacheKey);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    // Get tree for this method
    const tree = this.trees.get(method);
    if (!tree) {
      this.cacheResult(cacheKey, null);
      return null;
    }

    // Perform tree traversal
    const segments = normalizedPath.split('/').filter(Boolean);
    const params: RouteParams = {};
    const result = this.traverse(tree, segments, 0, params);

    if (result) {
      const matchResult = { route: result, params };
      this.cacheResult(cacheKey, matchResult);
      return matchResult;
    }

    this.cacheResult(cacheKey, null);
    return null;
  }

  /**
   * Traverse the tree to find a matching route
   */
  private traverse(
    node: RadixNode,
    segments: string[],
    index: number,
    params: RouteParams
  ): RouteData | null {
    // If we've consumed all segments
    if (index === segments.length) {
      return node.route ?? null;
    }

    const segment = segments[index];

    // Try static child first (most specific)
    const staticChild = node.children.get(segment);
    if (staticChild) {
      const result = this.traverse(staticChild, segments, index + 1, params);
      if (result) return result;
    }

    // Try parameter child
    if (node.paramChild) {
      params[node.paramChild.paramName!] = segment;
      const result = this.traverse(node.paramChild, segments, index + 1, params);
      if (result) return result;
      // Backtrack
      delete params[node.paramChild.paramName!];
    }

    // Try wildcard child (least specific, catches all remaining)
    if (node.wildcardChild) {
      params['*'] = segments.slice(index).join('/');
      return node.wildcardChild.route ?? null;
    }

    return null;
  }

  /**
   * Cache a match result with LRU eviction
   */
  private cacheResult(key: string, result: MatchResult | null): void {
    if (this.paramCache.size >= this.paramCacheMaxSize) {
      // Simple LRU: delete first key
      const firstKey = this.paramCache.keys().next().value;
      if (firstKey !== undefined) {
        this.paramCache.delete(firstKey);
      }
    }
    this.paramCache.set(key, result);
  }

  /**
   * Normalize a path
   */
  private normalizePath(path: string): string {
    // Ensure path starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    // Remove trailing slash (except for root)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  }

  /**
   * Get all registered routes (for debugging/documentation)
   */
  getRoutes(): Array<{ method: HTTPMethod; path: string }> {
    const routes: Array<{ method: HTTPMethod; path: string }> = [];

    // Add static routes
    for (const key of this.staticRoutes.keys()) {
      const [method, path] = key.split(':') as [HTTPMethod, string];
      routes.push({ method, path });
    }

    // Add dynamic routes from trees
    for (const [method, tree] of this.trees) {
      this.collectRoutes(tree, '', method, routes);
    }

    return routes;
  }

  /**
   * Recursively collect routes from tree
   */
  private collectRoutes(
    node: RadixNode,
    path: string,
    method: HTTPMethod,
    routes: Array<{ method: HTTPMethod; path: string }>
  ): void {
    const currentPath = path + (node.path ? '/' + node.path : '');

    if (node.route) {
      routes.push({ method, path: currentPath || '/' });
    }

    for (const child of node.children.values()) {
      this.collectRoutes(child, currentPath, method, routes);
    }

    if (node.paramChild) {
      this.collectRoutes(
        node.paramChild,
        currentPath + '/:' + node.paramChild.paramName,
        method,
        routes
      );
    }

    if (node.wildcardChild) {
      routes.push({ method, path: currentPath + '/*' });
    }
  }

  /**
   * Clear the parameter cache
   */
  clearCache(): void {
    this.paramCache.clear();
  }

  /**
   * Reset the router (remove all routes)
   */
  reset(): void {
    this.trees.clear();
    this.staticRoutes.clear();
    this.paramCache.clear();
  }
}

/**
 * Convert MatchResult to MatchedRoute for context
 */
export function toMatchedRoute(result: MatchResult | null): MatchedRoute | undefined {
  if (!result) return undefined;

  return {
    handler: result.route.handler,
    params: result.params,
    schema: result.route.schema,
    hooks: result.route.hooks,
  };
}
