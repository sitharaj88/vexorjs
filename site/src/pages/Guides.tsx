import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Radio, Cloud, TestTube, AlertTriangle, Settings } from 'lucide-react';

const guides = [
  {
    icon: Shield,
    title: 'Authentication',
    description: 'Implement JWT authentication, sessions, and authorization patterns.',
    href: '/guides/authentication',
    tags: ['JWT', 'Sessions', 'OAuth'],
  },
  {
    icon: Radio,
    title: 'Real-Time',
    description: 'Build real-time features with WebSockets and Server-Sent Events.',
    href: '/guides/realtime',
    tags: ['WebSocket', 'SSE', 'Pub/Sub'],
  },
  {
    icon: AlertTriangle,
    title: 'Error Handling',
    description: 'Handle errors gracefully with custom error classes and global handlers.',
    href: '/guides/error-handling',
    tags: ['Errors', 'Validation', 'Responses'],
  },
  {
    icon: Settings,
    title: 'Configuration',
    description: 'Configure your application for different environments.',
    href: '/guides/configuration',
    tags: ['Env', 'Secrets', 'Multi-env'],
  },
  {
    icon: Cloud,
    title: 'Deployment',
    description: 'Deploy your Vexor application to production environments.',
    href: '/guides/deployment',
    tags: ['Docker', 'Kubernetes', 'Serverless'],
  },
  {
    icon: TestTube,
    title: 'Testing',
    description: 'Write unit tests, integration tests, and end-to-end tests.',
    href: '/guides/testing',
    tags: ['Vitest', 'Supertest', 'E2E'],
  },
];

export default function Guides() {
  return (
    <div className="space-y-12">
      <div>
        <h1 id="guides" className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Guides
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          In-depth tutorials and best practices for building production applications with Vexor.
        </p>
      </div>

      <section>
        <h2 id="all-guides" className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          All Guides
        </h2>

        <div className="space-y-4">
          {guides.map((guide) => (
            <Link
              key={guide.title}
              to={guide.href}
              className="block feature-card"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <guide.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                      {guide.title}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    {guide.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {guide.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
