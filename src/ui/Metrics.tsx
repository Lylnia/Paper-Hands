// src/ui/Metrics.tsx
import { GameState } from '../engine/types';

export function Metrics({ state }: { state: GameState }) {
    const { project } = state;

    return (
        <div className="grid grid-cols-4 gap-4 h-full">
            <MetricBox label="PRICE" value={`$${project.price.toFixed(4)}`} color="text-[#33ff00]" />
            <MetricBox label="MARKET CAP" value={`$${(project.marketCap / 1_000_000).toFixed(2)}M`} color="text-white" />

            <MetricBox label="COMMUNITY" value={project.communityTrust.toFixed(0)} color="text-blue-400" sub="TRUST" />
            <MetricBox label="INSTITUTION" value={project.institutionalTrust.toFixed(0)} color="text-indigo-400" sub="TRUST" />

            <MetricBox label="REAL VOL" value={`$${(project.volume.real / 1000).toFixed(1)}k`} color="text-gray-300" />
            <MetricBox label="FAKE VOL" value={`$${(project.volume.fake / 1000).toFixed(1)}k`} color="text-yellow-500" />

            <div className="col-span-2 border-4 border-[#ff0033] bg-[#1a0005] p-2 flex flex-col justify-center items-center relative overflow-hidden">
                <div className="z-10 text-center">
                    <div className="text-[#ff0033] text-xs font-bold tracking-widest uppercase">RISK LEVEL</div>
                    <div className="text-4xl font-bold text-[#ff0033]">{project.risk.toFixed(0)}%</div>
                </div>
                {/* Risk Bar Background */}
                <div className="absolute bottom-0 left-0 h-2 bg-[#ff0033] transition-all duration-500" style={{ width: `${project.risk}%` }}></div>
            </div>
        </div>
    );
}

function MetricBox({ label, value, color, sub }: any) {
    return (
        <div className="border-4 border-[#333] bg-[#111] p-2 flex flex-col justify-center items-center hover:border-[#555] transition-colors">
            <div className="text-[#666] text-xs font-bold tracking-widest uppercase">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            {sub && <div className="text-[#444] text-[10px] uppercase">{sub}</div>}
        </div>
    );
}
