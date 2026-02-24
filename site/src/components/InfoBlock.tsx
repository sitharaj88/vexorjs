import { Info, AlertTriangle, AlertCircle, Lightbulb } from 'lucide-react';

interface InfoBlockProps {
  variant?: 'info' | 'warning' | 'danger' | 'tip';
  title?: string;
  children: React.ReactNode;
}

const variants = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-800 dark:text-blue-200',
    defaultTitle: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-800 dark:text-amber-200',
    defaultTitle: 'Warning',
  },
  danger: {
    icon: AlertCircle,
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-800 dark:text-red-200',
    defaultTitle: 'Danger',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    defaultTitle: 'Tip',
  },
};

export default function InfoBlock({ variant = 'info', title, children }: InfoBlockProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg ${config.bg} border ${config.border} my-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 shrink-0`} />
        <div className={`${config.textColor} text-sm`}>
          <strong>{title || config.defaultTitle}:</strong>{' '}
          {children}
        </div>
      </div>
    </div>
  );
}
