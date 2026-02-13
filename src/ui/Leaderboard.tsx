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
    ].sort((a, b) => b.mc - a.mc);

    return (
        <div className="pixel-card h-full">
            <h2 className="text-xl font-bold text-primary uppercase mb-4 tracking-widest border-b-2 border-primary/30 pb-2">Top Projects</h2>
            <div className="space-y-3 font-mono">
                {allProjects.map((p, i) => (
                    <div
                        key={p.id}
                        className={`flex justify-between items-center p-2 border-2 ${p.isPlayer
                                ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(51,255,0,0.3)]'
                                : 'bg-black border-[#333]'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`font-bold w-8 text-right text-xl ${i < 3 ? 'text-warning' : 'text-muted'}`}>
                                {i + 1}.
                            </span>
                            <span className={`text-xl truncate max-w-[120px] ${p.isPlayer ? 'text-white font-bold' : 'text-gray-400'}`}>
                                {p.name}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-lg tracking-wider">${(p.mc / 1_000_000).toFixed(2)}M</div>
                            <div className="text-sm text-muted uppercase">Trust: {p.trust.toFixed(0)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
