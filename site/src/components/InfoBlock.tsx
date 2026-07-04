import { Info, AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react';

interface InfoBlockProps {
  variant?: 'info' | 'warning' | 'danger' | 'tip';
  title?: string;
  children: React.ReactNode;
}

const variants = {
  info: {
    icon: Info,
    accent: 'border-l-blue-500',
    bg: 'bg-blue-50/70 dark:bg-blue-950/30',
    ring: 'ring-blue-200/60 dark:ring-blue-900/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-200',
    textColor: 'text-blue-800/90 dark:text-blue-200/80',
    defaultTitle: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'border-l-amber-500',
    bg: 'bg-amber-50/70 dark:bg-amber-950/30',
    ring: 'ring-amber-200/60 dark:ring-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-900 dark:text-amber-200',
    textColor: 'text-amber-800/90 dark:text-amber-200/80',
    defaultTitle: 'Warning',
  },
  danger: {
    icon: AlertCircle,
    accent: 'border-l-red-500',
    bg: 'bg-red-50/70 dark:bg-red-950/30',
    ring: 'ring-red-200/60 dark:ring-red-900/60',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-900 dark:text-red-200',
    textColor: 'text-red-800/90 dark:text-red-200/80',
    defaultTitle: 'Danger',
  },
  tip: {
    icon: Lightbulb,
    accent: 'border-l-emerald-500',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    ring: 'ring-emerald-200/60 dark:ring-emerald-900/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-900 dark:text-emerald-200',
    textColor: 'text-emerald-800/90 dark:text-emerald-200/80',
    defaultTitle: 'Tip',
  },
};

export default function InfoBlock({ variant = 'info', title, children }: InfoBlockProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={`my-6 rounded-lg border-l-4 ${config.accent} ${config.bg} ring-1 ${config.ring} p-4`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 shrink-0`} aria-hidden="true" />
        <div className="min-w-0 text-sm leading-relaxed">
          <span className={`font-semibold ${config.titleColor}`}>
            {title || config.defaultTitle}:
          </span>{' '}
          <span className={config.textColor}>{children}</span>
        </div>
      </div>
    </div>
  );
}
