import { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'indigo',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'indigo' | 'teal' | 'ember';
}) {
  const accentClasses = {
    indigo: 'bg-signal-indigo/10 text-signal-indigo',
    teal: 'bg-signal-teal/10 text-signal-teal',
    ember: 'bg-signal-ember/10 text-signal-ember',
  }[accent];

  return (
    <div className="glass-panel rounded-xl3 p-5">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="font-mono text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-ink-muted dark:text-ink-muted-dark">{label}</p>
    </div>
  );
}
