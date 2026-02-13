// src/ui/components/MetricCard.tsx
import clsx from 'clsx';

interface MetricCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    max?: number;
    color?: string;
}

export function MetricCard({ label, value, subtitle, trend, max, color = 'text-[#e0e0e0]' }: MetricCardProps) {
    const percent = typeof value === 'number' && max ? (value / max) * 100 : 0;

    // Custom text color mapping for tailwind classes if needed, or stick to styles
    // For pixel art, we want distinct colors.

    return (
        <div className="pixel-card h-full flex flex-col justify-between hover:border-primary/50 transition-colors group">
            <div>
                <h3 className="text-lg font-bold text-muted uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{label}</h3>
                <div className={clsx("text-4xl font-bold tracking-tighter drop-shadow-md", color)}>
                    {value}
                </div>
                {subtitle && (
                    <div className="text-base text-muted/80 mt-1 font-mono uppercase tracking-tight">{subtitle}</div>
                )}
            </div>

            {max !== undefined && (
                <div className="w-full bg-[#000] h-4 mt-4 border border-[#333] relative">
                    <div
                        className={clsx("h-full transition-all duration-300 relative", color.replace('text-', 'bg-'))}
                        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                    >
                        {/* Scanline pattern on bar */}
                        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpi2r9//38gYGAEESAAEGAAasgJOgzOKCoAAAAASUVORK5CYII=')] opacity-30"></div>
                    </div>
                </div>
            )}

            {trend !== undefined && (
                <div className={clsx(
                    "text-xl font-bold mt-2 flex items-center gap-2",
                    trend > 0 ? "text-primary" : trend < 0 ? "text-danger" : "text-muted"
                )}>
                    {trend > 0 ? '▲' : trend < 0 ? '▼' : '►'}
                    {Math.abs(trend * 100).toFixed(2)}%
                </div>
            )}
        </div>
    );
}
