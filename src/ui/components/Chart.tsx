// src/ui/components/Chart.tsx
import { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

interface ChartProps {
    data: [number[], number[]]; // [timestamps, values]
    width: number;
    height: number;
    color?: string;
}

export function Chart({ data, width, height, color = '#3b82f6' }: ChartProps) {
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
                    fill: color + '33', // 20% opacity
                },
            ],
            axes: [
                { grid: { show: false }, ticks: { show: false } },
                { grid: { stroke: '#333', width: 1 }, ticks: { show: false }, size: 0 }
            ],
            cursor: {
                show: false
            },
            legend: {
                show: false
            }
        };

        const u = new uPlot(opts, data, chartRef.current);
        uPlotRef.current = u;

        return () => {
            u.destroy();
        };
    }, []); // Init once

    useEffect(() => {
        if (uPlotRef.current) {
            uPlotRef.current.setData(data);
        }
    }, [data]);

    return <div ref={chartRef} />;
}
