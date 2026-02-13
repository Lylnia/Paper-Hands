// src/ui/Leaderboard.tsx
import { GameState } from '../engine/types';

interface LeaderboardProps {
    state: GameState;
}

export function Leaderboard({ state }: LeaderboardProps) {
    const { project, market } = state;
    const competitors = market.competitors;

    // Mix player into competitors for ranking display
    const allProjects = [
        { id: project.id, name: project.name, mc: project.marketCapMC, trust: (project.communityTrustCT + project.institutionalTrustIT) / 2, isPlayer: true },
        ...competitors.map(c => ({ id: c.id, name: c.name, mc: c.mc, trust: c.trust, isPlayer: false }))
    ].sort((a, b) => b.mc - a.mc); // Simple MC sort for now

    return (
        <div className="bg-surface border border-muted rounded-lg p-4">
            <h2 className="text-sm font-bold text-muted uppercase mb-4">Market Leaderboard</h2>
            <div className="space-y-2">
                {allProjects.map((p, i) => (
                    <div
                        key={p.id}
                        className={`flex justify-between items-center p-2 rounded ${p.isPlayer ? 'bg-primary/20 border border-primary/50' : 'bg-black/20'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-muted font-mono w-6 text-right">#{i + 1}</span>
                            <span className={p.isPlayer ? 'font-bold text-white' : 'text-gray-400'}>{p.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="font-mono">${(p.mc / 1_000_000).toFixed(2)}M</div>
                            <div className="text-xs text-muted">Trust: {p.trust.toFixed(0)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
