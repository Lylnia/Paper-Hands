// src/ui/Log.tsx
import { GameState } from '../engine/types';
import { useEffect, useRef } from 'react';

export function Log({ state }: { state: GameState }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="flex-1 flex flex-col overflow-hidden font-mono text-sm relative">
            <h3 className="text-[#666] text-xs font-bold tracking-widest uppercase mb-2 border-b border-[#333] pb-1">SYSTEM LOGS</h3>

            {/* Scanline overlay specific to log area */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-10 z-10"></div>

            <div className="flex-1 overflow-y-auto pr-2" ref={scrollRef}>
                {[...state.log].reverse().map((entry) => (
                    <div key={entry.id} className="mb-1 border-b border-[#222] pb-1 last:border-0 hover:bg-[#222]">
                        <span className="text-[#444] mr-2">T.{entry.tick}</span>
                        <span className={`
                        ${entry.type === 'success' ? 'text-[#33ff00]' : ''}
                        ${entry.type === 'warning' ? 'text-yellow-500' : ''}
                        ${entry.type === 'danger' ? 'text-[#ff0033] font-bold animate-pulse' : ''}
                        ${entry.type === 'info' ? 'text-[#aaa]' : ''}
                    `}>
                            {entry.type === 'danger' ? '!! ' : '> '}
                            {entry.message}
                        </span>
                    </div>
                ))}
                {state.log.length === 0 && <div className="text-[#333] italic">Waiting for input...</div>}
            </div>
        </div>
    );
}
