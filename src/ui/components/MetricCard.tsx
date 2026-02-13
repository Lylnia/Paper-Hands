// src/ui/components/MetricCard.tsx
import clsx from 'clsx';

interface MetricCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    max?: number; // If provided, shows a progress bar
    color?: string;
}

export function MetricCard({ label, value, subtitle, trend, max, color = 'text-white' }: MetricCardProps) {
    const percent = typeof value === 'number' && max ? (value / max) * 100 : 0;

    return (
        <div className="p-4 rounded-lg bg-surface border border-muted flex flex-col justify-between h-full">
            <div>
                <h3 className="text-xs font-bold text-muted uppercase mb-1">{label}</h3>
                <div className={clsx("text-2xl font-bold tracking-tight", color)}>
                    {value}
                </div>
                {subtitle && (
                    <div className="text-xs text-muted mt-1">{subtitle}</div>
                )}
            </div>

            {max !== undefined && (
                <div className="w-full bg-black/50 h-1.5 mt-3 rounded-full overflow-hidden">
                    <div
                        className={clsx("h-full transition-all duration-300", color.replace('text-', 'bg-'))}
                        style={{ width: `${Math.min(100, percent)}%` }}
                    />
                </div>
            )}

            {trend !== undefined && (
                <div className={clsx(
                    "text-xs font-medium mt-2",
                    trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "text-muted"
                )}>
                    {trend > 0 ? '+' : ''}{(trend * 100).toFixed(2)}%
                </div>
            )}
        </div>
    );
}
