// src/ui/Dashboard.tsx
import { GameState } from '../engine/types';
import { Chart } from './components/Chart';
import { Panels } from './Panels';
import { Leaderboard } from './Leaderboard';
import { Metrics } from './Metrics';
import { Log } from './Log';

interface DashboardProps {
    state: GameState;
}

export function Dashboard({ state }: DashboardProps) {
    const { project, market } = state;

    return (
        <div className="flex-1 p-4 grid grid-cols-12 grid-rows-12 gap-4 h-full max-h-screen">

            {/* HEADER: 2 Rows */}
            <header className="col-span-12 row-span-1 flex justify-between items-center border-b-4 border-[#333] px-2">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-4xl font-bold text-[#33ff00] tracking-widest drop-shadow-md">PAPER HANDS <span className="text-sm text-[#666]">TERMINAL v1.0</span></h1>
                    <div className="text-xl text-[#888]">
                        TICK: <span className="text-white">{project.tick}</span>
                    </div>
                </div>

                <div className="flex gap-8 text-xl font-bold">
                    <div className={market.regime === 'bull' ? 'text-green-400' : 'text-red-500'}>
                        MARKET: {market.regime.toUpperCase()}
                    </div>
                    <div>
                        TREASURY: <span className="text-[#33ff00]">${project.treasury.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            {/* LEFT COL (Metrics & Chart): 7 Rows, 8 Cols */}
            <div className="col-span-8 row-span-7 flex flex-col gap-4">
                {/* Top Metrics Row */}
                <div className="h-1/3">
                    <Metrics state={state} />
                </div>

                {/* Main Chart Area */}
                <div className="h-2/3 border-4 border-[#333] bg-[#0a0a0a] relative p-1 group">
                    <div className="absolute top-2 left-2 z-10 bg-black/80 px-2 py-1 border border-[#33ff00] text-[#33ff00] text-xs">PRICE ACTION (1H)</div>
                    <Chart state={state} />
                </div>
            </div>

            {/* RIGHT COL (Leaderboard & Logs): 11 Rows (Full height minus header), 4 Cols */}
            <div className="col-span-4 row-span-11 flex flex-col gap-4">
                <div className="flex-1 border-4 border-[#333] bg-[#0a0a0a] p-2 flex flex-col">
                    <Leaderboard state={state} />
                </div>
                <div className="h-1/3 border-4 border-[#333] bg-[#0a0a0a] p-2 flex flex-col">
                    <Log state={state} />
                </div>
            </div>

            {/* BOTTOM ROW (Action Panels): 4 Rows, 8 Cols */}
            <div className="col-span-8 row-span-4 border-4 border-[#333] bg-[#0a0a0a] p-4">
                <Panels state={state} />
            </div>

        </div>
    );
}
