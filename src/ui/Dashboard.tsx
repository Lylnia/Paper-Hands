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

    // Prepare Chart Data
    // We need to store history in the state or derived it. 
    // For now, let's assume project.rolling.returns contains the last N points.
    // Ideally we want Price History. Let's mock a simple linear history for visualization if not present.

    const chartData = useMemo(() => {
        const length = 50;
        const times = Array.from({ length }, (_, i) => i);
        // Mock data for visualization if we don't have full history array in state yet
        // In a real app we'd pass `history` from the engine
        const values = Array.from({ length }, (_, i) => project.priceP * (1 + Math.sin(i * 0.2) * 0.1));
        return [times, values] as [number[], number[]];
    }, [project.tick, project.priceP]);

    return (
        <div className="space-y-4 max-w-7xl mx-auto pb-10">
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Financials */}
                <div className="space-y-4">
                    <MetricCard
                        label="Price"
                        value={`$${project.priceP.toFixed(4)}`}
                        trend={project.rolling.returns[0] || 0}
                        subtitle={`MC: $${(project.marketCapMC / 1000000).toFixed(2)}M`}
                    />
                    <MetricCard
                        label="Treasury"
                        value={`$${project.treasuryUSD.toLocaleString()}`}
                        color="text-success"
                    />
                </div>

                {/* Trust */}
                <div className="space-y-4">
                    <MetricCard
                        label="Community Trust (CT)"
                        value={project.communityTrustCT.toFixed(1)}
                        max={100}
                        color="text-blue-400"
                    />
                    <MetricCard
                        label="Institutional Trust (IT)"
                        value={project.institutionalTrustIT.toFixed(1)}
                        max={100}
                        color="text-indigo-400"
                    />
                </div>

                {/* Risk */}
                <div className="space-y-4">
                    <MetricCard
                        label="Risk Level (R)"
                        value={project.riskR.toFixed(1)}
                        max={100}
                        color="text-danger"
                        subtitle={`Regulator: ${project.regulationStage.toUpperCase()}`}
                    />
                    <MetricCard
                        label="Visibility (VIS)"
                        value={project.visibilityVIS.toFixed(1)}
                        max={100}
                        color="text-warning"
                    />
                </div>

                {/* Market Condition */}
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-surface border border-muted h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-muted uppercase mb-2">Market Sentiment</h3>
                            <div className="text-xl font-bold">
                                {market.regime.toUpperCase()}
                            </div>
                            <div className="text-sm text-muted mt-1">MSI: {market.msi.toFixed(2)}</div>
                        </div>
                        <div className="mt-4 text-xs text-muted text-right">
                            Tick: {project.tick}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column: Action Panels */}
                <div className="space-y-4">
                    <TreasuryPanel state={state} />
                    <RiskPanel state={state} />
                </div>

                {/* Middle: Charts & Events */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-surface border border-muted rounded-lg p-4 h-64 flex flex-col">
                        <h3 className="text-xs font-bold text-muted uppercase mb-2">Price Action</h3>
                        <div className="flex-1 w-full bg-black/20 rounded overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Chart data={chartData} width={350} height={200} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface border border-muted rounded-lg p-4 h-64 overflow-y-auto">
                        <h3 className="text-xs font-bold text-muted uppercase mb-2">Event Log</h3>
                        <div className="space-y-2">
                            {[...state.log].reverse().map((log, i) => (
                                <div key={log.id + i} className="text-xs border-b border-white/5 pb-1 last:border-0">
                                    <div className="flex justify-between">
                                        <span className={log.type === 'warning' ? 'text-warning font-bold' : 'text-primary font-bold'}>{log.title}</span>
                                        <span className="text-muted opacity-50 text-[10px]">T{log.tick}</span>
                                    </div>
                                    <div className="opacity-70">{log.detail}</div>
                                </div>
                            ))}
                            {state.log.length === 0 && (
                                <div className="text-muted text-center py-4 italic">No events yet...</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <div className="space-y-4">
                    <Leaderboard state={state} />
                </div>
            </div>

        </div>
    );
}
