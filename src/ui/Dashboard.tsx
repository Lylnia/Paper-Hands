// src/ui/Dashboard.tsx
import { GameState } from '../engine/types';
import { MetricCard } from './components/MetricCard';
import { Leaderboard } from './Leaderboard';
import { TreasuryPanel, RiskPanel } from './Panels';
import { Chart } from './components/Chart';
import { useMemo } from 'react';

interface DashboardProps {
    state: GameState;
}

export function Dashboard({ state }: DashboardProps) {
    const { project, market } = state;

    const chartData = useMemo(() => {
        const length = 50;
        const times = Array.from({ length }, (_, i) => i);
        const values = Array.from({ length }, (_, i) => project.priceP * (1 + Math.sin(i * 0.2 + project.tick * 0.1) * 0.05));
        return [times, values] as [number[], number[]];
    }, [project.tick, project.priceP]);

    return (
        <div className="space-y-6 pb-12">
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Financials */}
                <div className="gap-6 flex flex-col">
                    <MetricCard
                        label="Token Price"
                        value={`$${project.priceP.toFixed(4)}`}
                        trend={project.rolling.returns[0] || 0}
                        color="text-primary"
                        subtitle="USD"
                    />
                    <MetricCard
                        label="Treasury"
                        value={`$${(project.treasuryUSD / 1000).toFixed(1)}k`}
                        color="text-success"
                    />
                </div>

                {/* Trust */}
                <div className="gap-6 flex flex-col">
                    <MetricCard
                        label="Community"
                        value={project.communityTrustCT.toFixed(0)}
                        max={100}
                        color="text-blue-400"
                        subtitle="TRUST"
                    />
                    <MetricCard
                        label="Institutions"
                        value={project.institutionalTrustIT.toFixed(0)}
                        max={100}
                        color="text-indigo-400"
                        subtitle="TRUST"
                    />
                </div>

                {/* Risk */}
                <div className="gap-6 flex flex-col">
                    <MetricCard
                        label="Risk Level"
                        value={project.riskR.toFixed(0)}
                        max={100}
                        color="text-danger"
                        subtitle="SYSTEMIC"
                    />
                    <MetricCard
                        label="Hype/Vis"
                        value={project.visibilityVIS.toFixed(0)}
                        max={100}
                        color="text-warning"
                        subtitle="VISIBILITY"
                    />
                </div>

                {/* Market Condition */}
                <div className="pixel-card flex flex-col justify-center items-center text-center">
                    <h3 className="text-xl font-bold text-muted uppercase mb-4 tracking-widest">Market State</h3>
                    <div className={`text-5xl font-bold mb-2 ${market.regime === 'bull' ? 'text-primary' : market.regime === 'bear' ? 'text-danger' : 'text-warning'}`}>
                        {market.regime.toUpperCase()}
                    </div>
                    <div className="text-xl font-mono text-muted">MSI: {market.msi.toFixed(2)}</div>

                    <div className="mt-8 border-t-2 border-[#333] pt-4 w-full">
                        <div className="text-sm text-muted uppercase">Global Tick</div>
                        <div className="text-2xl font-mono">{project.tick}</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Action Panels */}
                <div className="space-y-6">
                    <TreasuryPanel state={state} />
                    <RiskPanel state={state} />
                </div>

                {/* Middle: Charts & Events */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="pixel-card h-80 p-0 flex flex-col overflow-hidden">
                        <div className="p-2 border-b-2 border-[#333] bg-[#0a0a0a] flex justify-between items-center">
                            <span className="text-primary font-bold uppercase tracking-wider">Price Action (1H)</span>
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        </div>
                        <div className="flex-1 w-full bg-[#050505] relative p-2">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Chart data={chartData} width={450} height={280} color="#33ff00" />
                            </div>
                        </div>
                    </div>

                    <div className="pixel-card h-80 flex flex-col">
                        <h3 className="text-xl font-bold text-muted uppercase mb-4 tracking-widest border-b-2 border-[#333] pb-2">
                            System Logs
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-sm">
                            {[...state.log].reverse().map((log, i) => (
                                <div key={log.id + i} className="border-b border-[#222] pb-1 last:border-0 hover:bg-[#222] transition-colors p-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className={`uppercase font-bold tracking-wider ${log.type === 'warning' ? 'text-warning' :
                                                log.type === 'crisis' ? 'text-danger animate-pulse' :
                                                    'text-primary'
                                            }`}>
                                            {log.type === 'crisis' ? '!! ' : '> '}{log.title}
                                        </span>
                                        <span className="text-[#444] text-xs">T.{log.tick}</span>
                                    </div>
                                    <div className="text-[#888] pl-3 leading-tight mt-1">{log.detail}</div>
                                </div>
                            ))}
                            {state.log.length === 0 && (
                                <div className="text-[#333] text-center py-12 italic">Waiting for events...</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <div className="space-y-6">
                    <Leaderboard state={state} />
                </div>
            </div>
        </div>
    );
}
