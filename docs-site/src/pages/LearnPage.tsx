import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Code2,
  Network,
  Rocket,
  Clock,
  BookOpen,
  ChevronRight,
  Zap,
  Shield,
  Database,
  Server,
  Layers,
  TestTube,
  Upload,
  Lock,
  GitBranch,
  Container,
  Activity,
  Gauge,
  Settings,
  Globe,
  Workflow
} from 'lucide-react';

interface Track {
  level: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  duration: string;
  chapters: { title: string; href: string; icon: React.ReactNode }[];
}

const tracks: Track[] = [
  {
    level: 'Beginner',
    title: 'Fundamentals',
    description: 'Start your backend journey. Learn HTTP, TypeScript, and build your first API from scratch.',
    href: '/learn/fundamentals',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    duration: '2-3 hours',
    chapters: [
      { title: 'HTTP & REST Basics', href: '/learn/fundamentals#http-basics', icon: <Globe className="w-4 h-4" /> },
      { title: 'TypeScript Essentials', href: '/learn/fundamentals#typescript', icon: <Code2 className="w-4 h-4" /> },
      { title: 'Your First API', href: '/learn/fundamentals#first-api', icon: <Zap className="w-4 h-4" /> },
      { title: 'Request & Response', href: '/learn/fundamentals#request-response', icon: <Workflow className="w-4 h-4" /> },
      { title: 'Working with JSON', href: '/learn/fundamentals#json', icon: <BookOpen className="w-4 h-4" /> },
      { title: 'RESTful CRUD API', href: '/learn/fundamentals#restful-crud', icon: <Layers className="w-4 h-4" /> },
    ],
  },
  {
    level: 'Intermediate',
    title: 'Building APIs',
    description: 'Level up with authentication, databases, error handling, validation, and testing.',
    href: '/learn/building-apis',
    icon: <Code2 className="w-6 h-6" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20 hover:border-blue-500/40',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    duration: '4-5 hours',
    chapters: [
      { title: 'Authentication & JWT', href: '/learn/building-apis#authentication', icon: <Lock className="w-4 h-4" /> },
      { title: 'Database Patterns', href: '/learn/building-apis#database', icon: <Database className="w-4 h-4" /> },
      { title: 'Error Handling', href: '/learn/building-apis#error-handling', icon: <Shield className="w-4 h-4" /> },
      { title: 'Input Validation', href: '/learn/building-apis#validation', icon: <Gauge className="w-4 h-4" /> },
      { title: 'File Uploads', href: '/learn/building-apis#file-uploads', icon: <Upload className="w-4 h-4" /> },
      { title: 'Testing APIs', href: '/learn/building-apis#testing', icon: <TestTube className="w-4 h-4" /> },
    ],
  },
  {
    level: 'Advanced',
    title: 'Architecture & System Design',
    description: 'Design systems that scale with microservices, events, caching, and performance patterns.',
    href: '/learn/architecture',
    icon: <Network className="w-6 h-6" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    duration: '5-6 hours',
    chapters: [
      { title: 'System Design', href: '/learn/architecture#system-design', icon: <Server className="w-4 h-4" /> },
      { title: 'Microservices', href: '/learn/architecture#microservices', icon: <Network className="w-4 h-4" /> },
      { title: 'Event-Driven', href: '/learn/architecture#event-driven', icon: <Zap className="w-4 h-4" /> },
      { title: 'Caching Strategies', href: '/learn/architecture#caching', icon: <Database className="w-4 h-4" /> },
      { title: 'Performance', href: '/learn/architecture#performance', icon: <Gauge className="w-4 h-4" /> },
    ],
  },
  {
    level: 'Expert',
    title: 'Production & DevOps',
    description: 'Ship with confidence. Docker, CI/CD, monitoring, security, and scaling strategies.',
    href: '/learn/production',
    icon: <Rocket className="w-6 h-6" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20 hover:border-red-500/40',
    badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400',
    duration: '4-5 hours',
    chapters: [
      { title: 'Docker & Containers', href: '/learn/production#docker', icon: <Container className="w-4 h-4" /> },
      { title: 'Monitoring & Logging', href: '/learn/production#monitoring', icon: <Activity className="w-4 h-4" /> },
      { title: 'Security Hardening', href: '/learn/production#security', icon: <Shield className="w-4 h-4" /> },
      { title: 'CI/CD Pipelines', href: '/learn/production#cicd', icon: <GitBranch className="w-4 h-4" /> },
      { title: 'Scaling & Clustering', href: '/learn/production#scaling', icon: <Server className="w-4 h-4" /> },
      { title: 'Environment Config', href: '/learn/production#config', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

const stats = [
  { label: 'Chapters', value: '23' },
  { label: 'Tracks', value: '4' },
  { label: 'Code Examples', value: '50+' },
  { label: 'Estimated Time', value: '15-19h' },
];

export default function LearnPage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-vexor-500/20 via-transparent to-purple-500/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-vexor-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-vexor-500/20 text-vexor-400 rounded-full text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Learning Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
            Master Backend Development with{' '}
            <span className="bg-gradient-to-r from-vexor-400 to-purple-400 bg-clip-text text-transparent">Vexor</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mb-8">
            A structured learning path from your first API to production-grade systems.
            Hands-on code examples, real-world patterns, and best practices at every level.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Path Visual */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Your Learning Path</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Progress through four tracks, each building on the last. Start wherever matches your experience level.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="hidden md:flex items-center justify-between max-w-3xl mx-auto mb-12 px-8">
          {tracks.map((track, i) => (
            <div key={track.level} className="flex items-center">
              <Link
                to={track.href}
                className={`flex flex-col items-center gap-2 group`}
              >
                <div className={`w-12 h-12 rounded-xl ${track.bgColor} flex items-center justify-center ${track.color} group-hover:scale-110 transition-transform`}>
                  {track.icon}
                </div>
                <span className={`text-xs font-semibold ${track.color}`}>{track.level}</span>
              </Link>
              {i < tracks.length - 1 && (
                <div className="w-20 lg:w-32 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-slate-200 dark:to-slate-800 mx-3"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Track Cards */}
      <div className="space-y-8">
        {tracks.map((track, index) => (
          <div
            key={track.level}
            className={`rounded-2xl border ${track.borderColor} bg-white dark:bg-slate-900/50 transition-colors overflow-hidden`}
          >
            {/* Track Header */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className={`w-14 h-14 rounded-2xl ${track.bgColor} flex items-center justify-center ${track.color} flex-shrink-0`}>
                  {track.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${track.badgeColor}`}>
                      {track.level}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3" />
                      {track.duration}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {track.chapters.length} chapters
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {track.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {track.description}
                  </p>
                </div>
                <Link
                  to={track.href}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 flex-shrink-0 ${
                    index === 0 ? 'bg-emerald-500 hover:bg-emerald-600' :
                    index === 1 ? 'bg-blue-500 hover:bg-blue-600' :
                    index === 2 ? 'bg-purple-500 hover:bg-purple-600' :
                    'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  Start Track
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Chapters Grid */}
            <div className="border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 px-6 sm:px-8 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {track.chapters.map((chapter, chIdx) => (
                  <Link
                    key={chapter.title}
                    to={chapter.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${track.bgColor} ${track.color} flex-shrink-0 text-sm`}>
                      {chapter.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {String(chIdx + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                        {chapter.title}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What You'll Build */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">What You'll Learn to Build</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'RESTful APIs', desc: 'CRUD operations with validation, error handling, and proper HTTP semantics', gradient: 'from-emerald-500 to-teal-600' },
            { title: 'Auth Systems', desc: 'JWT tokens, role-based access control, middleware guards, and session management', gradient: 'from-blue-500 to-indigo-600' },
            { title: 'Scalable Architecture', desc: 'Microservices, event-driven systems, caching layers, and message queues', gradient: 'from-purple-500 to-violet-600' },
            { title: 'Production Deploys', desc: 'Docker, CI/CD pipelines, monitoring, security hardening, and scaling', gradient: 'from-red-500 to-rose-600' },
          ].map((item) => (
            <div key={item.title} className="relative overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`}></div>
              <h3 className="font-bold text-slate-900 dark:text-white mt-2 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Ready to Start?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
          Begin with the fundamentals or jump to the track that matches your skill level.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/learn/fundamentals"
            className="inline-flex items-center gap-2 px-6 py-3 bg-vexor-500 hover:bg-vexor-600 text-white rounded-xl transition-colors font-semibold"
          >
            <GraduationCap className="w-5 h-5" />
            Start from Basics
          </Link>
          <Link
            to="/learn/architecture"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-colors font-semibold"
          >
            <Network className="w-5 h-5" />
            Jump to Architecture
          </Link>
        </div>
      </div>
    </div>
  );
}
