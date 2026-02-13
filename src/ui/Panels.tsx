// src/ui/Panels.tsx
import { GameState } from '../engine/types';
import { useStore } from '../store';

export function Panels({ state }: { state: GameState }) {
    const { dispatchAction } = useStore();
    const { project } = state;

    return (
        <div className="h-full flex gap-4">

            {/* Market Ops */}
            <div className="flex-1 border-r-4 border-[#333] pr-4">
                <h3 className="text-[#33ff00] text-sm font-bold tracking-widest uppercase mb-4">MARKET OPERATIONS</h3>
                <div className="grid grid-cols-2 gap-4">
                    <PanelButton
                        label="BUY MARKETING"
                        cost="$5,000"
                        desc="+5 Comm. Trust"
                        disabled={project.treasury < 5000}
                        onClick={() => dispatchAction({ type: 'buy_marketing' })}
                        color="green"
                    />
                    <PanelButton
                        label="FAKE VOLUME"
                        cost="$1,000"
                        desc="+FAKE Vol / +RISK"
                        disabled={project.treasury < 1000}
                        onClick={() => dispatchAction({ type: 'buy_fake_volume' })}
                        color="yellow"
                    />
                </div>
            </div>

            {/* Governance / Risk */}
            <div className="flex-1 pl-4">
                <h3 className="text-[#ff0033] text-sm font-bold tracking-widest uppercase mb-4">RISK / GOVERNANCE</h3>
                <div className="grid grid-cols-2 gap-4">
                    <PanelButton
                        label="TEAM SELL (1%)"
                        cost="DUMP"
                        desc="+$Cash / -Trust / +Risk"
                        disabled={project.supply.team <= 0}
                        onClick={() => dispatchAction({ type: 'sell_team_tokens' })}
                        color="red"
                    />

                    {/* Placeholder for future actions */}
                    <div className="border-4 border-[#222] bg-[#111] p-2 flex items-center justify-center text-[#333] text-xs uppercase tracking-widest">
                        LOCKED
                    </div>
                </div>
            </div>
        </div>
    );
}

function PanelButton({ label, cost, desc, disabled, onClick, color }: any) {
    const borderClass = color === 'green' ? 'border-[#33ff00]' : color === 'red' ? 'border-[#ff0033]' : 'border-yellow-500';
    const textClass = color === 'green' ? 'text-[#33ff00]' : color === 'red' ? 'text-[#ff0033]' : 'text-yellow-500';
    const bgHover = color === 'green' ? 'hover:bg-[#33ff00]/20' : color === 'red' ? 'hover:bg-[#ff0033]/20' : 'hover:bg-yellow-500/20';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                border-4 ${borderClass} bg-transparent p-2 text-left relative group transition-all
                disabled:opacity-30 disabled:cursor-not-allowed
                ${bgHover}
            `}
        >
            <div className={`font-bold text-lg leading-none mb-1 ${textClass}`}>{label}</div>
            <div className="text-xs text-[#888]">{cost}</div>

            {/* Tooltip-like effect always visible in this design for clarity */}
            <div className="text-[10px] text-[#666] uppercase mt-1">{desc}</div>
        </button>
    );
}
