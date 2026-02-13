// src/App.tsx
import { useStore } from './store';
import { Dashboard } from './ui/Dashboard';
import { ScenarioType } from './engine/types';

function App() {
    const { initGame, startGame, gameState } = useStore();

    const handleStart = (scenario: ScenarioType) => {
        initGame(scenario);
        // Wait a bit for worker to init then start
        setTimeout(() => startGame(), 100);
    };

    if (!gameState) {
        return (
            <div className="min-h-screen bg-black text-[#33ff00] font-mono flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Scanline Overlay */}
                <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                <h1 className="text-8xl font-bold mb-12 tracking-tighter drop-shadow-[0_0_15px_rgba(51,255,0,0.8)]">PAPER HANDS</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
                    <button onClick={() => handleStart('new_chain')} className="border-4 border-[#33ff00] p-8 hover:bg-[#33ff00]/20 transition-all group text-left relative">
                        <div className="absolute top-0 right-0 bg-[#33ff00] text-black px-2 font-bold opacity-0 group-hover:opacity-100">Recommended</div>
                        <h2 className="text-3xl font-bold mb-4">NEW L1 CHAIN</h2>
                        <p className="text-xl opacity-80 mb-4">Launch a high-tech blockchain. High max supply, low trust.</p>
                        <ul className="list-disc list-inside opacity-70">
                            <li>Supply: 1B</li>
                            <li>Risk: High</li>
                            <li>Potential: Infinite</li>
                        </ul>
                    </button>

                    <button onClick={() => handleStart('existing_token')} className="border-4 border-[#33b5af] text-[#33b5af] p-8 hover:bg-[#33b5af]/20 transition-all text-left">
                        <h2 className="text-3xl font-bold mb-4">UTILITY TOKEN</h2>
                        <p className="text-xl opacity-80 mb-4">A standard ERC-20 token with fixed supply.</p>
                        <ul className="list-disc list-inside opacity-70">
                            <li>Supply: 100M</li>
                            <li>Risk: Low</li>
                            <li>Growth: Steady</li>
                        </ul>
                    </button>

                    <button onClick={() => handleStart('dead_project')} className="border-4 border-[#ff0033] text-[#ff0033] p-8 hover:bg-[#ff0033]/20 transition-all text-left">
                        <h2 className="text-3xl font-bold mb-4">DEAD PROJECT</h2>
                        <p className="text-xl opacity-80 mb-4">Take over a rugged DAO. Can you revive it?</p>
                        <ul className="list-disc list-inside opacity-70">
                            <li>Trust: 0%</li>
                            <li>Treasury: $50k</li>
                            <li>Difficulty: HARD</li>
                        </ul>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-[#050505] text-[#e0e0e0] font-mono overflow-hidden flex flex-col">
            <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
            <Dashboard state={gameState} />
        </div>
    );
}

export default App;
