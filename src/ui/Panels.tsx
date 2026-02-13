// src/ui/Panels.tsx
import { GameState } from '../engine/types';
import { useStore } from '../store';

interface PanelProps {
    state: GameState;
}

export function TreasuryPanel({ state }: PanelProps) {
    const { dispatchAction } = useStore();
    const { project } = state;

    return (
        <div className="pixel-card">
            <h2 className="text-xl font-bold text-primary uppercase mb-4 tracking-widest border-b-2 border-primary/30 pb-2">
                <span className="mr-2">💰</span>OPS Center
            </h2>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#050505] p-3 border-2 border-[#333]">
                        <div className="text-sm text-muted uppercase">Runway</div>
                        <div className="text-2xl text-white">{(project.treasuryUSD / 2000).toFixed(1)} <span className="text-sm text-muted">mo</span></div>
                    </div>
                    <div className="bg-[#050505] p-3 border-2 border-[#333]">
                        <div className="text-sm text-muted uppercase">Dev Wallet</div>
                        <div className="text-2xl text-white">{(project.teamTokensRemaining / 1_000_000).toFixed(2)}M</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => dispatchAction({ type: 'buy_marketing' })}
                        disabled={project.treasuryUSD < 5000}
                        className="w-full pixel-btn pixel-btn-primary disabled:opacity-50 disabled:shadow-none disabled:bg-gray-900 disabled:border-gray-700 disabled:text-gray-500"
                    >
                        <div>BUY MARKETING</div>
                        <div className="text-sm opacity-80">Cost: $5k</div>
                    </button>
                    <button
                        onClick={() => dispatchAction({ type: 'team_sell' })}
                        className="w-full pixel-btn pixel-btn-danger"
                    >
                        <div>MARKET DUMP</div>
                        <div className="text-sm opacity-80">Sell 1% supply</div>
                    </button>
                </div>
            </div>
        </div>
    );
}

export function RiskPanel({ state }: PanelProps) {
    const { dispatchAction } = useStore();
    const { project } = state;

    return (
        <div className="pixel-card">
            <h2 className="text-xl font-bold text-danger uppercase mb-4 tracking-widest border-b-2 border-danger/30 pb-2">
                <span className="mr-2">⚠️</span>Risk Mgmt
            </h2>

            <div className="mb-6">
                <label className="text-sm text-muted block mb-2 uppercase tracking-wider">Fake Volume Share</label>
                <div className="w-full bg-[#000] h-6 border-2 border-[#333] relative">
                    {/* Striped warning pattern for high values */}
                    <div className="h-full bg-purple-600 transition-all duration-300"
                        style={{
                            width: `${project.rolling.fakeShare * 100}%`,
                            backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.15) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.15) 50%,rgba(0,0,0,.15) 75%,transparent 75%,transparent)',
                            backgroundSize: '10px 10px'
                        }}>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-black drop-shadow-md">
                        {(project.rolling.fakeShare * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => dispatchAction({ type: 'wash_trade' })}
                    disabled={project.treasuryUSD < 1000}
                    className="w-full pixel-btn pixel-btn-warning text-black"
                >
                    <div>WASH TRADE</div>
                    <div className="text-sm opacity-80">Cost: $1k</div>
                </button>
            </div>

            {project.regulationStage !== 'normal' && (
                <div className="mt-6 p-4 bg-red-900/40 border-2 border-red-500 text-red-400 text-sm font-bold uppercase animate-pulse text-center">
                    !!! REGULATOR WATCH !!!
                    <div className="text-xs mt-1 text-red-300">Stage: {project.regulationStage}</div>
                </div>
            )}
        </div>
    );
}
