// src/ui/components/Chart.tsx
import { useEffect, useRef, useMemo } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { GameState } from '../../engine/types';

export function Chart({ state }: { state: GameState }) {
    const chartRef = useRef<HTMLDivElement>(null);
    const uPlotRef = useRef<uPlot | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate data from state
    const data = useMemo(() => {
        // If we don't have real price history array in state yet, mock it based on tick
        // For MVP we just show a rolling window of recent volume or random walk
        // Let's create a stable random walk based on tick for visualization if history is missing
        const length = 60;
        const times = Array.from({ length }, (_, i) => state.project.tick - length + i);
        // Mock viz: sine wave modulated by price
        const values = times.map(t => state.project.price * (1 + Math.sin(t * 0.2) * 0.05));

        return [times, values] as [number[], number[]];
    }, [state.project.tick, state.project.price]);

    useEffect(() => {
        if (!chartRef.current || !containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();

        const opts: uPlot.Options = {
            width: width - 4, // account for borders
            height: height - 4,
            series: [
                {},
                {
                    stroke: '#33ff00',
                    width: 2,
                    fill: 'rgba(51, 255, 0, 0.1)',
                },
            ],
            axes: [
                { grid: { show: false }, ticks: { show: false } },
                {
                    grid: { stroke: '#333', width: 1, dash: [4, 4] },
                    ticks: { show: false },
                    points: { show: false }
                }
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
    }, []);

    useEffect(() => {
        if (uPlotRef.current) {
            uPlotRef.current.setData(data);
        }
    }, [data]);

    return <div ref={containerRef} className="w-full h-full flex items-center justify-center"><div ref={chartRef} /></div>;
}
