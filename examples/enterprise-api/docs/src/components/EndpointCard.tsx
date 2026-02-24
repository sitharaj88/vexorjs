import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, LockOpen } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Parameter {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}

interface EndpointCardProps {
  method: HttpMethod;
  path: string;
  description: string;
  auth?: 'required' | 'optional' | 'none';
  role?: string;
  requestBody?: string;
  responseBody?: string;
  parameters?: Parameter[];
}

const methodColors: Record<HttpMethod, string> = {
  GET: 'method-get',
  POST: 'method-post',
  PUT: 'method-put',
  PATCH: 'method-patch',
  DELETE: 'method-delete',
};

export function EndpointCard({
  method,
  path,
  description,
  auth = 'none',
  role,
  requestBody,
  responseBody,
  parameters,
}: EndpointCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="endpoint-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-4">
          <span className={`method-badge ${methodColors[method]}`}>
            {method}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                {path}
              </code>
              {auth === 'required' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                  <Lock size={12} />
                  Auth
                </span>
              )}
              {auth === 'optional' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <LockOpen size={12} />
                  Optional
                </span>
              )}
              {role && (
                <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">
                  {role}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
          <div className="text-slate-400">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          {parameters && parameters.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Parameters
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 dark:text-slate-400">
                      <th className="pb-2 pr-4 font-medium">Name</th>
                      <th className="pb-2 pr-4 font-medium">Type</th>
                      <th className="pb-2 pr-4 font-medium">Required</th>
                      <th className="pb-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700 dark:text-slate-300">
                    {parameters.map((param) => (
                      <tr key={param.name} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-primary-600 dark:text-primary-400">
                          {param.name}
                        </td>
                        <td className="py-2 pr-4 font-mono text-slate-500 dark:text-slate-400">
                          {param.type}
                        </td>
                        <td className="py-2 pr-4">
                          {param.required ? (
                            <span className="text-red-600 dark:text-red-400">Yes</span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                        <td className="py-2">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {requestBody && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Request Body
              </h4>
              <CodeBlock code={requestBody} language="json" />
            </div>
          )}

          {responseBody && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Response
              </h4>
              <CodeBlock code={responseBody} language="json" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
