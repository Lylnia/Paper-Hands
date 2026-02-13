// src/App.tsx
import { useEffect } from 'react';
import { useStore } from './store';
import { Dashboard } from './ui/Dashboard';

function App() {
    const { initGame, startGame, stopGame, isRunning, gameState } = useStore();

    useEffect(() => {
        initGame();
    }, []);

    return (
        <div className="min-h-screen font-mono text-lg p-2 md:p-6 text-[#e0e0e0] flex flex-col max-w-[1600px] mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-center mb-6 border-b-2 border-[#333] pb-4 gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-widest text-primary pixel-text-shadow leading-none">
                        PAPER HANDS
                    </h1>
                    <div className="text-muted text-sm tracking-widest uppercase mt-1">
                        Crypto CEO Simulator v1.0
                    </div>
                </div>

                <div className="flex gap-4 items-center pixel-card !p-2 !border-primary/30">
                    <div className="flex items-center gap-3 px-2">
                        <div className={`w-4 h-4 border-2 border-current ${isRunning ? 'bg-primary animate-pulse text-primary' : 'bg-red-900 text-red-500'}`}></div>
                        <span className="text-xl uppercase tracking-widest">{isRunning ? 'LIVE' : 'PAUSED'}</span>
                    </div>

                    <button
                        onClick={isRunning ? stopGame : startGame}
                        className={`pixel-btn ${isRunning ? 'pixel-btn-danger' : 'pixel-btn-primary'} text-lg min-w-[120px]`}
                    >
                        {isRunning ? 'HALT' : 'RESUME'}
                    </button>
                </div>
            </header>

            {!gameState ? (
                <div className="flex-1 flex flex-col justify-center items-center gap-4">
                    <div className="text-4xl animate-pulse text-primary">INITIALIZING SYSTEM...</div>
                    <div className="w-64 h-8 border-2 border-[#333] p-1">
                        <div className="h-full bg-primary animate-[width_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                    </div>
                </div>
            ) : (
                <main className="flex-1">
                    <Dashboard state={gameState} />
                </main>
            )}
        </div>
    );
}

export default App;
