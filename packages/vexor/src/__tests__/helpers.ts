/**
 * Shared test helpers for Vexor framework tests
 */

import { VexorContext } from '../core/context.js';
import { VexorRequest } from '../core/request.js';

/**
 * Create a mock VexorRequest from a URL and optional RequestInit
 */
export function createMockRequest(url: string, init?: RequestInit): VexorRequest {
  const request = new Request(url, init);
  return new VexorRequest(request);
}

/**
 * Create a mock VexorContext for middleware testing
 */
export function createMockContext(url: string, init?: RequestInit): VexorContext {
  const vexorReq = createMockRequest(url, init);
  const ctx = new VexorContext();
  ctx.init(vexorReq);
  return ctx;
}
