import CodeBlock from '../../components/CodeBlock';

const routerCode = `import { RadixRouter } from '@vexorjs/core';

const router = new RadixRouter();

// Add routes
router.add('GET', '/users', handler);
router.add('GET', '/users/:id', handler);
router.add('POST', '/users', handler);
router.add('GET', '/files/*', handler);

// Find route
const match = router.find('GET', '/users/123');
// Returns: { handler, params: { id: '123' }, path: '/users/:id' }

// Get all routes
const routes = router.routes();

// Print route tree (debugging)
router.printTree();`;

export default function RouterApi() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="router-api" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Router API
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          High-performance radix tree router with O(1) static route lookups.
        </p>
      </div>

      <section>
        <h2 id="usage" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Usage
        </h2>
        <CodeBlock code={routerCode} />
      </section>

      <section>
        <h2 id="methods" className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Methods
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>add(method, path, handler)</code></td>
                <td className="py-3 px-4">Register a route</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>find(method, path)</code></td>
                <td className="py-3 px-4">Find matching route and extract params</td>
              </tr>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 px-4"><code>routes()</code></td>
                <td className="py-3 px-4">Get all registered routes</td>
              </tr>
              <tr>
                <td className="py-3 px-4"><code>printTree()</code></td>
                <td className="py-3 px-4">Print route tree for debugging</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
