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
        <div className="bg-surface border border-muted rounded-lg p-4">
            <h2 className="text-sm font-bold text-muted uppercase mb-4">Treasury & Operations</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 p-2 rounded">
                        <div className="text-xs text-muted">Runway</div>
                        <div className="text-lg">{(project.treasuryUSD / 2000).toFixed(1)} months</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded">
                        <div className="text-xs text-muted">Team Tokens</div>
                        <div className="text-lg">{(project.teamTokensRemaining / 1_000_000).toFixed(2)}M</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={() => dispatchAction({ type: 'buy_marketing' })}
                        disabled={project.treasuryUSD < 5000}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold py-2 rounded"
                    >
                        BUY MARKETING ($5k)
                    </button>
                    <button
                        onClick={() => dispatchAction({ type: 'team_sell' })}
                        className="w-full bg-red-900/50 hover:bg-red-800 border border-red-700 text-red-200 text-xs font-bold py-2 rounded"
                    >
                        DUMP TEAM TOKENS (1%)
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
        <div className="bg-surface border border-muted rounded-lg p-4">
            <h2 className="text-sm font-bold text-muted uppercase mb-4">Risk & Ops</h2>

            <div className="mb-4">
                <label className="text-xs text-muted block mb-1">Fake Volume Share</label>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${project.rolling.fakeShare * 100}%` }}></div>
                </div>
            </div>

            <div className="space-y-2">
                <button
                    onClick={() => dispatchAction({ type: 'wash_trade' })}
                    disabled={project.treasuryUSD < 1000}
                    className="w-full bg-purple-900/30 hover:bg-purple-800 border border-purple-700 text-purple-200 text-xs font-bold py-2 rounded"
                >
                    WASH TRADE ($1k)
                </button>
            </div>

            {project.regulationStage !== 'normal' && (
                <div className="mt-4 p-2 bg-red-900/20 border border-red-500 rounded text-red-400 text-xs">
                    WARNING: REGULATOR ACTIVE ({project.regulationStage})
                </div>
            )}
        </div>
    );
}
