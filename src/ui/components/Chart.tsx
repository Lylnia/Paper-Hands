// src/ui/components/Chart.tsx
import { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

interface ChartProps {
    data: [number[], number[]]; // [timestamps, values]
    width: number;
    height: number;
    color?: string;
    label?: string;
}

export function Chart({ data, width, height, color = '#33ff00', label }: ChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const uPlotRef = useRef<uPlot | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const opts: uPlot.Options = {
            width,
            height,
            series: [
                {},
                {
                    stroke: color,
                    width: 2,
                    fill: color + '22', // Low opacity fill
                    points: { show: false } // No points, just line
                },
            ],
            axes: [
                { grid: { show: false }, ticks: { show: false }, stroke: '#666', font: '12px "VT323"' },
                {
                    grid: { stroke: '#333', width: 1, dash: [4, 4] },
                    ticks: { show: true, stroke: '#666' },
                    stroke: '#666',
                    font: '12px "VT323"',
                    size: 40
                }
            ],
            cursor: {
                show: true,
                points: { size: 6, fill: color }
            },
            legend: {
                show: false
            }
        };

        const u = new uPlot(opts, data, chartRef.current);
        uPlotRef.current = u;

        // Custom CRT flicker effect on the chart container
        if (chartRef.current) {
            chartRef.current.style.filter = "contrast(1.2) brightness(1.1)";
        }

        return () => {
            u.destroy();
        };
    }, []);

    useEffect(() => {
        if (uPlotRef.current) {
            uPlotRef.current.setData(data);
        }
    }, [data]);

    return (
        <div className="relative">
            {label && <div className="absolute top-2 left-2 text-primary text-xs uppercase z-10 bg-black/50 px-1 border border-primary">{label}</div>}
            <div ref={chartRef} className="opacity-90 mix-blend-screen" />
        </div>
    );
}
